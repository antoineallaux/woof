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

// Lot 020 (audit acheteurs du 23/11) : public, packs, achat public ; jamais l'UGAP
const texte = page.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&#39;/g, "'").replace(/\s+/g, ' ');
const faq = [...page.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]))
  .find((s) => s['@type'] === 'FAQPage');
const reponses = faq.mainEntity.map((q: { acceptedAnswer: { text: string } }) => q.acceptedAnswer.text).join(' ');

test('/caniparc/ : section « Pour qui » avec les six publics', () => {
  assert.match(texte, /Pour qui \?/);
  for (const qui of ['Communes et intercommunalités', 'Campings et hôtellerie de plein air', 'Garderies et éducateurs canins', 'Refuges', 'Bailleurs sociaux et promoteurs', 'Hôtels']) {
    assert.ok(texte.includes(qui), qui);
  }
});

test('/caniparc/ : packs petit, moyen et grand caniparc, par surface et modules', () => {
  for (const [pack, surface] of [['Petit caniparc', '300 à 500 m²'], ['Moyen caniparc', '800 à 1 500 m²'], ['Grand caniparc', 'plus de 1 500 m²']]) {
    assert.match(texte, new RegExp(`${pack}[^]{0,400}${surface}`, 'i'), pack);
  }
});

test('/caniparc/ : FAQ achat public (mandat administratif, Chorus Pro, délais, pose sur devis), jamais l\'UGAP', () => {
  assert.match(reponses, /mandat administratif/);
  assert.match(reponses, /Chorus Pro/);
  assert.ok(reponses.includes('3 à 4 semaines en coloris standard, 12 à 15 en coloris spécial'));
  assert.match(reponses, /transport et (la )?pose[^.]*sur devis/i);
  assert.doesNotMatch(page, /UGAP/i);
});

test('/caniparc/ : liens vers /devis/ et /prix-parc-canin/ dans le corps de la page', () => {
  const corps = page.split('<main')[1]?.split('</main>')[0] ?? '';
  for (const href of ['/devis/', '/prix-parc-canin/']) assert.ok(corps.includes(`href="${href}"`), href);
});

test('bloc « Ils nous ont fait confiance » prêt mais masqué tant qu\'aucune référence n\'est validée', () => {
  assert.match(readFileSync('src/components/sections/References.astro', 'utf8'), /Ils nous ont fait confiance/);
  for (const f of ['src/pages/caniparc.astro', 'src/pages/index.astro']) assert.match(readFileSync(f, 'utf8'), /<References \/>/, f);
  for (const f of ['caniparc/index.html', 'index.html']) assert.doesNotMatch(readFileSync(`dist/client/${f}`, 'utf8'), /Ils nous ont fait confiance/, f);
});
