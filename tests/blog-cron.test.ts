import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import {
  dateDuJour,
  filtrerArticlesDuJour,
  publierDuJour,
  construireRequeteClaude,
  validerEtFormaterMdx,
  statutErreur,
  type EntreePlanning,
} from '../src/lib/blog-cron.ts';

const ligne = (o: Partial<EntreePlanning>): EntreePlanning => ({ date: '', titre: '', categorie: '', statut: '', ...o });

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
const sheet = ligne({ date: '01/10/2026', titre: "Clôture de parc canin : hauteur, sas d'entrée et réglementation.", categorie: 'Équipements', image: '/assets/blog/48-cloture/image.webp', statut: 'À publier' });

test('dateDuJour : format jj/mm/aaaa à l’heure de Paris', () => {
  // 30/09 22h30 UTC = 01/10 00h30 à Paris
  assert.equal(dateDuJour(new Date('2026-09-30T22:30:00Z')), '01/10/2026');
  assert.equal(dateDuJour(new Date('2026-10-01T08:00:00Z')), '01/10/2026');
});

test('filtre : garde seulement date du jour ET statut « À publier » (espaces tolérés)', () => {
  const items = [
    ligne({ date: '01/10/2026', statut: 'À publier', titre: 'a' }),
    ligne({ date: ' 01/10/2026 ', statut: 'À publier ', titre: 'b' }),
    ligne({ date: '01/10/2026', statut: 'Publié', titre: 'c' }),
    ligne({ date: '08/10/2026', statut: 'À publier', titre: 'd' }),
    ligne({ date: '01/10/2026', statut: 'a publier', titre: 'e' }),
    ligne({ titre: 'f' }),
  ];
  assert.deepEqual(filtrerArticlesDuJour(items, '01/10/2026').map((i) => i.titre), ['a', 'b']);
});

// Génération simulée : la réponse Claude est fabriquée, le commit est un faux qui enregistre le slug
const publieur = () => {
  const publies: string[] = [];
  const publier = async (e: EntreePlanning) => {
    const a = validerEtFormaterMdx(reponse(), e);
    publies.push(a.slug);
    return { slug: a.slug };
  };
  return { publies, publier };
};

test('planning : le sujet du jour est publié et son entrée marquée « Publié »', async () => {
  const planning = [ligne({ ...sheet }), ligne({ ...sheet, date: '08/10/2026', titre: 'Plus tard' })];
  const { publies, publier } = publieur();
  const r = await publierDuJour(planning, '01/10/2026', publier);
  assert.deepEqual(publies, ['cloture-de-parc-canin-hauteur-sas-dentree-et-reglementation']);
  assert.equal(r.trouves, 1);
  assert.equal(r.resultats[0].statut, 'Publié');
  assert.deepEqual(planning.map((e) => e.statut), ['Publié', 'À publier']);
});

test('planning : rien à publier ce jour -> aucun appel, planning inchangé', async () => {
  const planning = [ligne({ ...sheet, date: '08/10/2026' })];
  const { publies, publier } = publieur();
  const r = await publierDuJour(planning, '01/10/2026', publier);
  assert.deepEqual(publies, []);
  assert.deepEqual(r, { trouves: 0, resultats: [] });
  assert.equal(planning[0].statut, 'À publier');
});

test('planning : entrée du jour déjà publiée ignorée', async () => {
  const planning = [ligne({ ...sheet, statut: 'Publié' })];
  const { publies, publier } = publieur();
  const r = await publierDuJour(planning, '01/10/2026', publier);
  assert.deepEqual(publies, []);
  assert.equal(r.trouves, 0);
});

test('planning : échec de génération -> entrée marquée « Erreur : … »', async () => {
  const planning = [ligne({ ...sheet })];
  const r = await publierDuJour(planning, '01/10/2026', async () => {
    throw new Error('Claude API 529');
  });
  assert.equal(planning[0].statut, 'Erreur : Claude API 529');
  assert.equal(r.resultats[0].statut, 'Erreur : Claude API 529');
});

test('planning du dépôt : entrées complètes, plus aucun appel Google Sheets', () => {
  const planning: EntreePlanning[] = JSON.parse(readFileSync('src/content/planning-blog.json', 'utf8'));
  assert.ok(planning.length > 0);
  for (const e of planning) {
    assert.match(e.date, /^\d{2}\/\d{2}\/\d{4}$/, e.titre);
    assert.ok(e.titre && e.categorie && e.statut, e.titre);
  }
  assert.equal(existsSync('src/lib/google-sheets.ts'), false);
  for (const f of ['src/lib/blog-cron.ts', 'src/pages/api/cron/publish-blog.ts']) {
    assert.doesNotMatch(readFileSync(f, 'utf8'), /googleapis|google-sheets|SHEET_ID/, f);
  }
});

test('prompt : modèle, année et titre injectés', () => {
  const b = construireRequeteClaude(sheet, 2026);
  assert.equal(b.model, 'claude-sonnet-5');
  assert.equal(b.max_tokens, 8000);
  assert.match(b.system, /INTERDICTION ABSOLUE : ne mentionne JAMAIS la norme EN 16630/);
  assert.match(b.system, /nous sommes en 2026/);
  assert.match(b.messages[0].content, /^Rédige un article de blog SEO complet sur : Clôture de parc canin/);
  assert.doesNotMatch(b.messages[0].content, /Mot-clé principal/);
  assert.match(construireRequeteClaude({ ...sheet, motCle: 'parc canin bailleur' }, 2026).messages[0].content, /\nMot-clé principal : parc canin bailleur\n/);
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

test('liste blanche : /caniparc/, /agility/ et /prix-parc-canin/ gardés et cités dans la consigne', () => {
  const pages = ['/caniparc/', '/agility/', '/prix-parc-canin/'];
  const r = validerEtFormaterMdx(reponse({ article: corps(pages.map((p) => ` [page](${p})`).join('')) }), sheet);
  assert.equal(r.unlinked, 1);
  for (const p of pages) {
    assert.ok(r.mdx.includes(`[page](${p})`), p);
    assert.ok(construireRequeteClaude(sheet, 2026).system.includes(p), p);
  }
});
