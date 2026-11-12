export const prerender = false;

import type { APIRoute } from 'astro';
import {
  dateDuJour,
  publierDuJour,
  construireRequeteClaude,
  validerEtFormaterMdx,
  controlerImage,
  type EntreePlanning,
} from '../../../lib/blog-cron';
import { jetonValide } from '../../../lib/securite';

// Publie chaque jour les articles du planning src/content/planning-blog.json, lu et mis à jour par l'API GitHub
// (remplace le workflow n8n « Woof! Blog Auto-Publisher v5 »).
// Recette : ?dry=1 (génère sans rien écrire), ?branch=<nom> (commit ailleurs que main),
// ?date=jj/mm/aaaa (forcer la date, seulement avec dry ou branch).

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data, null, 2), { status, headers: { 'Content-Type': 'application/json' } });

async function appelClaude(requete: object) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(requete),
    signal: AbortSignal.timeout(180000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Claude API ${res.status}: ${data?.error?.message || JSON.stringify(data).slice(0, 150)}`);
  return data;
}

const API_DEPOT = 'https://api.github.com/repos/antoineallaux/woof/contents/';
const PLANNING = 'src/content/planning-blog.json';
const enTetesGithub = () => ({
  Authorization: `Bearer ${import.meta.env.GITHUB_TOKEN}`,
  Accept: 'application/vnd.github+json',
  'User-Agent': 'woof-blog-cron',
});

async function lirePlanning(branch: string): Promise<{ planning: EntreePlanning[]; sha: string }> {
  const res = await fetch(`${API_DEPOT}${PLANNING}?ref=${encodeURIComponent(branch)}`, { headers: enTetesGithub() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`GitHub lecture planning ${res.status}: ${data?.message || ''}`);
  return { planning: JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8')), sha: data.sha };
}

// Fichier brut du dépôt (image de l'article, lue sur la branche publiée : présente même avant déploiement)
async function lireFichierGithub(chemin: string, branch: string): Promise<Uint8Array> {
  const res = await fetch(`${API_DEPOT}${chemin}?ref=${encodeURIComponent(branch)}`, {
    headers: { ...enTetesGithub(), Accept: 'application/vnd.github.raw' },
  });
  if (!res.ok) throw new Error(`GitHub lecture ${chemin} ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}

// Alerte #woof. Silencieuse si le webhook n'est pas configuré (l'entrée reste bloquée dans le planning).
async function alerterWoof(message: object) {
  const webhook = import.meta.env.DISCORD_WOOF_WEBHOOK;
  if (!webhook) return console.error('publish-blog: DISCORD_WOOF_WEBHOOK absent, alerte #woof non envoyée');
  const res = await fetch(webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(message) });
  if (!res.ok) throw new Error(`discord ${res.status}`);
}

// Commit par l'API GitHub contents (sha = mise à jour d'un fichier existant), 2 essais comme dans n8n
async function commitGithub(chemin: string, message: string, contenu: string, branch: string, sha?: string): Promise<string> {
  const body = JSON.stringify({ message, content: Buffer.from(contenu, 'utf-8').toString('base64'), branch, sha });
  let derniere = '';
  for (let essai = 1; essai <= 2; essai++) {
    const res = await fetch(API_DEPOT + chemin, { method: 'PUT', headers: enTetesGithub(), body });
    const data = await res.json().catch(() => ({}));
    if (res.ok) return data?.commit?.sha || '';
    derniere = `GitHub ${res.status}: ${data?.message || ''}`;
    if (essai === 1) await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(derniere);
}

export const GET: APIRoute = async ({ request, url }) => {
  const secret = import.meta.env.CRON_SECRET;
  if (!secret || !jetonValide(request.headers.get('authorization'), secret)) {
    return json({ error: 'Non autorisé' }, 401);
  }

  const dry = url.searchParams.get('dry') === '1';
  const branch = url.searchParams.get('branch') || 'main';
  const recette = dry || branch !== 'main';
  const dateForcee = url.searchParams.get('date');
  if (dateForcee && !recette) return json({ error: 'date= réservé à la recette (dry=1 ou branch=…)' }, 400);

  // Sans jeton GitHub, on ne touche à rien : le planning lui-même se lit par GitHub
  if (!import.meta.env.GITHUB_TOKEN) return json({ error: 'GITHUB_TOKEN manquant' }, 503);

  const today = dateForcee || dateDuJour();
  const { planning, sha } = await lirePlanning(branch);

  const { trouves, resultats } = await publierDuJour(planning, today, async (e) => {
    // Image contrôlée avant la rédaction : sans agrès Woof, rien n'est publié (alerte #woof hors recette dry)
    const controle = await controlerImage(e, {
      lireImage: (chemin) => lireFichierGithub('public' + chemin, branch),
      appelModele: appelClaude,
      alerter: dry ? undefined : alerterWoof,
    });
    const article = validerEtFormaterMdx(await appelClaude(construireRequeteClaude(e)), e);
    if (dry) return { statut: 'dry', controle, ...article };
    const commit = await commitGithub(`src/content/blog/${article.slug}.mdx`, `content: publish blog article - ${article.titre}`, article.mdx, branch);
    return { slug: article.slug, branch, sha: commit };
  });

  if (trouves && !dry) {
    await commitGithub(PLANNING, `content: planning du blog - ${today}`, JSON.stringify(planning, null, 2) + '\n', branch, sha);
  }

  const echec = resultats.some((r) => String(r.statut).startsWith('Erreur'));
  return json({ date: today, dry, branch, trouves, resultats }, echec ? 500 : 200);
};
