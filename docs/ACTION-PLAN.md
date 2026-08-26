# Plan d'action SEO — woof-parcs.fr

Issu de l'audit du 26 août 2026 (`FULL-AUDIT-REPORT.md`). Priorisé par impact / effort.
Site Astro SSG sur Vercel : la plupart des correctifs tiennent dans 3-4 fichiers.

---

## Lot 1 — Correctifs bloquants (~1 h, impact fort) — ✅ FAIT le 26/08/2026

Livré en un commit sur `main` : bug og:image corrigé (`toAbs()` dans `Layout.astro`, condition dans `blog/[...slug].astro`), article échauffement réécrit (1 285 mots), 12 redirections 301 dans `vercel.json` (dont les 2 doublons produits supprimés), footer corrigé (`/produits/?category=`), 3 liens vides `](//)`  remplacés. Note : `petite-passerelle` redirigée vers `pont-i-aframe` (« Passerelle »), plus cohérent que `petit-bridge` (« Petite Palissade »).

### 1.1 Réparer les URL d'images malformées — 34 articles
`src/layouts/Layout.astro` — remplacer aux lignes 62 et 69 :
```astro
---
const toAbs = (u) => (u?.startsWith('http') ? u : `${siteUrl}${u}`);
---
<meta property="og:image" content={toAbs(ogImage)} />
<meta name="twitter:image" content={toAbs(ogImage)} />
```
`src/pages/blog/[...slug].astro:31` — même logique dans le schéma `BlogPosting` :
```js
"image": post.data.image?.startsWith('http') ? post.data.image : `${siteUrl}${post.data.image}`,
```
**Vérification** : `curl -s <url_article> | grep 'og:image'` ne doit plus contenir `woof-parcs.frhttps`.

