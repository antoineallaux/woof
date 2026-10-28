import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// Lit la sortie de `npm run build` : lancer le build avant ce test
const racine = 'dist/client';
const fichiers = (readdirSync(racine, { recursive: true }) as string[])
  .filter((f) => /\.(html|txt)$/.test(f) && !f.startsWith('_astro'));

// Texte visible + JSON-LD (les balises sont retirées, le contenu des <script> reste) ; adresses retirées
const lire = (f: string) => readFileSync(join(racine, f), 'utf8');
const nettoie = (brut: string) => brut
  .replace(/<[^>]+>/g, ' ')
  .replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&nbsp;| | /g, ' ')
  .replace(/\S*parcours-agility-(essentiel|intermediaire|complet)\S*/g, ' ')
  .replace(/\s+/g, ' ');
const texte = (f: string) => nettoie(lire(f));

const anciens: [string, RegExp][] = [
  // « plus de 15 ans d'expérience » d'un éducateur cité dans un article n'est pas l'ancienneté de Herkules
  ['ancienneté en années', /\b(15|20) ?\+ ?(ans|années)|(depuis|fort de) plus de \d+ ans|plus de 20 ans|20 ans d'expérience/i],
  ['nombre de communes', /\d ?\+? ?communes|communes équipées/i],
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

// Articles hors périmètre du lot 011, signalés dans sa fiche : à corriger dans un prochain lot, puis retirer d'ici
const exceptions = [
  'blog/budget-participatif-faire-elire-un-projet-de-caniparc-dans-sa-ville/index.html : « Une surface de 300 à 1 000 m² suffit',
  'blog/quelle-surface-et-quel-emplacement-pour-un-caniparc-reussi/index.html : « Ville ou zone urbaine dense : au-delà de 1 500 m²',
];

test('aucune phrase n\'associe un parcours d\'agility à plus de 60 m²', () => {
  const trouves = fichiers.flatMap((f) => phrases(f)
    .filter((p) => /parcours (d'|d’)?agility/i.test(p))
    .filter((p) => [...p.matchAll(/(\d{1,3}(?: \d{3})+|\d+) ?m²/g)].some((m) => Number(m[1].replace(/ /g, '')) > 60))
    .map((p) => `${f} : « ${p.trim()} »`))
    .filter((t) => !exceptions.some((e) => t.startsWith(e)));
  assert.deepEqual([...new Set(trouves)], []);
});
