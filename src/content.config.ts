import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Title/description dédiés aux SERP (≤60 / ≤160 car.), repli sur title/description
    seoTitle: z.string().max(65).optional(),
    seoDescription: z.string().max(165).optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    image: z.string(),
    imageAlt: z.string(),
    category: z.string().default('Agility canine'),
  }),
});

const products = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),
    // le slug canonique est le nom de fichier (entry id) ; ce champ hérité est ignoré
    slug: z.string().optional(),
    category: z.string(),
    description: z.string(),
    longDescription: z.string(),
    image: z.string(),
    imageAlt: z.string(),
    features: z.array(z.string()),
    ref: z.string(),
    faq: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
    technicalSheet: z.string().nullable().optional(),
    dwgFile: z.string().nullable().optional(),
  }),
});

export const collections = { blog, products };
