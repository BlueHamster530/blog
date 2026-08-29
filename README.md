# BlueHamster 블로그 (Astro + GitHub Pages)

`../output/` 에 생성된 글을 정적 블로그로 빌드해 GitHub Pages로 자동 발행합니다.

- 주소: `https://<USERNAME>.github.io/blog`
- 생성기: Astro (정적)
- 배포: `main` 브랜치에 push → GitHub Actions가 빌드·배포

## 구조

```
autoblog/
├─ output/<slug>/draft.md   # 블로그 스킬이 만드는 초안 (로컬, git 제외)
│           └─ images/*.png
└─ site/                     # ← 이 폴더가 GitHub 'blog' 저장소
   ├─ scripts/sync-posts.mjs # output/ → src/content/blog/ 로 변환
   ├─ src/content/blog/*.md  # 동기화된 글 (커밋됨)
   ├─ public/images/<slug>/  # 동기화된 이미지 (커밋됨)
   └─ .github/workflows/deploy.yml
```

`draft.md` 본문의 커스텀 이미지 블록

```
:::image hero
<영문 프롬프트>
:::
```

은 sync 시 `![hero](/blog/images/<slug>/hero.png)` 로 자동 변환됩니다.

## 새 글 발행하기

```bash
# 1) 블로그 스킬로 ../output/<slug>/ 에 글+이미지 생성
# 2) output 을 사이트로 동기화
npm run sync
# 3) 로컬 확인
npm run dev        # http://localhost:4321/blog
# 4) 커밋 & 푸시 → 자동 배포
git add -A && git commit -m "post: <제목>" && git push
```

## 명령어

| 명령 | 설명 |
|---|---|
| `npm run sync` | `../output` 의 글을 사이트 콘텐츠로 변환·복사 |
| `npm run dev` | sync 후 개발 서버 |
| `npm run build` | sync 후 정적 빌드 (`dist/`) |
| `npm run preview` | 빌드 결과 미리보기 |

> CI에는 `output/` 이 없으므로 sync는 자동으로 건너뛰고 **커밋된 콘텐츠**로 빌드합니다.

## 최초 1회 설정

1. `astro.config.mjs` 의 `site: 'https://USERNAME.github.io'` 에서 `USERNAME` 을 실제 GitHub 유저명으로 변경
2. GitHub에 **`blog`** 이름으로 저장소 생성
3. 이 `site/` 폴더를 그 저장소로 push
4. 저장소 **Settings → Pages → Source: GitHub Actions** 선택
