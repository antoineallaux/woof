import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Lit la sortie de `npm run build` : lancer le build avant ce test
const page = readFileSync('dist/client/agility/index.html', 'utf8');
const texte = page.replace(/<[^>]+>/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');

test('/agility/ : title, un seul H1, canonique, FAQPage identique au texte visible', () => {
  assert.match(page, /<title>Parcours agility chien pour collectivités \| Woof!<\/title>/);
  const h1 = page.match(/<h1[\s>][\s\S]*?<\/h1>/g);
  assert.equal(h1?.length, 1);
  assert.match(h1[0], /Parcours agility chien pour collectivités/);
  assert.match(page, /<link rel="canonical" href="https:\/\/www\.woof-parcs\.fr\/agility\/">/);
  const ldjson = [...page.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));
  const faq = ldjson.find((s) => s['@type'] === 'FAQPage');
  assert.ok(faq && faq.mainEntity.length >= 5);
  for (const q of faq.mainEntity) {
    assert.ok(texte.includes(q.name), q.name);
    assert.ok(texte.includes(q.acceptedAnswer.text), q.name);
  }
});

test('/agility/ : les 3 parcours, leurs fiches et le maillage', () => {
  for (const nom of ['Dog Park 1', 'Dog Park 2', 'Dog Park 3']) assert.ok(page.includes(nom), nom);
  for (const href of [
    '/produits/parcours-agility-essentiel/',
    '/produits/parcours-agility-intermediaire/',
    '/produits/parcours-agility-complet/',
    '/caniparc/',
    '/produits/',
    '/devis/',
  ]) {
    assert.ok(page.includes(`href="${href}"`), href);
  }
  for (const img of page.match(/<img [^>]*>/g) ?? []) assert.match(img, /alt="[^"]+"/, img);
});
