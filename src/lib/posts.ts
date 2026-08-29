import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;
export const PAGE_SIZE = 12;

const rawBase = import.meta.env.BASE_URL;
export const BASE = rawBase.endsWith('/') ? rawBase : rawBase + '/';

/** base 를 붙여 URL 생성 (중복 슬래시 방지) */
export function url(pathname = ''): string {
  return BASE + pathname.replace(/^\//, '');
}

/** 카테고리명 -> URL-safe 슬러그 (한글은 유지, 기호만 치환) */
export function catSlug(cat: string): string {
  return (cat || '기타')
    .trim()
    .toLowerCase()
    .replace(/\+/g, 'plus')
    .replace(/#/g, 'sharp')
    .replace(/[\/,]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function getSortedPosts(): Promise<Post[]> {
  const posts = await getCollection('blog');
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export interface CatInfo {
  name: string;
  slug: string;
  count: number;
}

// 세부 카테고리 -> 대분류 매핑. 카드에는 세부 카테고리를 그대로 보여주고,
// 필터(칩/카테고리 페이지)는 이 대분류로 묶는다.
const GROUP_MAP: Record<string, string> = {
  '서버 개발': '백엔드', '백엔드': '백엔드', '데이터베이스': '백엔드',
  '웹 개발': '웹', '웹 기초': '웹', JS: '웹',
  'CS 기초': 'CS', '네트워크': 'CS', '운영체제': 'CS',
  '코딩테스트': '알고리즘', 'C++': '알고리즘', 'C#': '알고리즘',
  '인프라': '인프라', '인프라,클라우드': '인프라', GIT: '인프라',
  AI: 'AI·트렌드', 'AI 개발도구': 'AI·트렌드', '개발 트렌드': 'AI·트렌드',
  '유니티': '게임', '게임': '게임', '타르코프': '게임',
  '커리어': '커리어·회고', '이슈 해결 기록': '커리어·회고', '프로젝트 관리 및 기획': '커리어·회고',
  '공모전': '커리어·회고', '코드잇 스프린트 node 백엔드 6기': '커리어·회고', '개발': '커리어·회고',
};

const GROUP_ORDER = ['백엔드', '웹', 'CS', '알고리즘', '인프라', 'AI·트렌드', '게임', '커리어·회고', '기타'];

export function groupOf(category?: string): string {
  return GROUP_MAP[category || ''] || '기타';
}

/** 대분류 목록 (칩/카테고리 페이지용) — GROUP_ORDER 순 */
export function categoryList(posts: Post[]): CatInfo[] {
  const m = new Map<string, number>();
  for (const p of posts) {
    const g = groupOf(p.data.category);
    m.set(g, (m.get(g) || 0) + 1);
  }
  return [...m.entries()]
    .map(([name, count]) => ({ name, slug: catSlug(name), count }))
    .sort((a, b) => {
      const ia = GROUP_ORDER.indexOf(a.name);
      const ib = GROUP_ORDER.indexOf(b.name);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
}

export function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
