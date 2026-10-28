import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Lit la sortie de `npm run build` : lancer le build avant ce test
const page = readFileSync('dist/client/caniparc/index.html', 'utf8');
const sitemap = readFileSync('dist/client/sitemap-0.xml', 'utf8');

test('/caniparc/ : title, un seul H1, canonique, FAQPage, plan du site', () => {
  assert.match(page, /<title>Caniparc : équipement et aménagement pour collectivités, Woof!<\/title>/);
  assert.equal(page.match(/<h1[\s>]/g)?.length, 1);
  assert.match(page, /<link rel="canonical" href="https:\/\/www\.woof-parcs\.fr\/caniparc\/">/);
  const ldjson = [...page.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));
  const faq = ldjson.find((s) => s['@type'] === 'FAQPage');
  assert.ok(faq && faq.mainEntity.length >= 5);
  assert.match(sitemap, /<loc>https:\/\/www\.woof-parcs\.fr\/caniparc\/<\/loc>/);
});

test('/caniparc/ : maillage vers agility, produits, devis et article des 7 étapes', () => {
  for (const href of ['/agility/', '/produits/', '/devis/', '/contact/', '/blog/de-lidee-a-linauguration-les-7-etapes-dun-projet-de-caniparc/']) {
    assert.ok(page.includes(`href="${href}"`), href);
  }
});
