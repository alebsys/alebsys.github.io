import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const schema = z.object({
  title: z.string(),
  // Название серии; в списках статей выводится перед заголовком.
  series: z.string().optional(),
  date: z.coerce.date(),
  description: z.string().optional(),
  // Оригинал в Telegram-канале, если пост оттуда.
  telegram: z.url().optional(),
  // Черновики видны в `astro dev`, в сборку не попадают.
  draft: z.boolean().default(false),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema,
});

// Английские версии: папка статьи называется так же, как русская.
const postsEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts-en' }),
  schema,
});

export const collections = { posts, postsEn };
