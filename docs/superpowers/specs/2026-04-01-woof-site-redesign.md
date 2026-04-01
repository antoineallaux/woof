# Woof! — Redesign Site Complet

**Date** : 2026-04-01  
**Statut** : Approuvé  
**Source** : woof-parcs.fr (site Lovable existant)

---

## Objectif

Reproduire et améliorer le site woof-parcs.fr en Astro. Améliorer le style visuel (direction C2) et maximiser les performances SEO/GEO.

---

## Stack Technique

- **Framework** : Astro (static site generation)
- **CSS** : Tailwind CSS v4
- **Blog** : MDX (`@astrojs/mdx`)
- **SEO** : `@astrojs/sitemap` + schema.org manuel en JSON-LD
- **Déploiement** : Vercel (astro adapter)
- **Fonts** : Syne + Nunito via `@fontsource` (auto-hébergées)

---

## Design System

### Palette
| Token | Valeur | Usage |
|-------|--------|-------|
| `primary` | `#7CB342` | CTAs, accents, liens actifs |
| `primary-dark` | `#558B2F` | Hover states |
| `primary-darker` | `#33691E` | Section sombre (Herkules) |
| `primary-light` | `#DCEDC8` | Backgrounds sections alternées |
| `surface` | `#F0FBE8` | Cartes, surfaces légères |
| `bg` | `#FFFBF5` | Background global |
| `text` | `#1C1C1C` | Corps de texte |
| `muted` | `#6B7280` | Texte secondaire |

### Typographie
| Rôle | Police | Poids | Taille |
|------|--------|-------|--------|
| H1 display | Syne | 800 | 48–64px |
| H2 section | Syne | 800 | 32–40px |
| H3 carte | Syne | 700 | 18–22px |
| Body | Nunito | 600 | 15–16px |
| Label | Nunito | 700 | 11px, caps |
| Caption | Nunito | 400 | 13px |

### Composants réutilisables
- `Button.astro` — variantes: primary, outline, ghost
- `Badge.astro` — pill label
- `Card.astro` — produit / feature / article
- `Section.astro` — wrapper avec label + titre H2
- `FAQ.astro` — accordion avec schema FAQPage
- `ProductCard.astro` — image Herkules + nom + CTA

---

## Architecture des Pages

### Pages principales
| Page | URL | Description |
|------|-----|-------------|
| Homepage | `/` | Landing page complète |
| Produits | `/produits` | Grille filtrée par catégorie |
| L'Agility | `/agility` | Guide agility canine |
| Qui sommes-nous | `/qui-sommes-nous` | Histoire & valeurs |
| Blog listing | `/blog` | Articles paginés |
| Article | `/blog/[slug]` | Article MDX |
| Contact | `/contact` | Formulaire devis |
| Mentions légales | `/mentions-legales` | Statique |
| Confidentialité | `/confidentialite` | Statique |
| CGV | `/cgv` | Statique |

### Structure fichiers
```
src/
├── layouts/
│   └── Layout.astro          # Nav + Footer + SEO head
├── pages/
│   ├── index.astro
│   ├── produits.astro
│   ├── agility.astro
│   ├── qui-sommes-nous.astro
│   ├── contact.astro
│   ├── mentions-legales.astro
│   ├── confidentialite.astro
│   ├── cgv.astro
│   └── blog/
│       ├── index.astro
│       └── [slug].astro
├── components/
│   ├── layout/
│   │   ├── Navbar.astro
│   │   └── Footer.astro
│   ├── ui/
│   │   ├── Button.astro
│   │   ├── Badge.astro
│   │   └── Section.astro
│   └── sections/
│       ├── Hero.astro
│       ├── BestSellers.astro
│       ├── WhyWoof.astro
│       ├── GuideElus.astro
│       ├── Accompagnement.astro
│       ├── Herkules.astro
│       ├── FAQ.astro
│       ├── BlogPreview.astro
│       └── CTAFinal.astro
├── content/
│   ├── config.ts
│   ├── blog/
│   │   ├── inclusion-mobilite-reduite.mdx
│   │   ├── education-base-agility.mdx
│   │   └── prevention-nuisances-sonores.mdx
│   └── products/
│       ├── grande-balance.json
│       ├── barre-saut-5-niveaux.json
│       └── tunnel-niche.json
└── styles/
    └── global.css            # Tailwind + CSS variables
```

---

## Homepage — Sections

### 01 · Hero
- Background: photo `hero-agility-dog-KoNW9-uW.webp` plein écran avec overlay vert léger
- Badge pill vert : "🐾 500+ communes équipées en Europe"
- H1 : "Créez votre parcours canin agility en collectivité."
- Sous-titre avec **Herkules Fitness** en gras
- CTA primaire : "Voir le catalogue Mairie" → `/produits`
- CTA secondaire : "Demander un devis gratuit" → `/contact`
- Carte flottante : photo chien + "Garantie 5 ans / Sur toute la gamme"
- Preload image LCP, fetchpriority="high"

