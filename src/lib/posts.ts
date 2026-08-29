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

export function categoryList(posts: Post[]): CatInfo[] {
  const m = new Map<string, number>();
  for (const p of posts) {
    const c = p.data.category || '기타';
    m.set(c, (m.get(c) || 0) + 1);
  }
  return [...m.entries()]
    .map(([name, count]) => ({ name, slug: catSlug(name), count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
