export const prerender = false;

import type { APIRoute } from 'astro';
import {
  SHEET_ID,
  ONGLET,
  dateDuJour,
  filtrerArticlesDuJour,
  lignesDepuisValeurs,
  construireRequeteClaude,
  validerEtFormaterMdx,
  statutErreur,
  type LigneSheet,
} from '../../../lib/blog-cron';
import { jetonGoogle, lirePlage, ecrireCellule } from '../../../lib/google-sheets';

// Publie chaque jour les articles du planning (remplace le workflow n8n « Woof! Blog Auto-Publisher v5 »).
// Recette : ?dry=1 (génère sans rien écrire), ?branch=<nom> (commit ailleurs que main),
// ?date=jj/mm/aaaa (forcer la date, seulement avec dry ou branch).

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data, null, 2), { status, headers: { 'Content-Type': 'application/json' } });

async function appelClaude(ligne: LigneSheet) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(construireRequeteClaude(ligne)),
    signal: AbortSignal.timeout(180000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Claude API ${res.status}: ${data?.error?.message || JSON.stringify(data).slice(0, 150)}`);
  return data;
}

// Commit par l'API GitHub contents, 2 essais comme dans n8n
async function commitGithub(slug: string, titre: string, mdx: string, branch: string): Promise<string> {
  const url = `https://api.github.com/repos/antoineallaux/woof/contents/src/content/blog/${slug}.mdx`;
  const body = JSON.stringify({
    message: `content: publish blog article - ${titre}`,
    content: Buffer.from(mdx, 'utf-8').toString('base64'),
    branch,
  });
  let derniere = '';
  for (let essai = 1; essai <= 2; essai++) {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${import.meta.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'woof-blog-cron',
      },
      body,
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) return data?.commit?.sha || '';
    derniere = `GitHub ${res.status}: ${data?.message || ''}`;
    if (essai === 1) await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(derniere);
}

export const GET: APIRoute = async ({ request, url }) => {
  const secret = import.meta.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return json({ error: 'Non autorisé' }, 401);
  }

  const dry = url.searchParams.get('dry') === '1';
  const branch = url.searchParams.get('branch') || 'main';
  const recette = dry || branch !== 'main';
  const dateForcee = url.searchParams.get('date');
  if (dateForcee && !recette) return json({ error: 'date= réservé à la recette (dry=1 ou branch=…)' }, 400);

  // Sans jeton GitHub, on ne touche à rien (ni Claude ni Sheet)
  if (!dry && !import.meta.env.GITHUB_TOKEN) return json({ error: 'GITHUB_TOKEN manquant' }, 503);

  const today = dateForcee || dateDuJour();
  const jeton = await jetonGoogle(import.meta.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const valeurs = await lirePlage(jeton, SHEET_ID, ONGLET, 'A:F');
  const colStatut = String.fromCharCode(65 + (valeurs[0] || []).indexOf('Statut'));
  const lignes = filtrerArticlesDuJour(lignesDepuisValeurs(valeurs), today);

  const resultats = [];
  for (const ligne of lignes) {
    try {
      const article = validerEtFormaterMdx(await appelClaude(ligne), ligne);
      if (dry) {
        resultats.push({ row: ligne.row_number, statut: 'dry', ...article });
        continue;
      }
      const sha = await commitGithub(article.slug, article.titre, article.mdx, branch);
      await ecrireCellule(jeton, SHEET_ID, ONGLET, `${colStatut}${ligne.row_number}`, 'Publié');
      resultats.push({ row: ligne.row_number, statut: 'Publié', slug: article.slug, branch, sha });
    } catch (e) {
      const statut = statutErreur(e);
      console.error('publish-blog', ligne.row_number, statut);
      if (!dry) await ecrireCellule(jeton, SHEET_ID, ONGLET, `${colStatut}${ligne.row_number}`, statut);
      resultats.push({ row: ligne.row_number, statut });
    }
  }

  const echec = resultats.some((r) => r.statut.startsWith('Erreur'));
  return json({ date: today, dry, branch, trouves: lignes.length, resultats }, echec ? 500 : 200);
};