### 02 · Best-Sellers
- Label : "Équipements d'agility canine"
- H2 : "Nos Best-Sellers pour Parcours Canin Agility"
- 3 cartes produits (images herkules-fitness.com)
- CTA : "Voir tout le catalogue" → `/produits`

### 03 · Pourquoi Woof
- Fond `surface` (#F0FBE8)
- Label : "Expertise & Qualité"
- H2 : "Pourquoi choisir Woof pour votre parcours canin agility ?"
- 3 features grid : Durabilité Extrême, Sécurité Certifiée, Sérénité Garantie
- 6 avantages en liste : fabrication EU, livraison+install, marchés publics, plans perso, formation, devis 48h

### 04 · Guide Élus
- Layout split 50/50 : image gauche, texte droite
- Label : "Guide pour les élus"
- H2 : "Pourquoi installer un parcours canin agility dans votre commune ?"
- 3 bénéfices : Lien social, Espaces verts préservés, Bien-être animal
- CTA : "En savoir plus sur l'agility" → `/agility`

### 05 · Accompagnement A→Z
- Label : "À vos côtés"
- H2 : "Un accompagnement personnalisé de A à Z"
- 6 étapes en grid 2x3
- Bloc "Réseau national" avec CTA → `/contact`

### 06 · Herkules / Processus
- Fond `primary-darker` (#33691E), texte blanc
- H2 : "La puissance d'un leader européen au service de l'agility canine."
- Texte descriptif Herkules Fitness
- 3 étapes numérotées : 01 Conseil & Design, 02 Mandat Administratif, 03 Installation
- CTA : "Démarrer votre projet" → `/contact`

### 07 · FAQ
- Label : "Questions fréquentes"
- H2 : "Tout savoir sur les parcours d'agility pour collectivités"
- 6 questions en accordion animé
- JSON-LD `FAQPage` schema injecté

### 08 · Derniers Articles
- H2 : "Nos derniers articles"
- 3 articles les plus récents (via `getCollection('blog')`)
- CTA : "Voir tous les articles" → `/blog`

### 09 · CTA Final
- Fond `primary` (#7CB342)
- H2 : "Prêt à créer un espace canin dans votre commune ?"
- Sous-titre + 2 boutons (devis + appel)
- Adresse : Ile du Platais, 78670 Villennes Sur Seine

---

## SEO / GEO

### Données Structurées JSON-LD
- **Organization** + **LocalBusiness** : dans Layout.astro (global)
- **FAQPage** : pages Homepage, Agility, Produits
- **Product** : chaque fiche produit (`/produits/[slug]`)
- **BlogPosting** : chaque article
- **BreadcrumbList** : toutes pages sauf homepage

### Meta Tags (via Layout.astro props)
```ts
interface SEOProps {
  title: string;        // "Woof! | {page}" — max 60 chars
  description: string;  // max 155 chars
  canonical?: string;   // auto si omis
  ogImage?: string;     // hero image par défaut
  noindex?: boolean;    // pour légales
}
```

### Performance
- Images : `loading="lazy"` sur tout sauf hero (`loading="eager"` + `fetchpriority="high"`)
- Format WebP natif (images source déjà en .webp)
- Fonts Syne + Nunito via `@fontsource` (pas de Google Fonts en prod → FOUT 0)
- Zéro JS hydraté côté client (Astro islands seulement si nécessaire)
- `@astrojs/sitemap` : sitemap.xml auto-généré
- `robots.txt` : autoriser tout sauf `/cgv`, `/mentions-legales`, `/confidentialite`

### GEO (visibilité dans les LLMs)
- FAQ enrichies avec réponses longues et précises (>100 mots par réponse)
- Entités nommées cohérentes : "Woof!", "Herkules Fitness", "parcours canin agility", "collectivités"
- Données chiffrées vérifiables dans chaque page
- Maillage interne complet et logique

---

## Assets / Images

| Fichier | Source | Usage |
|---------|--------|-------|
| `logo-header-woof.png` | woof-parcs.fr/assets/ | Navbar |
| `logo-woof-yellow.png` | woof-parcs.fr/assets/ | Footer |
| `hero-agility-dog.webp` | woof-parcs.fr/assets/ | Hero + section Guide |
| `features-tunnel-dog.webp` | woof-parcs.fr/assets/ | Section Guide Élus |
| `AG04.webp` | herkules-fitness.com | Produit: Grande Balance |
| `AG17.webp` | herkules-fitness.com | Produit: Barre de Saut |
| `AG24.webp` | herkules-fitness.com | Produit: Tunnel Niche |
| Blog images (3) | supabase.co | Articles blog |

---

## Contacts & Données

- **Téléphone** : +33 1 84 60 23 30
- **Adresse** : Ile du Platais, 78670 Villennes Sur Seine
- **Copyright** : © 2026 Woof! - Une marque Herkules Fitness

---

## Non inclus dans ce projet

- Formulaire de contact fonctionnel (backend/email) — placeholder HTML uniquement
- Internationalisation (une seule langue : FR)
- E-commerce / panier
- Espace client
