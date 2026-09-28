import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  dateDuJour,
  filtrerArticlesDuJour,
  lignesDepuisValeurs,
  construireRequeteClaude,
  validerEtFormaterMdx,
  statutErreur,
  type LigneSheet,
} from '../src/lib/blog-cron.ts';

const ligne = (o: Partial<LigneSheet>): LigneSheet => ({ row_number: 2, ...o }) as LigneSheet;

// Article valide : 750 mots, lien autorisé, lien inventé, lien externe
const corps = (extra = '') =>
  `Introduction du caniparc.\n\n## À retenir\n\n- point\n\n${'mot '.repeat(740)}\n\nVoir [Slalom](/produits/slalom) et [Truc](/produits/invente/) et [Accueil](/produits/) et [Légifrance](https://www.legifrance.gouv.fr/).${extra}`;
const reponse = (o: { titre?: string; desc?: string; article?: string } = {}) => ({
  content: [
    {
      type: 'text',
      text: `SEO_TITLE: ${o.titre ?? 'Clôture parc canin : hauteur et sas'}\nSEO_DESCRIPTION: ${o.desc ?? 'Hauteur de clôture, sas d’entrée, réglementation : le guide pour équiper le parc canin de votre commune. Devis gratuit.'}\nIMAGE_ALT: Clôture d'un parc canin municipal avec sas d'entrée\n---ARTICLE---\n${o.article ?? corps()}`,
    },
  ],
});
const sheet = ligne({ Date: '01/10/2026', Titre: "Clôture de parc canin : hauteur, sas d'entrée et réglementation.", 'Catégorie': 'Équipements', 'Image URL': '/assets/blog/48-cloture/image.webp', Statut: 'À publier', row_number: 50 });

test('dateDuJour : format jj/mm/aaaa à l’heure de Paris', () => {
  // 30/09 22h30 UTC = 01/10 00h30 à Paris
  assert.equal(dateDuJour(new Date('2026-09-30T22:30:00Z')), '01/10/2026');
  assert.equal(dateDuJour(new Date('2026-10-01T08:00:00Z')), '01/10/2026');
});

test('filtre : garde seulement date du jour ET statut « À publier » (espaces tolérés)', () => {
  const items = [
    ligne({ Date: '01/10/2026', Statut: 'À publier', row_number: 2 }),
    ligne({ Date: ' 01/10/2026 ', Statut: 'À publier ', row_number: 3 }),
    ligne({ Date: '01/10/2026', Statut: 'Publié', row_number: 4 }),
    ligne({ Date: '08/10/2026', Statut: 'À publier', row_number: 5 }),
    ligne({ Date: '01/10/2026', Statut: 'a publier', row_number: 6 }),
    ligne({ row_number: 7 }),
  ];
  assert.deepEqual(filtrerArticlesDuJour(items, '01/10/2026').map((i) => i.row_number), [2, 3]);
});

test('lignesDepuisValeurs : en-têtes en clés, row_number = ligne du Sheet', () => {
  const l = lignesDepuisValeurs([
    ['Date', 'Titre', 'Catégorie', 'Image URL', 'Statut'],
    ['24/09/2026', 'A', 'Conseils', '/x.webp', 'Publié'],
    ['01/10/2026', 'B', 'Équipements'],
  ]);
  assert.equal(l[0].row_number, 2);
  assert.equal(l[1].row_number, 3);
  assert.equal(l[1]['Titre'], 'B');
  assert.equal(l[1]['Statut'], '');
});

test('prompt : modèle, année et titre injectés', () => {
  const b = construireRequeteClaude(sheet, 2026);
  assert.equal(b.model, 'claude-sonnet-5');
  assert.equal(b.max_tokens, 8000);
  assert.match(b.system, /INTERDICTION ABSOLUE : ne mentionne JAMAIS la norme EN 16630/);
  assert.match(b.system, /nous sommes en 2026/);
  assert.match(b.messages[0].content, /^Rédige un article de blog SEO complet sur : Clôture de parc canin/);
});

test('validateur : article conforme -> MDX, slug et dé-linkage hors liste blanche', () => {
  const r = validerEtFormaterMdx(reponse(), sheet);
  assert.equal(r.slug, 'cloture-de-parc-canin-hauteur-sas-dentree-et-reglementation');
  assert.equal(r.isoDate, '2026-10-01');
  assert.equal(r.unlinked, 1);
  assert.equal(r.extLinks, 1);
  assert.match(r.mdx, /\[Slalom\]\(\/produits\/slalom\/\)/);
  assert.match(r.mdx, / et Truc et /);
  assert.match(r.mdx, /^---\ntitle: "Clôture de parc canin : hauteur, sas d'entrée et réglementation."\n/);
  assert.match(r.mdx, /\npubDate: 2026-10-01\nimage: "\/assets\/blog\/48-cloture\/image.webp"\n/);
});

test('validateur : moins de 700 mots refusé', () => {
  assert.throws(() => validerEtFormaterMdx(reponse({ article: 'mot '.repeat(600) }), sheet), /Article trop court : 600 mots/);
});

test('validateur : mention EN 16630 refusée (corps, titre ou description)', () => {
  assert.throws(() => validerEtFormaterMdx(reponse({ article: corps(' Conforme à la norme EN16630.') }), sheet), /EN 16630/);
  assert.throws(() => validerEtFormaterMdx(reponse({ titre: 'Parc canin et norme EN 16630 : le guide' }), sheet), /EN 16630/);
});

test('validateur : titre SEO 20-65 caractères', () => {
  assert.throws(() => validerEtFormaterMdx(reponse({ titre: 'Trop court' }), sheet), /seoTitle : 10 caractères/);
  assert.throws(() => validerEtFormaterMdx(reponse({ titre: 'x'.repeat(66) }), sheet), /seoTitle : 66 caractères/);
  assert.doesNotThrow(() => validerEtFormaterMdx(reponse({ titre: 'x'.repeat(65) }), sheet));
});

test('validateur : description SEO 80-165 caractères', () => {
  assert.throws(() => validerEtFormaterMdx(reponse({ desc: 'x'.repeat(79) }), sheet), /seoDescription : 79 caractères/);
  assert.throws(() => validerEtFormaterMdx(reponse({ desc: 'x'.repeat(166) }), sheet), /seoDescription : 166 caractères/);
  assert.doesNotThrow(() => validerEtFormaterMdx(reponse({ desc: 'x'.repeat(80) }), sheet));
});

test('validateur : format sans marqueurs, H1 et phrase méta refusés', () => {
  assert.throws(() => validerEtFormaterMdx({ content: [{ type: 'text', text: 'Voici un article' }] }, sheet), /Format de sortie invalide/);
  assert.throws(() => validerEtFormaterMdx({ content: [] }, sheet), /Réponse Claude vide/);
  assert.throws(() => validerEtFormaterMdx(reponse({ article: '# Titre\n' + corps() }), sheet), /Titre H1/);
  assert.throws(() => validerEtFormaterMdx(reponse({ article: "Voici l'article. " + corps() }), sheet), /Phrase interdite/);
});

test('statut d’erreur tronqué à 180 caractères', () => {
  assert.equal(statutErreur(new Error('x'.repeat(300))), 'Erreur : ' + 'x'.repeat(180));
  assert.equal(statutErreur({}), 'Erreur : inconnue');
});
