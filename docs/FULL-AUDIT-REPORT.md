# Audit SEO complet — woof-parcs.fr

**Date** : 3 juillet 2026
**Périmètre** : full-site (accueil, /produits + fiche produit, /blog + article, robots.txt, sitemap, headers HTTP)
**Type de business détecté** : e-commerce B2B / catalogue devis (collectivités)
**Score global : ~55/100 — À améliorer** (confiance : moyenne, Core Web Vitals non mesurés)

---

## Résumé exécutif

Le site a de **très bonnes fondations on-page** (titles, meta descriptions, H1 uniques, 100 % des images avec alt, contenu statique riche, 34 articles de blog ciblés) mais souffre d'un **problème structurel de domaine canonique** : tout le référencement interne (canonicals, sitemap, og:url, JSON-LD) pointe vers `woof-parcs.fr` (sans www) alors que le site est servi sur `www.woof-parcs.fr`, avec une redirection **307 temporaire** dans le sens inverse. Google reçoit des signaux contradictoires sur l'URL officielle de chaque page.

### Top 3 problèmes
1. **Conflit d'hôte canonique** — canonicals/sitemap/og:url sur non-www, site servi sur www, redirection 307 temporaire
2. **Maillage interne faible** — 66 pages produit quasi-orphelines (1 seul lien entrant chacune)
3. **E-E-A-T faible sur le blog** — aucun auteur humain, articles signés « Woof! » (Organization)

### Top 3 opportunités
1. Corriger l'alignement de domaine = gain immédiat de consolidation des signaux (1 fichier de config)
2. Lier les produits depuis les articles de blog (34 articles → 44 fiches produit)
3. Créer `/llms.txt` + gérer les crawlers IA pour la visibilité dans ChatGPT/Perplexity/Claude

---

## Tableau des findings (vérifiés — 11/11, 0 rejeté)

| # | Domaine | Sévérité | Confiance | Finding | Preuve |
|---|---------|----------|-----------|---------|--------|
| 1 | Technique | ⚠️ Warning (priorité haute) | Confirmed | Canonical, og:url, sitemap et JSON-LD pointent vers non-www ; site servi sur www ; redirection non-www→www en **307 temporaire** | `<link rel="canonical" href="https://woof-parcs.fr/">` ; `curl -I https://woof-parcs.fr/` → `307 location: https://www.woof-parcs.fr/` |
| 2 | Technique | ⚠️ Warning | Confirmed | robots.txt bloque `/mentions-legales`, `/confidentialite`, `/cgv` mais ces URLs sont dans le sitemap | robots.txt `Disallow` + présence dans sitemap-0.xml |
| 3 | Technique | ⚠️ Warning | Confirmed | Variantes avec/sans trailing slash répondent toutes deux 200 (duplication potentielle, atténuée par les canonicals) | `/produits/grande-balance` et `/produits/grande-balance/` → 200 |
| 4 | Technique | ⚠️ Warning | Confirmed | 5 headers de sécurité absents (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) ; HSTS sans `includeSubDomains` | security_headers.py : score 45/100 |
| 5 | Schema | ⚠️ Warning | Confirmed | `Product.image` en URL relative (`/assets/AG04.webp`) et `Offer` sans prix → non éligible aux résultats enrichis produit | JSON-LD de /produits/grande-balance/ |
| 6 | Schema | ℹ️ Info | Confirmed | `FAQPage` sur site commercial : plus éligible aux rich results Google depuis août 2023 (réservé gouvernement/santé) | FAQPage 4 questions sur les fiches produit |
| 7 | Contenu | ⚠️ Warning | Confirmed | Articles signés par l'Organization « Woof! », aucun auteur humain, pas de bio ni page auteur → E-E-A-T faible | `BlogPosting.author = {"@type":"Organization"}` |
| 8 | On-page | ⚠️ Warning | Confirmed | 66 pages quasi-orphelines (≤1 lien entrant, surtout les 44 fiches produit) ; 52 liens sans anchor text | internal_links.py : 15 pages crawlées, 91 découvertes |
| 9 | GEO/IA | ⚠️ Warning | Confirmed | `/llms.txt` absent (404) ; 11 crawlers IA non gérés explicitement dans robots.txt (autorisés par héritage de `*` — OK si voulu) | llms_txt_checker.py + robots_checker.py |
| 10 | Performance | ℹ️ Info | Hypothesis | Core Web Vitals non mesurés (API PageSpeed rate-limited, 2 tentatives) | Limitation d'environnement, pas un problème du site |
| 11 | Social | ℹ️ Info | Confirmed | `og:image` sans width/height ; `twitter:site` absent | social_meta.py : score 85/100 |

