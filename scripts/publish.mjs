// output/ 의 글을 사이트로 동기화하고 커밋·push 하여 GitHub Pages로 발행.
// 사용: node scripts/publish.mjs "post: 글 제목"
//       npm run publish -- "post: 글 제목"
// 메시지 생략 시 기본값 사용. 변경사항이 없으면 커밋을 건너뛴다.

import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const msg = process.argv[2] || 'post: update blog';

// Windows에서 git.exe 를 shell 없이 실행 (shell:true 는 인자 공백을 쪼갬).
// node/git 는 PATH의 실행파일이라 shell 불필요.
const GIT = process.platform === 'win32' ? 'git.exe' : 'git';
const NODE = process.execPath; // 현재 node 실행경로

function run(cmd, args) {
  console.log(`$ ${cmd} ${args.join(' ')}`);
  execFileSync(cmd, args, { cwd: SITE_ROOT, stdio: 'inherit' });
}

// 1) output/ → src/content/blog, public/images 동기화
run(NODE, ['scripts/sync-posts.mjs']);

// 2) 변경 스테이징
run(GIT, ['add', '-A']);

// 3) 변경사항 있을 때만 커밋
let hasChanges = true;
try {
  execFileSync(GIT, ['diff', '--cached', '--quiet'], { cwd: SITE_ROOT });
  hasChanges = false; // exit 0 = 차이 없음
} catch {
  hasChanges = true; // exit 1 = 차이 있음
}

if (!hasChanges) {
  console.log('\n변경사항 없음 — 커밋/푸시를 건너뜁니다.');
  process.exit(0);
}

run(GIT, ['commit', '-m', msg]);

// 4) push → GitHub Actions가 자동 빌드·배포
run(GIT, ['push']);

console.log('\n발행 완료 → https://bluehamster530.github.io/blog/ (1~2분 뒤 반영)');
