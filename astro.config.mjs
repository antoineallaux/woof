// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://www.woof-parcs.fr',
  // 'ignore' (et non 'always') : requis pour les routes API Keystatic ;
  // la canonicalisation avec slash reste assurée par Vercel (308) et le sitemap
  trailingSlash: 'ignore',
  adapter: vercel(),
  integrations: [
    react(),
    mdx(),
    // pages légales exclues : bloquées par robots.txt, incohérent de les déclarer
    sitemap({
      filter: (page) =>
        !['/cgv/', '/confidentialite/', '/mentions-legales/'].some((p) => page.endsWith(p)),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
