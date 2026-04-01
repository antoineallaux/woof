import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    image: z.string(),
    imageAlt: z.string(),
    category: z.string().default('Agility canine'),
  }),
});

const products = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    category: z.enum(['saut', 'tunnel', 'contact', 'plateforme']),
    description: z.string(),
    longDescription: z.string(),
    image: z.string(),
    imageAlt: z.string(),
    features: z.array(z.string()),
    ref: z.string(),
  }),
});

export const collections = { blog, products };
