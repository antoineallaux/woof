# Plan d'action SEO — woof-parcs.fr

Priorisé par impact / effort. Le site est en Astro sur Vercel : la plupart des correctifs tiennent dans `astro.config.mjs`, `vercel.json` et les layouts.

---

## 🔴 Priorité 1 — Alignement du domaine canonique (impact fort, effort faible)

**Le** correctif de cet audit. Choisir **un seul hôte** et tout aligner dessus. Recommandation : garder `www.woof-parcs.fr` (c'est ce que Vercel sert déjà) — sinon inverser la redirection, mais ne pas rester dans l'état actuel.

1. **Canonicals** : `site: 'https://www.woof-parcs.fr'` dans `astro.config.mjs` → corrige d'un coup canonicals, sitemap et og:url générés.
2. **Sitemap** : régénérer (les 92 URLs doivent être en www).
3. **robots.txt** : `Sitemap: https://www.woof-parcs.fr/sitemap-index.xml`.
4. **JSON-LD** : `Organization.url`, `logo` et toutes les URLs de schema en www.
5. **Redirection** : vérifier que non-www → www est en **308 permanent** (config domaine Vercel : définir www comme domaine principal, redirect 308).
6. Après déploiement : Search Console → ajouter la propriété www si absente, soumettre le sitemap.

## 🔴 Priorité 2 — Cohérence robots.txt / sitemap (5 min)

- Retirer `/cgv/`, `/confidentialite/`, `/mentions-legales/` du sitemap (elles sont en Disallow — signaux contradictoires).
- Alternative : lever le Disallow et mettre `noindex` sur ces pages (plus propre : le Disallow n'empêche pas l'indexation, seulement le crawl).

## 🟠 Priorité 3 — Trailing slash unique (30 min)

`/produits/grande-balance` et `/produits/grande-balance/` répondent tous deux 200.
- Astro : `trailingSlash: 'always'` (ou `'never'`, mais cohérent avec les canonicals qui ont le slash → `'always'`).
- Sur Vercel, `"trailingSlash": true` dans `vercel.json` ajoute la redirection 308 automatique.
- Harmoniser les liens internes (ils sont actuellement sans slash).

## 🟠 Priorité 4 — Maillage interne des produits (impact fort, effort moyen)

44 fiches produit avec un seul lien entrant chacune :
- **Produits similaires** : bloc « Dans la même gamme » sur chaque fiche (3-4 produits, même catégorie).
- **Blog → produits** : les 34 articles mentionnent balance, tunnel, cerceau, slalom… sans lier les fiches. Ajouter 2-3 liens contextuels par article vers les produits concernés.
- **Anchor text** : donner un `aria-label`/texte aux 52 liens images.

## 🟠 Priorité 5 — E-E-A-T du blog (impact moyen-fort, effort moyen)

- Créer un auteur réel (`Person` avec nom, bio courte, photo) et remplacer `author: Organization` dans le schema BlogPosting.
- Ajouter une page auteur liée depuis chaque article.
- Ajouter `dateModified` et sourcer les affirmations (norme EN 16630, études citées dans les articles « étude » et « avis vétérinaire » → nommer les sources).

## 🟡 Priorité 6 — Corrections schema (1 h)

- `Product.image` : URL absolue (`https://www.woof-parcs.fr/assets/AG04.webp`).
- `Offer` sans prix : soit retirer `offers` (B2B devis), soit garder et accepter l'absence de rich result prix. Ne pas inventer de prix.
- `Organization.sameAs` : ajouter LinkedIn/réseaux sociaux + lien herkules-fitness.com si pertinent.
- `FAQPage` : garder le contenu visible (utile aux visiteurs et aux IA), mais savoir qu'aucun rich result Google n'en sortira (restreint depuis août 2023).

## 🟡 Priorité 7 — Headers de sécurité (30 min)

Dans `vercel.json` :
```json
{
  "headers": [{
    "source": "/(.*)",
    "headers": [
      { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
      { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
      { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains" }
    ]
  }]
}
```
(CSP : à construire progressivement, commencer en `Content-Security-Policy-Report-Only`.)

## 🟢 Priorité 8 — Visibilité IA / GEO (1 h)

- Créer `/public/llms.txt` : nom du site, description, liens vers /produits, /agility, /blog, /contact.
- Contenu « citable » : ajouter chiffres sourcés et définitions nettes dans les articles piliers.

## 🟢 Priorité 9 — Finitions social meta (15 min)

- `og:image:width` = 1200, `og:image:height` = 630.
- `twitter:site` si un compte existe.

---

## Vérifications post-déploiement

1. `curl -I https://woof-parcs.fr/` → doit renvoyer **308** vers www.
2. Canonical de l'accueil = `https://www.woof-parcs.fr/`.
3. Sitemap : toutes les URLs en www, sans les pages légales.
4. Rich Results Test Google sur une fiche produit.
5. Search Console : soumettre le sitemap, surveiller la couverture 2-3 semaines.
6. Relancer PageSpeed Insights (rate-limité pendant l'audit) pour valider les Core Web Vitals.
