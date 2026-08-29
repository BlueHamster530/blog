import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional().default(''),
    date: z.coerce.date(),
    tags: z.array(z.string()).optional().default([]),
    category: z.string().optional(),
    thumbnail: z.string().optional(),
    // 원본 frontmatter의 나머지 필드는 무시해도 되도록 허용
    slug: z.string().optional(),
    platforms: z.array(z.string()).optional(),
  }),
});

export const collections = { blog };