### 1.2 Traiter l'article cassé
`src/content/blog/echauffement-canin-...` : réécrire complètement (le contenu actuel est le prompt de l'IA, 163 mots) ou passer `draft: true` en attendant. Ne pas laisser en ligne.

### 1.3 Rediriger les 9 liens internes en 404
`vercel.json`, section `redirects` (permanent 301) :

| Source | Destination |
|---|---|
| `/produits/grande-passerelle` | `/produits/a-frame-grand/` |
| `/produits/grande-palissade` | `/produits/grand-bridge/` |
| `/produits/petite-palissade` | `/produits/petit-bridge/` |
| `/produits/passerelle` | `/produits/pont-i-aframe/` |
| `/produits/petite-passerelle` | `/produits/pont-i-aframe/` |
| `/produits/tunnel-milou` | `/produits/tunnel-figiel/` |
| `/produits/barres-saut` | `/produits/barres-saut-3-niveaux/` |
| `/produits/tunnel` | `/produits/` |
| `/categories/parcours-agility-chien` | `/produits/` |
| `/blog/etude-les-benefices-du-parc-canin-sur-la-sante-des-proprietaire` | `/blog/etude-les-benefices-du-parc-canin-sur-la-sante-des-proprietaires/` |

Corriger aussi les 2 liens `//` (liens vides) dans `etude-les-benefices...` et `pourquoi-varier-les-obstacles...`.

### 1.4 Supprimer les 2 doublons produits
Supprimer `src/content/products/barre-saut-5-niveaux.json` (ref AG17, doublon de `barre-saut`) et `tunnel-niche.json` (ref AG24, doublon de `tunnel-buda`), puis ajouter les 301 correspondantes vers `/produits/barre-saut/` et `/produits/tunnel-buda/`.

### 1.5 Supprimer les 348 redirections internes
Dans le composant de navigation : `/produits?category=X` → `/produits/?category=X` (4 liens × 87 pages).

---

## Lot 2 — On-page et données structurées (~2-3 h, impact fort) — ✅ FAIT le 26/08/2026

Livré : champs `seoTitle`/`seoDescription` ajoutés au schéma blog et remplis sur les 34 articles (mots-clés issus de la recherche : « parc canin », « caniparc » — terme utilisé par les mairies, absent du site jusqu'ici —, « agility collectivité », « matériel agility professionnel »). Titles de /agility/ et /qui-sommes-nous/ raccourcis. Résultat : 0 title > 60 car. sur les 88 pages. Schéma Product enrichi (sku, manufacturer Herkules, material déduit des descriptions, audience, Offer sans prix). Organization seul avec sameAs (herkules-fitness.com + linkedin.com/company/herkules-outdoor-fitness), parentOrganization, areaServed France. og:image produit spécifique. Point 2.5 : faux positif — les 2 `alt=""` de /qui-sommes-nous/ sont des images décoratives avec `aria-hidden`, conformes.

### 2.1 Titles et meta descriptions dédiés
`src/content.config.ts` — ajouter au schéma de la collection blog :
```ts
seoTitle: z.string().max(60).optional(),
seoDescription: z.string().max(160).optional(),
```
Puis dans `blog/[...slug].astro` : `title={post.data.seoTitle ?? post.data.title}`, idem pour la description.
Concerne 36 titles (dont un à 124 caractères) et 35 descriptions (dont une à 438 caractères). Commencer par les 10 articles les plus stratégiques.

### 2.2 Enrichir le schéma `Product` — 47 fiches
`src/pages/produits/[slug].astro:29` :
```js
"sku": ref,
"material": "Acier galvanisé thermolaqué / PEHD",
"manufacturer": { "@type": "Organization", "name": "Herkules Fitness" },
"offers": {
  "@type": "Offer",
  "availability": "https://schema.org/InStock",
  "priceCurrency": "EUR",
  "url": `${siteUrl}/produits/${slug}/`,
  "seller": { "@type": "Organization", "name": "Woof!" }
}
```
Pas de prix inventé : l'`Offer` sans `price` ne déclenchera pas d'extrait enrichi, mais consolide l'entité produit pour Google et les LLM.

### 2.3 Corriger le schéma d'organisation
`src/layouts/Layout.astro` — passer de `["Organization", "LocalBusiness"]` à `Organization` seul, et ajouter :
```js
"sameAs": ["https://www.herkules-fitness.com", "<URL LinkedIn Herkules>"],
"areaServed": { "@type": "Country", "name": "France" },
"parentOrganization": { "@type": "Organization", "name": "Herkules Fitness" }
```
Woof! ne reçoit pas de public : `LocalBusiness` est déclaré sans les champs qui le rendraient éligible (`image`, `openingHours`, `geo`).

### 2.4 `og:image` par fiche produit
`src/pages/produits/[slug].astro:64` : `<Layout ... ogImage={image}>`.

### 2.5 Les 2 `alt` manquants
Sur `/qui-sommes-nous/`.

---

## Lot 3 — Contenu et E-E-A-T (récurrent, impact moyen-fort)

### 3.1 Relancer le pipeline n8n
Dernière publication : 1er avril 2026, soit près de 5 mois. Migrer le workflow v5 sur la branche `main` et ajouter au prompt trois garde-fous qui auraient évité les problèmes actuels :
- title ≤ 60 caractères, description ≤ 160 ;
- **ne jamais deviner un slug produit** — fournir la liste réelle des 47 slugs dans le prompt ;
- 2-3 liens externes vers des sources faisant autorité.

Ajouter une étape de validation avant commit : rejeter tout article de moins de 600 mots ou contenant « je vais », « avant de rédiger », « voici l'article ».

### 3.2 Aligner les slugs produits sur les noms français
Cause racine des 404 du lot 1.3, et gain SEO direct : `grande-passerelle` est une requête, `a-frame-grand` non.

| Slug actuel | Slug cible |
|---|---|
| `a-frame-grand` | `grande-passerelle` |
| `grand-bridge` | `grande-palissade` |
| `petit-bridge` | `petite-palissade` |
| `pont-i-aframe` | `passerelle` |
| `tunnel-buda` | `tunnel-niche` |
| `tunnel-figiel` | `tunnel-milou` |
| `tube-maison` | `tunnel-maison` |
| `dog-park-1/2/3` | à franciser |

Avec 301 depuis les anciens slugs. À faire **après** le lot 1 (les redirections du 1.3 deviendront alors inutiles, mais elles ne coûtent rien).

### 3.3 Ajouter des sources externes
0 lien sortant sur 34 articles. Priorité aux articles réglementaires (`ce-que-dit-la-loi`, `responsabilite-juridique`, `hygiene-et-proprete`, `urbanisme-implanter`) : Légifrance, AFNOR / norme EN 16630, Code rural. C'est ce qui rend un contenu citable par Google comme par les LLM.

### 3.4 Ajouter `dateModified` au schéma `BlogPosting`
Absent des 34 articles. Permet de valoriser une mise à jour sans republier.

### 3.5 Étoffer `/contact/`
97 mots. Ajouter : délai de réponse 48 h, périmètre France entière, étapes du devis, procédure marchés publics, interlocuteurs.

---

## Lot 4 — Performance et images (~2 h, impact moyen)

### 4.1 Rapatrier les 34 images de blog depuis Supabase
Elles sont servies avec `cache-control: no-cache`, non mises en cache par Cloudflare (`cf-cache-status: MISS`), 172 Ko, sur un domaine tiers sans `preconnect` — le tout sur l'image LCP de chaque article. Les déplacer vers `/public/assets/blog/` pour bénéficier du CDN Vercel comme le reste du site.
Palliatif immédiat si le rapatriement prend du temps :
```html
<link rel="preconnect" href="https://yjqprmiaolgdzswplonj.supabase.co" crossorigin>
```

### 4.2 Passer aux composants images d'Astro
Aucune des 543 `<img>` n'a de `srcset` : un mobile télécharge la même image qu'un écran 27 pouces. `astro:assets` (`<Image>` / `<Picture>`) génère automatiquement dimensions, `srcset` et WebP.
Le risque de CLS est faible (toutes les images ont une contrainte de hauteur CSS) — le gain porte sur le poids transféré.

### 4.3 Convertir l'image LCP de l'accueil
`/assets/26-CerceauDeSaut.jpg` : 130 Ko en JPEG. Convertir en WebP et redimensionner pour le viewport mobile.

### 4.4 Alléger les logos
`logo-header-woof.png` (21 Ko) et `logo-woof-yellow.png` (19 Ko) sont chargés sur les 87 pages. Un SVG ou un WebP optimisé ferait moins de 5 Ko.

### 4.5 Favicon dédié
Actuellement `logo-header-woof.png` (21 Ko). Un PNG 32×32 suffit.

---

## Lot 5 — Compléments (~1 h, impact faible)

- **`lastmod` dans le sitemap** — activer l'option du plugin `@astrojs/sitemap`.
- **`llms-full.txt`** — absent. Le `llms.txt` est déjà à 90/100 ; une version étendue listant les 47 produits et les 34 articles améliorerait la citabilité en recherche générative.
- **CSP** — seul en-tête de sécurité manquant (85/100). Aucun impact SEO, à traiter comme un point sécurité.
- **`twitter:site` / `twitter:creator`** — optionnels, à ajouter si un compte X existe.
- **`og:image:width` / `og:image:height`** (1200×630) — améliore le rendu des aperçus sociaux.

---

## Ordre d'exécution recommandé

1. **Lot 1** en une session — 5 correctifs, tous vérifiables par `curl`, impact immédiat sur le partage social et le maillage interne.
2. **Lot 2** dans la foulée — même zone de code, un seul déploiement possible avec le lot 1.
3. **Lot 3.1 et 3.2** — le pipeline et les slugs sont liés : régler les slugs avant de relancer la publication évite de regénérer des 404.
4. **Lot 4** quand le temps le permet — mesurable une fois les Core Web Vitals accessibles.
5. **Lot 5** en fin de cycle.

## À mesurer après déploiement

Les Core Web Vitals n'ont pas pu être mesurés (quota PageSpeed dépassé). Après le lot 1 :
- Search Console → **Signaux Web essentiels** (données terrain, plus fiables que le labo) ;
- Search Console → **Indexation** : vérifier la disparition des 404 ;
- Test des résultats enrichis sur un article (image de l'`Article`) et une fiche produit ;
- Aperçu de partage LinkedIn sur un article (validation directe du correctif 1.1).
