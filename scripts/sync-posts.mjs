// output/<slug>/draft.md  ->  site/src/content/blog/<slug>.md
// output/<slug>/images/*  ->  site/public/images/<slug>/*
//
// 커스텀 이미지 블록을 표준 마크다운 이미지로 변환:
//   :::image hero
//   <영문 프롬프트...>
//   :::
//   ->  ![hero](/blog/images/<slug>/hero.png)
//
// 실행: npm run sync  (dev/build 시 자동 실행)

import { readdir, readFile, writeFile, mkdir, copyFile, rm, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(SITE_ROOT, '..');
const OUTPUT_DIR = path.join(REPO_ROOT, 'output');
const CONTENT_DIR = path.join(SITE_ROOT, 'src', 'content', 'blog');
const PUBLIC_IMG_DIR = path.join(SITE_ROOT, 'public', 'images');

const BASE = '/blog'; // astro.config.mjs 의 base 와 일치시킬 것

/** output/<slug>/images 안에서 <name> 에 해당하는 파일명을 찾는다 (확장자 무관) */
async function resolveImageFile(imagesDir, name) {
  if (!existsSync(imagesDir)) return null;
  const files = await readdir(imagesDir);
  // 정확히 name.<ext>
  const exact = files.find((f) => path.parse(f).name === name);
  return exact ?? null;
}

/** 본문의 :::image 블록을 표준 마크다운 이미지로 치환 */
async function transformImages(body, slug, imagesDir) {
  const re = /:::image\s+(\S+)[^\n]*\n[\s\S]*?:::/g;
  const missing = [];
  let out = '';
  let last = 0;
  let m;
  while ((m = re.exec(body)) !== null) {
    out += body.slice(last, m.index);
    const name = m[1];
    const file = await resolveImageFile(imagesDir, name);
    if (file) {
      out += `![${name}](${BASE}/images/${slug}/${file})`;
    } else {
      // 이미지가 아직 없으면 블록을 주석으로 남겨 빌드가 깨지지 않게 함
      out += `<!-- 이미지 없음: ${name} (output/${slug}/images/${name}.* 확인) -->`;
      missing.push(name);
    }
    last = re.lastIndex;
  }
  out += body.slice(last);
  return { out, missing };
}

async function copyImages(imagesDir, slug) {
  if (!existsSync(imagesDir)) return 0;
  const dest = path.join(PUBLIC_IMG_DIR, slug);
  await mkdir(dest, { recursive: true });
  const files = await readdir(imagesDir);
  let n = 0;
  for (const f of files) {
    const src = path.join(imagesDir, f);
    if ((await stat(src)).isFile()) {
      await copyFile(src, path.join(dest, f));
      n++;
    }
  }
  return n;
}

function splitFrontmatter(raw) {
  if (!raw.startsWith('---')) return null;
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return null;
  const fm = raw.slice(3, end).replace(/^\r?\n/, '');
  const body = raw.slice(end + 4).replace(/^\r?\n/, '');
  return { fm, body };
}

async function main() {
  // output/ 이 없으면 (예: CI 환경) 이미 커밋된 콘텐츠를 그대로 두고 종료.
  // 반드시 삭제 전에 검사할 것.
  if (!existsSync(OUTPUT_DIR)) {
    console.log(`output/ 없음 (${OUTPUT_DIR}) — 커밋된 콘텐츠를 그대로 사용합니다.`);
    return;
  }

  // output/ 이 있으면 동기화 결과를 깨끗이 비우고 다시 생성
  await rm(CONTENT_DIR, { recursive: true, force: true });
  await rm(PUBLIC_IMG_DIR, { recursive: true, force: true });
  await mkdir(CONTENT_DIR, { recursive: true });
  await mkdir(PUBLIC_IMG_DIR, { recursive: true });

  const entries = await readdir(OUTPUT_DIR, { withFileTypes: true });
  let count = 0;
  const warnings = [];

  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const slug = e.name;
    const draft = path.join(OUTPUT_DIR, slug, 'draft.md');
    if (!existsSync(draft)) continue;

    const raw = await readFile(draft, 'utf8');
    const parts = splitFrontmatter(raw);
    if (!parts) {
      warnings.push(`${slug}: frontmatter 파싱 실패 — 건너뜀`);
      continue;
    }

    const imagesDir = path.join(OUTPUT_DIR, slug, 'images');
    const { out: newBody, missing } = await transformImages(parts.body, slug, imagesDir);
    const copied = await copyImages(imagesDir, slug);

    if (missing.length) warnings.push(`${slug}: 누락 이미지 [${missing.join(', ')}]`);

    // 대표 이미지(썸네일): 'hero' 우선, 없으면 첫 이미지
    let thumb = null;
    if (existsSync(imagesDir)) {
      const imgs = (await readdir(imagesDir)).filter((f) => /\.(png|jpe?g|webp|gif|avif)$/i.test(f));
      const hero = imgs.find((f) => path.parse(f).name === 'hero') ?? imgs.sort()[0];
      if (hero) thumb = `${BASE}/images/${slug}/${hero}`;
    }
    const fm = thumb ? `${parts.fm}\nthumbnail: "${thumb}"` : parts.fm;

    const finalDoc = `---\n${fm}\n---\n\n${newBody}`;
    await writeFile(path.join(CONTENT_DIR, `${slug}.md`), finalDoc, 'utf8');
    count++;
    console.log(`  ✓ ${slug}  (이미지 ${copied}개)`);
  }

  console.log(`\n동기화 완료: 글 ${count}개`);
  if (warnings.length) {
    console.log('\n경고:');
    for (const w of warnings) console.log(`  - ${w}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
