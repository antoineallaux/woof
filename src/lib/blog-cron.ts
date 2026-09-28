// Logique du publieur de blog, reprise telle quelle des 3 nœuds Code du workflow n8n
// « Woof! Blog Auto-Publisher v5 » (filtre, prompt, validation MDX).

// Ligne du planning : colonnes du Sheet par en-tête (Date, Titre, Catégorie, Image URL, Statut)
export type LigneSheet = { row_number: number; [colonne: string]: any };

export const SHEET_ID = '1Q4i_K5OyF94ZFsBU3HNOFlCJWPHaOYsplir0VnCBX2M';
export const ONGLET = 'PostPlanning de publication';

// --- Nœud « Filtrer articles du jour »

export function dateDuJour(now: Date = new Date()): string {
  return now.toLocaleDateString('fr-FR', {
    timeZone: 'Europe/Paris',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function filtrerArticlesDuJour(items: LigneSheet[], todayStr: string): LigneSheet[] {
  return items.filter((item) => {
    const date = (item['Date'] || '').trim();
    const statut = (item['Statut'] || '').trim();
    return date === todayStr && statut === 'À publier';
  });
}

// Valeurs brutes de l'API Sheets (A:F) -> objets par en-tête, row_number = numéro de ligne du Sheet
export function lignesDepuisValeurs(values: string[][]): LigneSheet[] {
  const [entetes = [], ...lignes] = values;
  return lignes.map((cellules, i) => {
    const ligne = { row_number: i + 2 } as LigneSheet;
    entetes.forEach((h, j) => {
      if (h) ligne[h] = cellules[j] ?? '';
    });
    return ligne;
  });
}

// --- Nœud « Préparer prompt Claude »

const SYSTEM_PROMPT = "Tu es un expert en rédaction SEO française spécialisé dans les parcs canins (caniparcs) et les équipements d'agility pour collectivités. Tu rédiges pour Woof!, une marque du groupe Herkules Fitness, fabricant d'équipements de sport en extérieur présent dans plus de 500 communes en Europe. Garantie 5 ans, installation incluse.\n\nINTERDICTION ABSOLUE : ne mentionne JAMAIS la norme EN 16630 ni aucune norme désignée par un numéro. Parle uniquement d'exigences de sécurité, sans référence normative chiffrée.\n\nTon audience : élus locaux, directeurs des services techniques, responsables des espaces verts dans les mairies et intercommunalités françaises.\n\nMOTS-CLÉS À INTÉGRER NATURELLEMENT (selon le sujet) : parc canin, caniparc, parc chien collectivité, agility canine, matériel agility professionnel, aire canine, espace canin.\n\nRÈGLES DE RÉDACTION :\n- Longueur : 1200-1600 mots\n- Structure : introduction accrocheuse, puis une section \"## À retenir\" avec 4-5 puces synthétiques, puis 4-6 sections H2 (avec H3 si utile), conclusion avec appel à l'action vers le devis gratuit\n- Ton : expert, rassurant, institutionnel mais accessible\n- Listes à puces pour la lisibilité\n- Format : Markdown compatible MDX, PAS de frontmatter YAML, PAS de titre H1\n\nLIENS INTERNES — RÈGLE ABSOLUE : tu ne peux lier QUE les URLs listées ci-dessous, telles quelles. N'invente JAMAIS d'URL produit. Si un produit n'est pas dans la liste, n'en fais pas un lien. Intègre 2 à 4 liens produits pertinents par article.\n- /produits/3-cercles/ : 3 Cercles\n- /produits/grande-passerelle/ : Grande Passerelle\n- /produits/abris-en-bois/ : Abris en Bois\n- /produits/abris-en-metal/ : Abris en Métal\n- /produits/anneaux-ligne/ : Anneaux Ligne\n- /produits/anneaux-triangle/ : Anneaux Triangle\n- /produits/banc-dos/ : Banc Dos\n- /produits/banc-os/ : Banc Os\n- /produits/barre-saut/ : Barre de Saut 5 Niveaux\n- /produits/barres-hautes/ : Barres Hautes\n- /produits/barres-saut-3-niveaux/ : Barre de Saut 3 Niveaux\n- /produits/barres/ : Barres\n- /produits/cerceau/ : Cerceau\n- /produits/cercle-flot/ : Cercle Flot\n- /produits/champignons/ : Champignons\n- /produits/parcours-agility-essentiel/ : Dog Park 1\n- /produits/parcours-agility-intermediaire/ : Dog Park 2\n- /produits/parcours-agility-complet/ : Dog Park 3\n- /produits/grande-palissade/ : Grande Palissade\n- /produits/grand-triangle/ : Grand Triangle\n- /produits/grande-balance/ : Grande Balance\n- /produits/grande-plateforme/ : Grande Plateforme\n- /produits/labyrinthe/ : Labyrinthe\n- /produits/obstacles-os/ : Obstacles Os\n- /produits/obstacles-pattes/ : Obstacles Pattes\n- /produits/panneau-info/ : Panneau info\n- /produits/patte/ : Patte\n- /produits/petite-palissade/ : Petite Palissade\n- /produits/petit-triangle/ : Petit Triangle\n- /produits/petite-balance/ : Petite Balance\n- /produits/petite-plateforme/ : Petite Plateforme\n- /produits/petits-murs/ : Petits Murs\n- /produits/piste-tube/ : Piste Tube\n- /produits/passerelle/ : Passerelle\n- /produits/porte-laisse-ii/ : Porte Laisse II\n- /produits/porte-laisse/ : Porte Laisse\n- /produits/slalom/ : Slalom\n- /produits/triple-cerceau/ : Triple Cerceau\n- /produits/triple-stand/ : Triple Stand\n- /produits/tunnel-maison/ : Tunnel Maison\n- /produits/tube/ : Tube\n- /produits/tunnel-niche/ : Tunnel Niche\n- /produits/tunnel-milou/ : Tunnel Milou\n- /produits/tunnel-maison-xl/ : Tunnel Maison XL\n- /produits/tunnel-rex/ : Tunnel Rex\nAutres pages internes autorisées : /produits/ , /agility/ , /contact/ , /blog/ , /qui-sommes-nous/\n\nSOURCES EXTERNES — OBLIGATOIRE : cite 2 à 3 sources externes faisant autorité (Légifrance, service-public.fr, centrale-canine.fr, afnor.org, sites de mairies). Si tu n'es pas certain de l'URL exacte d'une page, lie le domaine racine. Jamais de lien inventé.\n\nFORMAT DE SORTIE — OBLIGATOIRE, réponds EXACTEMENT dans ce format, sans aucun texte avant ni après :\nSEO_TITLE: <titre pour Google, 50-58 caractères maximum, mot-clé principal en tête>\nSEO_DESCRIPTION: <description pour Google, 130-155 caractères, bénéfice + incitation>\nIMAGE_ALT: <description factuelle de l'image d'illustration, 8-15 mots>\n---ARTICLE---\n<le corps de l'article en Markdown>\n\nINTERDIT : tout commentaire méta (\"je vais rédiger\", \"voici l'article\", etc.). Ta réponse commence directement par \"SEO_TITLE:\".";

export function construireRequeteClaude(ligne: LigneSheet, annee: number = new Date().getFullYear()) {
  const SYSTEM_FINAL = SYSTEM_PROMPT + `\n\nCONTEXTE TEMPOREL : nous sommes en ${annee}. N'écris JAMAIS une autre année que ${annee} (pas de \"2024\" ni \"2025\").\n\nRAPPEL : intègre bien 2 à 4 liens produits de la liste blanche, aux endroits où un équipement est mentionné.`;
  const titre = ligne['Titre'] || '';
  const categorie = ligne['Catégorie'] || '';

  return {
    model: 'claude-sonnet-5',
    max_tokens: 8000,
    system: SYSTEM_FINAL,
    messages: [
      {
        role: 'user',
        content: 'Rédige un article de blog SEO complet sur : ' + titre + '\n\nCatégorie : ' + categorie + '\n\nL\'article doit apporter une vraie valeur informative aux collectivités françaises (équipements, réglementation, budget, entretien selon le sujet), intégrer naturellement 2-3 références à Woof! et Herkules Fitness, et se terminer par un appel à l\'action pour demander un devis gratuit. Respecte strictement le format de sortie SEO_TITLE / SEO_DESCRIPTION / IMAGE_ALT / ---ARTICLE---.',
      },
    ],
  };
}

// --- Nœud « Valider + Formater MDX »

const ALLOWED_URLS = ["/produits/3-cercles/", "/produits/grande-passerelle/", "/produits/abris-en-bois/", "/produits/abris-en-metal/", "/produits/anneaux-ligne/", "/produits/anneaux-triangle/", "/produits/banc-dos/", "/produits/banc-os/", "/produits/barre-saut/", "/produits/barres-hautes/", "/produits/barres-saut-3-niveaux/", "/produits/barres/", "/produits/cerceau/", "/produits/cercle-flot/", "/produits/champignons/", "/produits/parcours-agility-essentiel/", "/produits/parcours-agility-intermediaire/", "/produits/parcours-agility-complet/", "/produits/grande-palissade/", "/produits/grand-triangle/", "/produits/grande-balance/", "/produits/grande-plateforme/", "/produits/labyrinthe/", "/produits/obstacles-os/", "/produits/obstacles-pattes/", "/produits/panneau-info/", "/produits/patte/", "/produits/petite-palissade/", "/produits/petit-triangle/", "/produits/petite-balance/", "/produits/petite-plateforme/", "/produits/petits-murs/", "/produits/piste-tube/", "/produits/passerelle/", "/produits/porte-laisse-ii/", "/produits/porte-laisse/", "/produits/slalom/", "/produits/triple-cerceau/", "/produits/triple-stand/", "/produits/tunnel-maison/", "/produits/tube/", "/produits/tunnel-niche/", "/produits/tunnel-milou/", "/produits/tunnel-maison-xl/", "/produits/tunnel-rex/", "/produits/", "/agility/", "/contact/", "/blog/", "/qui-sommes-nous/", "/"];

export type ArticleMdx = {
  slug: string;
  mdx: string;
  titre: string;
  date: string;
  isoDate: string;
  rowNumber: number | string;
  categorie: string;
  imageUrl: string;
  words: number;
  extLinks: number;
  unlinked: number;
};

export function validerEtFormaterMdx(reponse: { content?: { type: string; text?: string }[] }, sheetData: LigneSheet): ArticleMdx {
  // 1. Extraction robuste : concaténer TOUS les blocs text (jamais content[0].text)
  const blocks = reponse.content || [];
  const raw = blocks.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
  if (!raw) throw new Error('Réponse Claude vide');

  // 2. Parser le format à marqueurs
  const m = raw.match(/SEO_TITLE:\s*(.+)\s*\nSEO_DESCRIPTION:\s*(.+)\s*\nIMAGE_ALT:\s*(.+)\s*\n---ARTICLE---\s*\n([\s\S]+)/);
  if (!m) throw new Error('Format de sortie invalide (marqueurs SEO_TITLE/---ARTICLE--- absents)');
  const seoTitle = m[1].trim();
  const seoDescription = m[2].trim();
  const imageAlt = m[3].trim();
  let article = m[4].trim();

  // 3. Garde-fous contenu
  const words = article.split(/\s+/).length;
  if (words < 700) throw new Error(`Article trop court : ${words} mots (minimum 700)`);
  const banned = ['je vais rédiger', 'je vais rechercher', 'avant de rédiger', "voici l'article", 'en tant qu’ia', "en tant qu'ia", 'en tant qu’assistant', "en tant qu'assistant"];
  const lower = article.toLowerCase();
  for (const b of banned) {
    if (lower.includes(b)) throw new Error(`Phrase interdite détectée : "${b}"`);
  }
  if (/EN\s?16630/i.test(article + seoTitle + seoDescription)) throw new Error('Mention de la norme EN 16630 détectée (interdite depuis le 28/08/2026)');
  if (/^#\s/m.test(article)) throw new Error('Titre H1 détecté dans le corps');

  // 4. Garde-fous SEO (le schéma Astro rejette title>65 / desc>165 : on bloque avant)
  if (seoTitle.length < 20 || seoTitle.length > 65) throw new Error(`seoTitle : ${seoTitle.length} caractères (attendu 20-65)`);
  if (seoDescription.length < 80 || seoDescription.length > 165) throw new Error(`seoDescription : ${seoDescription.length} caractères (attendu 80-165)`);

  // 5. Liens internes : dé-linker toute URL produit hors liste blanche (le texte est conservé)
  const ALLOWED = new Set(ALLOWED_URLS);
  let unlinked = 0;
  article = article.replace(/\[([^\]]+)\]\((\/[^)\s]*)\)/g, (_full, text: string, url: string) => {
    const norm = url.endsWith('/') ? url : url + '/';
    if (ALLOWED.has(norm)) return `[${text}](${norm})`;
    unlinked++;
    return text;
  });

  // 6. Lien externe requis
  const extLinks = (article.match(/\]\(https?:\/\/(?!www\.woof-parcs\.fr)[^)]+\)/g) || []).length;

  // 7. Frontmatter
  const titre = sheetData['Titre'] || '';
  const categorie = sheetData['Catégorie'] || '';
  const imageUrl = sheetData['Image URL'] || '/assets/13-PqParcChienCollectivite.jpg'; // image de substitution si la colonne du Sheet est vide
  const date = sheetData['Date'] || '';
  const rowNumber = sheetData['row_number'] || '';

  const parts = date.split('/');
  const isoDate = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : date;

  const slug = titre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  const esc = (s: string) => s.replace(/"/g, "'");
  const mdx = `---
title: "${esc(titre)}"
description: "${esc(seoDescription)}"
seoTitle: "${esc(seoTitle)}"
seoDescription: "${esc(seoDescription)}"
pubDate: ${isoDate}
image: "${imageUrl}"
imageAlt: "${esc(imageAlt)}"
category: "${categorie}"
---

${article}`;

  return { slug, mdx, titre, date, isoDate, rowNumber, categorie, imageUrl, words, extLinks, unlinked };
}

// --- Nœud « Marquer Erreur dans le Sheet »

export function statutErreur(e: unknown): string {
  const msg = (e as { message?: string })?.message || 'inconnue';
  return `Erreur : ${msg.toString().substring(0, 180)}`;
}
