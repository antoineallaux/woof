# Audit SEO complet — woof-parcs.fr

**Date** : 26 août 2026
**Périmètre** : 87 URLs du sitemap crawlées et analysées (1 accueil, 47 fiches produits, 34 articles, 5 pages fixes) + robots.txt, sitemap, llms.txt, en-têtes HTTP, chaînes de redirection, maillage interne, JSON-LD.
**Type de business** : catalogue B2B sur devis (collectivités, bailleurs, entreprises) — marque du groupe Herkules Fitness.
**Stack** : Astro (SSG) sur Vercel, contenu en MDX/JSON.

## Score global : 67/100 — À améliorer

| Catégorie | Poids | Score | Commentaire |
|---|---|---|---|
| SEO technique | 25 % | 78 | Fondations saines, mais 9 liens internes en 404 et 4 liens de nav en 308 sur chaque page |
| Qualité de contenu | 20 % | 58 | Un article publié avec du texte de prompt brut, aucune source citée, 5 mois sans publication |
| SEO on-page | 15 % | 62 | 36 titles trop longs, 35 meta descriptions trop longues, slugs anglais |
| Données structurées | 15 % | 55 | URL d'image malformée sur les 34 articles, Product sans `offers` |
| Performance (CWV) | 10 % | 75 | 0 Ko de JS, TTFB 180 ms — mais images LCP lourdes (non mesuré en labo) |
| Optimisation images | 10 % | 68 | 543 images, aucune avec `width`/`height` ni `srcset` |
| AI Search / GEO | 5 % | 72 | `llms.txt` présent et propre, blocs « À retenir » — pas de `sameAs` |

Précédent audit (3 juillet 2026) : ~55/100. Les correctifs techniques de juillet (domaine www canonique, redirection 308, trailing slash, sitemap filtré, en-têtes de sécurité, schéma auteur) sont **tous en place et vérifiés**. Les points restants sont majoritairement liés au contenu et à un bug de concaténation d'URL.

---

## 🔴 Critique

### C1 — URL d'image malformée dans les métadonnées des 34 articles
**Preuve** — sur `/blog/creation-dun-parc-chien-collectivite-ce-que-dit-la-loi/` :
```
<meta property="og:image" content="https://www.woof-parcs.frhttps://yjqprmiaolgdzswplonj.supabase.co/storage/.../1767715972198-uqyxz.webp">
"image": "https://www.woof-parcs.frhttps://yjqprmiaolgdzswplonj.supabase.co/..."
```
34 fichiers HTML sur 34 contiennent la chaîne `woof-parcs.frhttps`.

**Cause** — `src/pages/blog/[...slug].astro:31` fait `` `${siteUrl}${post.data.image}` `` alors que `post.data.image` est déjà une URL absolue Supabase. Même problème dans `src/layouts/Layout.astro:62` et `:69` pour `og:image` / `twitter:image`.

**Impact** — aucun aperçu visuel lors d'un partage LinkedIn / WhatsApp / Slack (canal principal pour toucher des élus et services techniques), et l'image de l'`Article` est rejetée par Google : aucune vignette possible dans Discover ou les résultats enrichis.

**Correctif** — ne préfixer que si le chemin est relatif :
```js
const abs = (u) => u?.startsWith('http') ? u : `${siteUrl}${u}`;
```
Appliquer dans `Layout.astro` (og:image, twitter:image) et `blog/[...slug].astro` (schéma).
**Confiance : confirmée**

### C2 — Article publié contenant le prompt brut de l'IA
**Preuve** — `/blog/echauffement-canin-les-bons-gestes-avant-lagility-en-parc-canin/`, 163 mots (médiane du blog : 1 190). Le chapô, le `<title>` et la meta description affichent :
> « Avant de rédiger, je vais rechercher des informations actualisées sur l'échauffement canin en agility et les recommandations pour les parcs canins de collect... »

