// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://www.woof-parcs.fr',
  trailingSlash: 'always',
  adapter: vercel(),
  integrations: [
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
