import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

// Lit la sortie de `npm run build` : lancer le build avant ce test
const slug = 'creer-un-parcours-agility-chien-dans-sa-commune';
const fichier = `dist/client/blog/${slug}/index.html`;
const page = existsSync(fichier) ? readFileSync(fichier, 'utf8') : '';
const corps = page.split('<div class="prose')[1]?.split('<aside class="mt-12')[0] ?? '';

test('article parcours agility : construit, title, H1, plan du site, liste du blog', () => {
  assert.ok(page, `${fichier} absent du build`);
  assert.match(page, /<title>[^<]*parcours agility chien[^<]*<\/title>/i);
  assert.match(page.match(/<h1[\s>][\s\S]*?<\/h1>/)?.[0] ?? '', /parcours agility chien/i);
  assert.match(readFileSync('dist/client/sitemap-0.xml', 'utf8'), new RegExp(`<loc>https://www\\.woof-parcs\\.fr/blog/${slug}/</loc>`));
  assert.ok(readFileSync('dist/client/blog/index.html', 'utf8').includes(`href="/blog/${slug}/"`));
});

test('article parcours agility : liens internes et phrase fabricant', () => {
  for (const href of ['/agility/', '/caniparc/', '/prix-parc-canin/', '/produits/parcours-agility-essentiel/', '/produits/parcours-agility-intermediaire/', '/produits/parcours-agility-complet/']) {
    assert.ok(corps.includes(`href="${href}"`), href);
  }
  assert.match(corps, /Woof!, fabricant/);
});