**Impact** — signal E-E-A-T très négatif : contenu manifestement non relu, publié tel quel. Sur un site B2B qui vend de la conformité et de la sécurité à des collectivités, c'est aussi un problème commercial. Google traite ce type de page comme du contenu de faible valeur ajoutée, ce qui peut peser au-delà de l'URL concernée.

**Correctif** — réécrire ou dépublier immédiatement (`draft: true` puis retrait du sitemap).
**Confiance : confirmée**

### C3 — 9 liens internes pointant vers des 404, générés par le pipeline de blog
**Preuve** — codes HTTP vérifiés un par un :

| URL cassée | Liens entrants | Source |
|---|---|---|
| `/produits/grande-passerelle/` | **19 articles** | slug réel : `a-frame-grand` |
| `/produits/grande-palissade/` | 2 | slug réel : `grand-bridge` |
| `/produits/petite-palissade/` | 2 | slug réel : `petit-bridge` |
| `/produits/tunnel-milou/` | 2 | slug réel : `tunnel-figiel` |
| `/produits/passerelle/` | 2 | slug réel : `pont-i-aframe` |
| `/produits/petite-passerelle/` | 1 | — |
| `/produits/barres-saut/` | 1 | slug réel : `barres-saut-3-niveaux` |
| `/produits/tunnel/` | 1 | — |
| `/categories/parcours-agility-chien/` | 1 | rubrique inexistante |
| `/blog/etude-...-des-proprietaire/` | 1 | faute de frappe (« proprietaire » au lieu de « proprietaires ») |
| `//` | 2 | lien vide |

**Cause racine** — les noms de produits sont en français mais les slugs sont restés en anglais / legacy (`a-frame-grand` = « Grande Passerelle », `grand-bridge` = « Grande Palissade », `tunnel-buda` = « Tunnel Niche »…). Le rédacteur IA du pipeline n8n déduit logiquement le slug depuis le nom affiché et tombe systématiquement à côté.

**Impact** — 32 liens internes perdus, dont 19 vers une fiche produit. Ces liens devraient transmettre du signal vers le catalogue : c'est exactement le maillage blog → produit qui fait vendre. Côté utilisateur, un élu qui clique arrive sur une 404.

**Correctif** — deux niveaux :
1. Immédiat : redirections 301 dans `vercel.json` pour les 9 URL.
2. De fond : aligner les slugs sur les noms français (avec 301 depuis les anciens). Bénéfice SEO direct — `grande-passerelle` est un mot-clé, `a-frame-grand` n'en est pas un.
**Confiance : confirmée**

### C4 — Doublons de fiches produits (cannibalisation)
**Preuve** — deux références produit existent en double dans `src/content/products/` :

| Réf | URL 1 | URL 2 |
|---|---|---|
| AG17 | `/produits/barre-saut/` (350 mots, 4 FAQ) | `/produits/barre-saut-5-niveaux/` (**119 mots**, 0 FAQ) |
| AG24 | `/produits/tunnel-buda/` (346 mots, 4 FAQ) | `/produits/tunnel-niche/` (**120 mots**, 0 FAQ) |

Les deux doublons sont les pages les plus pauvres du site (hors page contact) et sont indexables, dans le sitemap, avec un canonical auto-référent.

**Impact** — Google doit arbitrer entre deux pages sur la même requête. Les versions courtes n'ont ni FAQ ni description longue et sont susceptibles d'être choisies comme version canonique par Google, à la place de la bonne page.

**Correctif** — supprimer `barre-saut-5-niveaux.json` et `tunnel-niche.json`, ajouter une 301 vers `barre-saut` et `tunnel-buda`.
**Confiance : confirmée**

---

## ⚠️ Avertissements

### W1 — 36 titles dépassent 60 caractères
Les 34 articles + `/agility/` (78 car.) + `/qui-sommes-nous/` (62 car.). Record : 124 caractères sur `blog/inclusion-comment-les-nouveaux-modeles-...`. Google tronque autour de 580 px (~60 caractères) : le suffixe `| Blog Woof` et souvent le bénéfice principal disparaissent du SERP.
**Correctif** — ajouter un champ `seoTitle` optionnel au schéma de la collection blog (`src/content.config.ts`), avec repli sur `title`. Contrainte de 60 caractères à ajouter dans le prompt du pipeline n8n.
**Confiance : confirmée**