---

## Détail par catégorie

### Technique (25 %) — Score : ~40/100
**Points forts** : HTTPS + HSTS ; robots.txt propre avec sitemap déclaré ; sitemap complet (92 URLs cohérentes avec le site) ; 0 lien cassé, 0 chaîne de redirection sur www ; HTML statique complet (Astro) — tout le contenu est crawlable sans JavaScript.
**Pénalisé par** : le conflit d'hôte canonique (finding #1), la contradiction robots/sitemap (#2), la duplication trailing slash (#3) et les headers de sécurité (#4).

> Note sur le finding #1 : Google traite le canonical comme un indice et finira par choisir lui-même — mais des signaux contradictoires (canonical → URL qui redirige → page dont le canonical repointe ailleurs) ralentissent l'indexation, diluent les signaux entre deux hôtes et rendent les rapports Search Console illisibles. Le 307 (temporaire) n'invite pas Google à consolider vers www.

### Contenu (20 %) — Score : ~60/100
**Points forts** : accueil riche (~1 285 mots) avec structure H1/H2/H3 impeccable ; 34 articles de blog ciblant une longue traîne cohérente (« parc chien collectivité », « agility parc canin ») ; articles substantiels (~1 200 mots) avec `datePublished` ; FAQ utiles sur les fiches produit ; positionnement B2B clair avec CTA devis.
**Pénalisé par** : absence totale d'auteur humain (E-E-A-T), pas de page auteur, pas de sources/citations externes dans les articles.

### On-page (15 %) — Score : ~60/100
**Points forts** : titles uniques et bien calibrés (56 car. sur l'accueil) ; meta descriptions présentes et vendeuses (152 car.) ; 1 seul H1 par page ; `lang="fr"` ; viewport OK.
**Pénalisé par** : les 44 fiches produit ne reçoivent qu'un lien chacune (depuis /produits) — aucun lien croisé entre produits, aucun lien blog→produit ; 52 liens sans anchor text (liens images).

### Schema / données structurées (15 %) — Score : ~55/100
**Points forts** : JSON-LD partout — Organization/LocalBusiness global (avec adresse + téléphone ✅), Product + BreadcrumbList sur les fiches, BlogPosting sur les articles.
**Pénalisé par** : image produit relative, Offer sans prix, FAQPage inéligible, `Organization.sameAs` absent (aucun réseau social/annuaire référencé), URLs du schema sur non-www.

### Performance (10 %) — Score : données insuffisantes
L'API PageSpeed a rejeté les requêtes (rate limit). Hypothèse favorable : site statique Astro sur Vercel, images WebP, `loading="lazy"` sur 8/11 images de l'accueil. **À vérifier** dans Search Console → Signaux Web essentiels ou en relançant PSI.

### Images (10 %) — Score : ~75/100
**Points forts** : format WebP moderne partout, 100 % des images avec alt (accueil et article vérifiés), lazy loading, images hébergées en local (plus de dépendance au CDN Herkules).
**Pénalisé par** : og:image sans dimensions déclarées.

### GEO / recherche IA (5 %) — Score : ~50/100
**Points forts** : contenu 100 % statique lisible par les crawlers IA ; FAQ bien structurées ; rien ne bloque GPTBot/ClaudeBot/PerplexityBot.
**Pénalisé par** : pas de `/llms.txt` ; contenu sans citations/statistiques sourcées (moins citable par les moteurs de réponse).

---

## Inconnues et suivis

| À vérifier | Comment |
|------------|---------|
| Core Web Vitals réels (LCP, INP, CLS) | Relancer `pagespeed.py` plus tard ou Search Console → Signaux Web essentiels |
| Indexation effective (quel hôte Google a choisi) | Search Console : couverture + inspection d'URL sur les deux propriétés (www et non-www) |
| Backlinks / autorité du domaine | Ahrefs/Semrush ou a minima `site:woof-parcs.fr` |
| Positions actuelles sur « parc canin collectivité », « parcours agility chien » | Search Console → Performances |

## Limitations d'environnement
- **PageSpeed Insights** : rate limit Google (2 tentatives) — catégorie Performance non scorée.
- Crawl limité à profondeur 1 (15 pages analysées, 91 découvertes) — suffisant pour le diagnostic structurel.

---
*Audit généré avec le skill SEO — findings vérifiés par finding_verifier.py (11/11 confirmés). Voir ACTION-PLAN.md pour les correctifs priorisés.*
