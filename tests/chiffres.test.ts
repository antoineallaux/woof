import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// Lit la sortie de `npm run build` : lancer le build avant ce test
const racine = 'dist/client';
const fichiers = (readdirSync(racine, { recursive: true }) as string[])
  .filter((f) => /\.(html|txt)$/.test(f) && !f.startsWith('_astro'));

// Texte visible + JSON-LD (contenu des <script>) + attribut content des balises (meta description, og, twitter) ; adresses retirées
const lire = (f: string) => readFileSync(join(racine, f), 'utf8');
const nettoie = (brut: string) => brut
  .replace(/<[^>]*\scontent="([^"]*)"[^>]*>|<[^>]+>/g, (_, c) => ` ${c ?? ''} `)
  .replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&nbsp;| | /g, ' ')
  .replace(/\S*parcours-agility-(essentiel|intermediaire|complet)\S*/g, ' ')
  .replace(/\s+/g, ' ');
const texte = (f: string) => nettoie(lire(f));

const anciens: [string, RegExp][] = [
  // « plus de 15 ans d'expérience » d'un éducateur cité dans un article n'est pas l'ancienneté de Herkules
  ['ancienneté en années', /\b(15|20) ?\+ ?(ans|années)|(depuis|fort de) plus de \d+ ans|plus de 20 ans|20 ans d'expérience/i],
  ['ancienneté Herkules en « 15 ans »', /Herkules[^.?!]{0,80}\b(15|quinze) ans/i],
  // Installation : possible sur devis, jamais promise dans le prix (D-20261117-4)
  ['installation promise dans le prix', /(installation|pose)( est)? (incluse?|comprise?)s?|inclu(ant|t|ent) l['’]installation|incluent[^.]{0,40}\bpose\b|fourniture et pose|installation offerte|posée? par nos soins/i],
  ['nombre de communes', /\d ?\+? ?communes|communes équipées/i],
  // Origine : « fabricant européen » (D-20261123-23)
  ['fabricant français', /fabricants? fran[cç]ais|fabrication fran[cç]aise|made in france/i],
  // Origine : jamais « leader européen » ni « Made in Europe » (D-20261125-3)
  ['leader européen / Made in Europe', /leader europ[ée]en|made in europe/i],
  ['50 m² minimum', /50 ?m²/i],
  ['30 à 60 m²', /30 à 60 ?m²/i],
  ['étiquette Dog Park', /Dog Park \d[^.?!]{0,40}\b(essentiel|intermédiaire|complet)\b|\b(essentiel|intermédiaire|complet)\b[^.?!]{0,40}Dog Park \d/i],
];

test('le build parcourt des pages, du JSON-LD et llms-full.txt', () => {
  assert.ok(fichiers.length > 50, `${fichiers.length} fichiers`);
  assert.ok(fichiers.includes('llms-full.txt'));
  assert.match(texte('index.html'), /"@type"/);
});

for (const [nom, motif] of anciens) {
  test(`aucun ancien chiffre : ${nom}`, () => {
    const trouves = fichiers.flatMap((f) => {
      const m = texte(f).match(motif);
      return m ? [`${f} : « ${m[0]} »`] : [];
    });
    assert.deepEqual(trouves, []);
  });
}

test('« Depuis 2007 » et « à partir de 30 m² » sont affichés', () => {
  assert.match(texte('index.html'), /depuis 2007/i);
  assert.match(texte('qui-sommes-nous/index.html'), /depuis 2007/i);
  assert.match(texte('agility/index.html'), /à partir de 30 m²/i);
});

test('fiches Dog Park : aucune étiquette de niveau, emprise réelle affichée', () => {
  const emprises = { essentiel: '5,48 × 4,11 m', intermediaire: '4,96 × 3,20 m', complet: '2,58 × 2,51 m' };
  for (const [slug, emprise] of Object.entries(emprises)) {
    const page = readFileSync(join(racine, `produits/parcours-agility-${slug}/index.html`), 'utf8');
    const fiche = page.match(/<main[\s\S]*?<\/main>/)?.[0] ?? page;
    const t = texte(`produits/parcours-agility-${slug}/index.html`);
    assert.ok(t.includes(emprise), `${slug} : emprise ${emprise}`);
    assert.doesNotMatch(fiche.replace(/<[^>]+>/g, ' ').replace(/\S*parcours-agility-\S*/g, ' '), /\b(essentiel|intermédiaire|complet)\b/i, slug);
  }
});

// Phrase : coupée aux ponctuations finales, aux fins de bloc (paragraphe, puce, cellule), entre champs JSON-LD et aux lignes de llms-full.txt
const phrases = (f: string) => nettoie(lire(f)
  .replace(/<\/(p|li|h[1-6]|td|th|dt|dd|div|tr|summary|figcaption)>|<br\s*\/?>|<[^>]*\bblock\b[^>]*>|","|":"/g, ' ¶ ')
  .replace(f.endsWith('.txt') ? /\n/g : /^\b$/g, ' ¶ ')).split(/[.?!¶](?:\s|$)/);

// Ligne : chaque <tr> et chaque <div> court (carte, ligne de tableau, version mobile comprise) et chaque titre + puces, cellules lues ensemble, coupé aux seules fins de phrase
const lignes = (f: string) => {
  const brut = lire(f);
  if (f.endsWith('.txt')) return brut.split('\n');
  const ouverts: number[] = [], blocs: string[] = [];
  for (const m of brut.matchAll(/<(\/?)(tr|div)\b[^>]*>/g)) {
    if (!m[1]) ouverts.push(m.index!);
    else if (ouverts.length) blocs.push(nettoie(brut.slice(ouverts.pop()!, m.index! + m[0].length)));
  }
  // Scénario d'article : paragraphe titre suivi de sa liste à puces
  for (const m of brut.matchAll(/<p\b[^>]*>(?:(?!<\/p>)[\s\S])*<\/p>\s*<ul\b[\s\S]*?<\/ul>/g)) blocs.push(nettoie(m[0]));
  // ponytail: seuil de longueur pour ne garder que cartes et lignes, pas les sections entières
  return blocs.filter((b) => b.length <= 400).flatMap((b) => b.split(/[.?!](?:\s|$)/));
};

const associe = (p: string) => /parcours (d'|d’)?agility/i.test(p)
  && [...p.matchAll(/(\d{1,3}(?: \d{3})+|\d+) ?m²/g)].some((m) => Number(m[1].replace(/ /g, '')) > 60);

test('aucune phrase ni ligne de tableau n\'associe un parcours d\'agility à plus de 60 m²', () => {
  const trouves = fichiers.flatMap((f) => [...phrases(f), ...lignes(f)]
    .filter(associe)
    .map((p) => `${f} : « ${p.trim()} »`));
  assert.deepEqual([...new Set(trouves)], []);
});

// Lot 020 (audit acheteurs) : fiches produit au niveau Herkules, sans prix
const produits = readdirSync('src/content/products').map((f) => f.replace(/\.json$/, ''));

test('fiches produit : caractéristiques techniques, garantie, délai, pose sur devis et FAQ, sans prix', () => {
  for (const slug of produits) {
    const t = texte(`produits/${slug}/index.html`);
    assert.match(t, /Caractéristiques techniques/, slug);
    assert.match(t, /Emprise au sol \d[\d ]* × \d[\d ]* mm/, slug);
    assert.match(t, /Hauteur \d[\d ]* mm/, slug);
    assert.match(t, /Garantie 5 ans/, slug);
    assert.ok(t.includes('3 à 4 semaines en coloris standard, 12 à 15 en coloris spécial'), slug);
    assert.match(t, /Transport et pose En plus, sur devis/, slug);
    assert.match(t, /Quel délai de fabrication/, slug);
    assert.doesNotMatch(t, /€|\bà partir de \d/i, slug);
  }
});

test('fiches Dog Park 1, 2, 3 : dimensions de la fiche technique', () => {
  const attendu = { essentiel: ['5 479 × 4 105 mm', '1 110 mm', '13'], intermediaire: ['4 961 × 3 196 mm', '1 113 mm', '18'], complet: ['2 582 × 2 513 mm', '889 mm', '12'] };
  for (const [slug, [emprise, hauteur, massifs]] of Object.entries(attendu)) {
    const t = texte(`produits/parcours-agility-${slug}/index.html`);
    assert.ok(t.includes(`Emprise au sol ${emprise}`), slug);
    assert.ok(t.includes(`Hauteur ${hauteur}`), slug);
    assert.ok(t.includes(`Nombre de massifs ${massifs}`), slug);
  }
});

test('aucun prix nouveau : /caniparc/ garde ses seuls repères, article loi sans montant', () => {
  const montants = [...new Set(texte('caniparc/index.html').match(/\d[\d ]* ?€/g))].sort();
  assert.deepEqual(montants, ['15 000 €', '30 000 €', '45 000 €']);
  assert.doesNotMatch(texte('blog/creation-dun-parc-chien-collectivite-ce-que-dit-la-loi/index.html'), /€/);
});

test('article « ce que dit la loi » : mise à jour 2026, Woof! dans le titre, renvois vers le prix et le devis', () => {
  const page = lire('blog/creation-dun-parc-chien-collectivite-ce-que-dit-la-loi/index.html');
  assert.match(page.match(/<title>(.*?)<\/title>/)![1], /2026.*Woof!/);
  assert.match(page, /"dateModified":"2026-11-23/);
  assert.match(page, /Mis à jour le 23 novembre 2026/);
  const corps = page.split('<div class="prose')[1].split('<aside')[0];
  for (const href of ['/prix-parc-canin/', '/devis/']) assert.ok(corps.includes(`href="${href}"`), href);
});
