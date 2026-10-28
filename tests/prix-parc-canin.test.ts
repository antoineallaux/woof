import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Lit la sortie de `npm run build` : lancer le build avant ce test
const page = readFileSync('dist/client/prix-parc-canin/index.html', 'utf8');
const sitemap = readFileSync('dist/client/sitemap-0.xml', 'utf8');
const article = readFileSync('src/content/blog/combien-coute-un-parc-canin-pour-une-commune-budget-detaille.mdx', 'utf8');

test('/prix-parc-canin/ : title, un seul H1, canonique, FAQPage, plan du site', () => {
  assert.ok(page.includes("<title>Prix d&#39;un parc canin pour une commune : 8 000 à 45 000 €, Woof!</title>"));
  assert.equal(page.match(/<h1[\s>]/g)?.length, 1);
  assert.match(page, /<link rel="canonical" href="https:\/\/www\.woof-parcs\.fr\/prix-parc-canin\/">/);
  const ldjson = [...page.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));
  const faq = ldjson.find((s) => s['@type'] === 'FAQPage');
  assert.ok(faq && faq.mainEntity.length >= 5);
  // balisage identique au texte visible
  const html = (t: string) => t.replace(/'/g, '&#39;');
  for (const q of faq.mainEntity) {
    assert.ok(page.includes(`<span>${html(q.name)}</span>`), q.name);
    assert.ok(page.includes(html(q.acceptedAnswer.text)), q.name);
  }
  assert.match(sitemap, /<loc>https:\/\/www\.woof-parcs\.fr\/prix-parc-canin\/<\/loc>/);
});

test('/prix-parc-canin/ : liens vers caniparc, agility, produits, devis et article', () => {
  for (const href of ['/caniparc/', '/agility/', '/produits/', '/devis/', '/blog/combien-coute-un-parc-canin-pour-une-commune-budget-detaille/']) {
    assert.ok(page.includes(`href="${href}"`), href);
  }
});

test('article budget : le résumé dit 45 000 € et renvoie vers la page prix', () => {
  const resume = article.split('\n')[18];
  assert.match(resume, /\*\*8 000 € et 45 000 €\*\*/);
  assert.ok(resume.includes('](/prix-parc-canin/)'));
});
