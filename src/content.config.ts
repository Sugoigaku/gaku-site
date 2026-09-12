import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const knowledge = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/knowledge' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['Azure', 'Identity']),
    tags: z.array(z.string()),
    publishedAt: z.coerce.date(),
    reviewedAt: z.coerce.date(),
  }),
});

export const collections = { knowledge };