### W2 — 35 meta descriptions dépassent 160 caractères
Cause : la meta description reprend l'intégralité du chapô de l'article. Longueurs relevées jusqu'à **438 caractères** (`blog/pourquoi-le-parc-chien-collectivite-devient-un-critere-dattractivite`). Google réécrit alors la description avec un extrait arbitraire, ce qui fait perdre le contrôle du taux de clic.
**Correctif** — champ `seoDescription` dédié, 150-160 caractères, orienté bénéfice + appel à l'action.
**Confiance : confirmée**

### W3 — Schéma `Product` sans `offers` ni `sku` sur 47 fiches
**Preuve** — `src/pages/produits/[slug].astro:29` génère `name`, `description`, `image`, `brand` uniquement. Le commentaire du code indique un choix assumé (« pas d'offers : vente sur devis, pas de prix public »).
**Impact** — sans `offers`, Google n'affiche aucun extrait enrichi produit. Le champ `ref` (AG17, AG29…) existe déjà dans les données mais n'est pas exposé en `sku`, ce qui prive les moteurs et les LLM d'un identifiant produit stable.
**Correctif** — ajouter au minimum `sku: ref`, `material`, `manufacturer` et une `Offer` avec `availability: InStock`, `priceCurrency: EUR`, `url` et `businessFunction`. Ne pas inventer de prix : un `Offer` sans `price` reste valide pour la compréhension d'entité même s'il ne déclenche pas de rich result.
**Confiance : confirmée**

### W4 — `LocalBusiness` incomplet et probablement inadapté
**Preuve** — le schéma global (`Layout.astro`, présent sur les 87 pages) déclare `@type: ["Organization", "LocalBusiness"]` avec `name`, `url`, `logo`, `description`, `telephone`, `address`. Manquent `image`, `openingHours`, `geo`, `priceRange`, `sameAs`.
**Impact** — `LocalBusiness` sans `image` ni horaires n'est pas éligible aux résultats locaux : le type est déclaré sans en tirer le bénéfice. Et Woof! n'est pas un commerce recevant du public — c'est un fabricant qui livre en France entière. `Organization` seul, enrichi de `areaServed: FR`, décrit mieux l'entité. L'absence de `sameAs` (LinkedIn, site Herkules) prive Google et les LLM du lien entre la marque et son groupe.
**Correctif** — passer à `Organization` seul + `sameAs` (LinkedIn Herkules, herkules-fitness.com) + `areaServed` + `parentOrganization`. Ajouter un `WebSite` avec `SearchAction` si une recherche interne est prévue.
**Confiance : confirmée** (le choix de type reste un arbitrage, mais l'incomplétude est factuelle)

### W5 — 4 liens de navigation en 308 sur les 87 pages
**Preuve** — le menu pointe vers `/produits?category=saut`, `?category=tunnel`, `?category=contact`, `?category=plateforme`. Chacun renvoie un `308 → /produits/?category=saut`.
**Impact** — 348 redirections internes inutiles à l'échelle du site. Dilution mineure mais totalement évitable, et une latence supplémentaire à chaque clic utilisateur.
**Correctif** — écrire `/produits/?category=saut` dans le composant de navigation.
**Confiance : confirmée**

### W6 — `og:image` générique sur les 47 fiches produits
Toutes les fiches partagent `hero-agility-dog.webp`. Le schéma `Product`, lui, référence bien la photo du produit. `src/pages/produits/[slug].astro:64` ne transmet pas `ogImage` au layout.
**Correctif** — `<Layout ... ogImage={image}>`.
**Confiance : confirmée**

### W7 — Aucune source externe citée sur 34 articles
**Preuve** — 0 lien sortant sur l'ensemble du blog. Les articles traitent pourtant de sujets vérifiables : norme EN 16630, arrêtés municipaux, responsabilité juridique, accessibilité PMR.
**Impact** — E-E-A-T. Un article sur « ce que dit la loi » sans lien vers Légifrance, le Code rural ou l'AFNOR est difficilement crédible, pour un lecteur comme pour un évaluateur qualité. C'est aussi ce qui rend un contenu citable par les LLM.
**Correctif** — 2 à 3 sources faisant autorité par article, en `rel="noopener"`, sans `nofollow`.
**Confiance : confirmée**

### W8 — Pas de `dateModified`, dernier article il y a 5 mois
**Preuve** — 0 des 34 schémas `BlogPosting` contient `dateModified`. Dernière `datePublished` : **1er avril 2026** (l'article cassé C2). Rythme précédent : un article tous les 3 jours.
**Impact** — signal de fraîcheur en berne sur un blog qui, jusqu'en avril, publiait régulièrement. `dateModified` est ce qui permet de valoriser une mise à jour sans republier.
**Correctif** — relancer le pipeline n8n (v5, branche `main`) et ajouter `dateModified` au schéma.
**Confiance : confirmée**

### W9 — Images Supabase non mises en cache
**Preuve** — `HTTP/2 200`, `cache-control: no-cache`, `cf-cache-status: MISS`, 172 Ko sur l'image d'en-tête d'article.
**Impact** — l'image LCP de chaque article est rechargée à chaque visite depuis un domaine tiers, sans `preconnect`. Coût : résolution DNS + handshake TLS + 172 Ko avant que le LCP puisse se déclencher.
**Correctif** — rapatrier les 34 images dans `/public/assets/blog/` (le reste du site est déjà local et servi par le CDN Vercel). Solution d'attente : `<link rel="preconnect" href="https://yjqprmiaolgdzswplonj.supabase.co">`.
**Confiance : confirmée**

### W10 — 543 images sans `width`/`height` ni `srcset`
Aucune des 543 balises `<img>` du site ne porte de dimensions explicites ni de `srcset`.
**Nuance importante** : toutes ont une contrainte de hauteur en CSS (`h-40`, `aspect-video`, `inset-0`…), donc **le risque de CLS est faible**. Le vrai coût est l'absence de `srcset` : un mobile télécharge la même image qu'un écran 27 pouces. L'image d'accueil `26-CerceauDeSaut.jpg` fait 130 Ko en JPEG (pas de WebP) et sert de LCP.
**Correctif** — utiliser `<Image>` / `<Picture>` d'`astro:assets` sur les visuels éditoriaux et produits : dimensions, `srcset` et conversion WebP automatiques.
**Confiance : confirmée**

### W11 — Pages minces
`/contact/` : **97 mots**. Les deux doublons produits : 119 et 120 mots (voir C4). 20 fiches produits sont entre 311 et 348 mots — acceptable pour du catalogue, mais sans marge.
**Correctif** — enrichir `/contact/` (délai de réponse, périmètre d'intervention, processus de devis, interlocuteurs, FAQ achat public / marchés).
**Confiance : confirmée**

---

## ✅ Points conformes (vérifiés)

| Élément | Constat |
|---|---|
| HTTPS + HSTS | `max-age=63072000; includeSubDomains` |
| Redirection apex → www | `308` permanente, 1 seul saut, 520 ms |
| Canonical | Présent et correct sur les 87 URLs, aucune anomalie |
| `<html lang="fr">` | Correct partout |
| H1 | Exactement 1 par page sur les 87 URLs, aucun manquant, aucun doublon |
| Titles / descriptions uniques | 0 doublon sur 87 pages |
| Sitemap | 87 URLs, index propre, pages légales exclues |
| robots.txt | Valide, sitemap déclaré, pages légales bloquées |
| En-têtes de sécurité | 85/100 — seul CSP manque |
| Attributs `alt` | 541 / 543 renseignés (2 manquants sur `/qui-sommes-nous/`) |
| Poids JS | **0 octet** — aucun bundle, aucune hydratation |
| CSS | Un seul fichier, 61 Ko |
| TTFB | 180 ms, `x-vercel-cache: HIT` |
| Format d'images | 83 des 91 images uniques en WebP |
| `loading="lazy"` | Appliqué hors du premier écran |
| `fetchpriority="high"` | Sur l'image LCP de l'accueil et des articles |
| BreadcrumbList | Correct sur les articles et les fiches produits |
| Schéma auteur | `Person` complet (Antoine Allaux, `jobTitle`, `worksFor`, bio, URL) |
| `llms.txt` | Présent, 90/100 — description, pages principales, contact |
| Blocs « À retenir » | 33 des 34 articles — excellent pour l'AEO |
| FAQ visibles | 45 des 47 fiches produits |
| Pages orphelines | **0** — les 87 URLs du sitemap reçoivent au moins un lien interne |
| Maillage produits | 4 à 33 liens entrants par fiche |
| Contenu sans JS | HTML statique complet, aucun risque de rendu |

---

## ℹ️ Informations

- **`FAQPage` sur 45 fiches produits** : depuis août 2023, Google réserve les résultats enrichis FAQ aux sites gouvernementaux et de santé. Ce balisage ne produira donc **aucun rich result** pour Woof!. Il n'est pas pénalisant et reste utile pour la compréhension par les LLM — le conserver, mais ne pas l'étendre ni compter dessus.
- **`HowTo`** : absent du site, ce qui est correct (rich results supprimés en septembre 2023).
- **Crawlers IA** : aucune directive spécifique dans robots.txt. GPTBot, ClaudeBot, PerplexityBot et consorts héritent donc du `Allow: /`. Pour un site qui cherche la visibilité en recherche générative, c'est le bon réglage — ne rien changer.
- **hreflang** : absent, ce qui est correct pour un site monolingue français.
- **Sitemap sans `lastmod`** : impact faible sur 87 URLs, mais utile pour signaler les mises à jour de contenu.
- **Favicon** : `logo-header-woof.png`, 21 Ko. Un `.ico` / PNG 32×32 suffirait.
- **CSP** : seul en-tête de sécurité manquant. Aucun impact SEO direct.

---

## Limitations de l'environnement

- **Core Web Vitals non mesurés en laboratoire.** L'API PageSpeed Insights a renvoyé un quota journalier dépassé (`429`, quota `Queries per day`) sur trois tentatives. Le score performance de 75 est donc une estimation structurelle, pas une mesure : elle s'appuie sur le TTFB (180 ms), l'absence totale de JavaScript, le CSS unique de 61 Ko et le poids des images LCP (130-179 Ko). **Confiance : probable.** À confirmer avec une clé API PageSpeed ou le rapport Core Web Vitals de la Search Console.
- **Aucune donnée terrain CrUX** récupérée pour la même raison. Le rapport « Signaux Web essentiels » de la Search Console est la source à privilégier.
- **Pas de données de position ni de trafic** : cet audit est structurel. Les requêtes réellement travaillées, les impressions et les CTR se lisent dans la Search Console.
- **Backlinks non analysés** : nécessite un outil tiers (Ahrefs, Semrush, Search Console → Liens).

---

## Synthèse

Les fondations techniques sont solides — c'est ce qui a été construit en juillet et rien n'a régressé. Le site est un HTML statique sans JavaScript servi par un CDN, avec des canonicals, un sitemap et des en-têtes corrects. Zéro page orpheline sur 87 URLs, ce qui est rare.

Ce qui bloque tient en trois causes, toutes réparables rapidement :

1. **Un bug d'une ligne** (`${siteUrl}${image}` sur une URL déjà absolue) casse l'image de partage et l'image de schéma des 34 articles.
2. **Un décalage entre noms français et slugs anglais** fait halluciner le rédacteur IA du blog, produisant 9 URL en 404 dont une référencée 19 fois.
3. **Un pipeline de publication arrêté depuis le 1er avril**, qui a laissé en ligne un article contenant son propre prompt.

Le levier de croissance le plus évident reste le maillage blog → produit : 34 articles bien construits pointent déjà vers le catalogue, mais une partie de ces liens tombe dans le vide.
