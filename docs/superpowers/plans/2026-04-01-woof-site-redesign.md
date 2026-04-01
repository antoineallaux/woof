# Woof! Site Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild woof-parcs.fr in Astro with style direction C2 (vert sauge, Syne+Nunito, fond blanc chaud) and maximized SEO/GEO performance.

**Architecture:** Static Astro site with file-based routing. All pages are pre-rendered at build time. Blog articles are MDX files in `src/content/blog/`. Product data lives in JSON files in `src/content/products/`. A shared `Layout.astro` wraps every page with nav, footer, and SEO head. Section components compose the homepage.

**Tech Stack:** Astro 5, Tailwind CSS v4 (via `@tailwindcss/vite`), `@astrojs/mdx`, `@astrojs/sitemap`, `@fontsource/syne`, `@fontsource/nunito`

**Spec:** `docs/superpowers/specs/2026-04-01-woof-site-redesign.md`

---

## File Map

```
/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── public/
│   ├── robots.txt
│   └── assets/
│       ├── logo-header-woof.png
│       ├── logo-woof-yellow.png
│       ├── hero-agility-dog.webp
│       ├── features-tunnel-dog.webp
│       ├── AG04.webp
│       ├── AG17.webp
│       ├── AG24.webp
│       └── blog/
│           ├── blog-1.webp
│           ├── blog-2.webp
│           └── blog-3.webp
├── src/
│   ├── styles/
│   │   └── global.css
│   ├── layouts/
│   │   └── Layout.astro
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.astro
│   │   │   └── Footer.astro
│   │   ├── ui/
│   │   │   ├── Button.astro
│   │   │   ├── Badge.astro
│   │   │   └── SectionHeader.astro
│   │   └── sections/
│   │       ├── Hero.astro
│   │       ├── BestSellers.astro
│   │       ├── WhyWoof.astro
│   │       ├── GuideElus.astro
│   │       ├── Accompagnement.astro
│   │       ├── Herkules.astro
│   │       ├── FAQSection.astro
│   │       ├── BlogPreview.astro
│   │       └── CTAFinal.astro
│   ├── content/
│   │   ├── config.ts
│   │   ├── blog/
│   │   │   ├── inclusion-mobilite-reduite.mdx
│   │   │   ├── education-base-agility.mdx
│   │   │   └── prevention-nuisances-sonores.mdx
│   │   └── products/
│   │       ├── grande-balance.json
│   │       ├── barre-saut-5-niveaux.json
│   │       └── tunnel-niche.json
│   └── pages/
│       ├── index.astro
│       ├── produits.astro
│       ├── agility.astro
│       ├── qui-sommes-nous.astro
│       ├── contact.astro
│       ├── mentions-legales.astro
│       ├── confidentialite.astro
│       ├── cgv.astro
│       └── blog/
│           ├── index.astro
│           └── [...slug].astro
```

---

## Task 1: Project Setup

**Files:**
- Create: `astro.config.mjs`
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `src/styles/global.css`

- [ ] **Step 1: Initialize Astro project**

```bash
cd /Users/antoineallaux/Projects/woof
npm create astro@latest . -- --template minimal --typescript strict --no-git --install
```

Expected: project scaffold created, `node_modules` installed.

- [ ] **Step 2: Install integrations and fonts**

```bash
npm install @astrojs/mdx @astrojs/sitemap
npm install @tailwindcss/vite tailwindcss
npm install @fontsource/syne @fontsource/nunito
```

- [ ] **Step 3: Configure astro.config.mjs**

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://woof-parcs.fr',
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 4: Create global.css with design tokens**

```css
/* src/styles/global.css */
@import "tailwindcss";
@import "@fontsource/syne/700.css";
@import "@fontsource/syne/800.css";
@import "@fontsource/nunito/400.css";
@import "@fontsource/nunito/600.css";
@import "@fontsource/nunito/700.css";
@import "@fontsource/nunito/800.css";

@theme {
  --color-primary: #7CB342;
  --color-primary-dark: #558B2F;
  --color-primary-darker: #33691E;
  --color-primary-light: #DCEDC8;
  --color-surface: #F0FBE8;
  --color-bg: #FFFBF5;
  --color-text: #1C1C1C;
  --color-muted: #6B7280;

  --font-display: 'Syne', sans-serif;
  --font-body: 'Nunito', sans-serif;
}

html {
  background-color: #FFFBF5;
  color: #1C1C1C;
  font-family: 'Nunito', sans-serif;
  scroll-behavior: smooth;
}

* {
  box-sizing: border-box;
}
```

- [ ] **Step 5: Update tsconfig.json for strict mode**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@components/*": ["src/components/*"],
      "@layouts/*": ["src/layouts/*"],
      "@styles/*": ["src/styles/*"]
    }
  }
}
```

- [ ] **Step 6: Verify dev server starts**

```bash
npm run dev
```

Expected: `http://localhost:4321` serves a blank page with no errors.

- [ ] **Step 7: Commit**

```bash
git init && git add astro.config.mjs package.json tsconfig.json src/styles/global.css
git commit -m "chore: init Astro project with Tailwind v4, MDX, fonts"
```

---

## Task 2: Download Assets

**Files:**
- Create: `public/assets/` (various images)
- Create: `public/robots.txt`

- [ ] **Step 1: Download all images from the live site**

```bash
mkdir -p public/assets/blog

# Logo & UI
curl -sL "https://woof-parcs.fr/assets/logo-header-woof-BTHoiemh.png" -o public/assets/logo-header-woof.png
curl -sL "https://woof-parcs.fr/assets/logo-woof-yellow-XsvwAIWp.png" -o public/assets/logo-woof-yellow.png

# Hero & features
curl -sL "https://woof-parcs.fr/assets/hero-agility-dog-KoNW9-uW.webp" -o public/assets/hero-agility-dog.webp
curl -sL "https://woof-parcs.fr/assets/features-tunnel-dog-Bjn8aKWW.webp" -o public/assets/features-tunnel-dog.webp

# Products (from herkules-fitness.com)
curl -sL "https://www.herkules-fitness.com/wp-content/uploads/2025/02/AG04.webp" -o public/assets/AG04.webp
curl -sL "https://www.herkules-fitness.com/wp-content/uploads/2025/08/AG17.webp" -o public/assets/AG17.webp
curl -sL "https://www.herkules-fitness.com/wp-content/uploads/2025/02/AG24.webp" -o public/assets/AG24.webp

# Blog images
curl -sL "https://yjqprmiaolgdzswplonj.supabase.co/storage/v1/object/public/blog-images/media/1767783236715-t9vssq.webp" -o public/assets/blog/blog-1.webp
curl -sL "https://yjqprmiaolgdzswplonj.supabase.co/storage/v1/object/public/blog-images/media/1767782124873-36ub0p.webp" -o public/assets/blog/blog-2.webp
curl -sL "https://yjqprmiaolgdzswplonj.supabase.co/storage/v1/object/public/blog-images/media/1767782124483-4ozpxq.webp" -o public/assets/blog/blog-3.webp
```

Expected: all 11 files present in `public/assets/`.

- [ ] **Step 2: Create robots.txt**

```txt
# public/robots.txt
User-agent: *
Allow: /

Disallow: /mentions-legales
Disallow: /confidentialite
Disallow: /cgv

Sitemap: https://woof-parcs.fr/sitemap-index.xml
```

- [ ] **Step 3: Verify all assets downloaded**

```bash
ls -lh public/assets/ && ls -lh public/assets/blog/
```

Expected: 8 files in `public/assets/`, 3 files in `public/assets/blog/`.

- [ ] **Step 4: Commit**

```bash
git add public/
git commit -m "chore: download site assets and add robots.txt"
```

---

## Task 3: Content Collections

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/blog/inclusion-mobilite-reduite.mdx`
- Create: `src/content/blog/education-base-agility.mdx`
- Create: `src/content/blog/prevention-nuisances-sonores.mdx`
- Create: `src/content/products/grande-balance.json`
- Create: `src/content/products/barre-saut-5-niveaux.json`
- Create: `src/content/products/tunnel-niche.json`

- [ ] **Step 1: Define content collection schemas**

```ts
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    image: z.string(),
    imageAlt: z.string(),
    category: z.string().default('Agility canine'),
  }),
});

const products = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    category: z.enum(['saut', 'tunnel', 'contact', 'plateforme']),
    description: z.string(),
    longDescription: z.string(),
    image: z.string(),
    imageAlt: z.string(),
    features: z.array(z.string()),
    ref: z.string(),
  }),
});

export const collections = { blog, products };
```

- [ ] **Step 2: Create first blog article**

```mdx
---
title: "Inclusion : Comment les nouveaux modèles de parc pour chien s'adaptent aux maîtres à mobilité réduite"
description: "Les parcs canins nouvelle génération intègrent désormais des aménagements pensés pour les personnes à mobilité réduite. Découvrez les innovations qui rendent ces espaces accessibles à tous."
pubDate: 2025-12-15
image: /assets/blog/blog-1.webp
imageAlt: "Parc canin accessible aux personnes à mobilité réduite"
category: "Aménagement urbain"
---

L'accessibilité des espaces publics est aujourd'hui une priorité pour les collectivités françaises. Les parcs canins ne font pas exception à cette évolution nécessaire.

## Des allées élargies et des surfaces adaptées

Les nouveaux modèles de parcs canins prévoient des allées d'au moins 1,40 m de largeur, conformes aux normes PMR (Personnes à Mobilité Réduite). Les surfaces sont stabilisées pour faciliter le déplacement des fauteuils roulants et des déambulateurs.

## Des obstacles ajustables en hauteur

Certains équipements d'agility proposent désormais plusieurs niveaux de réglage, permettant aux maîtres assis en fauteuil de manipuler les obstacles sans difficulté. Les commandes sont positionnées à une hauteur accessible (entre 0,80 m et 1,20 m du sol).

## L'importance du mobilier d'accompagnement

Bancs avec accoudoirs facilitant le lever, espaces de stationnement pour fauteuils, signalétique en braille et grands caractères : tous ces éléments contribuent à rendre l'expérience du parc canin inclusive.

## Woof! s'engage pour l'accessibilité

Chez Woof!, nous travaillons en collaboration avec les collectivités pour concevoir des espaces canins réellement accessibles à tous les propriétaires de chiens, quelles que soient leurs contraintes physiques.

[Contactez-nous](/contact) pour un audit d'accessibilité de votre projet.
```

- [ ] **Step 3: Create second blog article**

```mdx
---
title: "L'éducation de base nécessaire avant l'agility en parc pour chien"
description: "Avant de lâcher votre chien dans un parcours d'agility, quelques bases éducatives sont indispensables. Quelles commandes maîtriser ? Quel âge minimum ? On fait le point."
pubDate: 2025-11-20
image: /assets/blog/blog-2.webp
imageAlt: "Maître éduquant son chien avant une session d'agility"
category: "Éducation canine"
---

L'agility est un sport exigeant qui demande une complicité réelle entre le chien et son maître. Avant de s'y lancer, certains prérequis éducatifs sont essentiels.

## Les commandes de base indispensables

Votre chien doit impérativement maîtriser le **rappel** (revenir quand on l'appelle), le **assis**, le **couché**, et le **reste**. Ces commandes garantissent sa sécurité sur le parcours et celle des autres usagers.

## L'âge minimum recommandé

Pour préserver les articulations en développement, il est conseillé d'attendre que le chien ait **12 à 18 mois** avant de pratiquer l'agility avec des sauts. Avant cet âge, les exercices au sol (tunnels, slalom basse vitesse) sont acceptables.

## La socialisation, un prérequis souvent oublié

Un chien qui pratique l'agility dans un parc public doit être à l'aise avec ses congénères et les humains inconnus. Une socialisation insuffisante peut générer du stress et des comportements indésirables.

## Progresser en douceur

Commencez par explorer le matériel calmement, à la laisse, sans pression de performance. L'objectif est que votre chien associe le parcours d'agility à une expérience positive.
```

- [ ] **Step 4: Create third blog article**

```mdx
---
title: "Prévention des nuisances sonores autour du parc canin"
description: "Les aboiements excessifs peuvent créer des tensions de voisinage autour des parcs canins. Solutions d'aménagement et bonnes pratiques pour une cohabitation sereine."
pubDate: 2025-10-10
image: /assets/blog/blog-3.webp
imageAlt: "Parc canin entouré de végétation pour réduire les nuisances sonores"
category: "Aménagement urbain"
---

L'installation d'un parc canin en milieu urbain soulève parfois des inquiétudes légitimes de la part des riverains. Les nuisances sonores, principalement les aboiements, sont au cœur de ces préoccupations.

## L'implantation : première ligne de défense

La localisation du parc est déterminante. Préférez une implantation à **au moins 50 mètres** des habitations, dans un secteur déjà bruyant (proximité d'une avenue, d'un équipement sportif). Orientez l'entrée du parc à l'opposé des fenêtres d'habitation.

## Les barrières végétales

Les haies de végétaux denses (thuyas, lauriers, charmes) forment une barrière acoustique naturelle efficace qui peut réduire le bruit de 3 à 5 dB. Elles ont également l'avantage d'améliorer l'intégration paysagère du parc.

## La signalétique éducative

Affichez des règles claires : chiens ne doivent pas rester sans surveillance, maîtres responsables des aboiements excessifs. Une charte d'utilisation bien visible responsabilise les usagers.

## Le rôle de l'agility

Paradoxalement, les parcours d'agility **réduisent** les nuisances sonores en canalisant l'énergie des chiens. Un chien fatigué physiquement et mentalement aboie moins. C'est l'un des arguments que nous présentons systématiquement aux communes hésitantes.
```

- [ ] **Step 5: Create product JSON files**

```json
// src/content/products/grande-balance.json
{
  "name": "Grande Balance",
  "slug": "grande-balance",
  "category": "contact",
  "description": "Planche basculante professionnelle pour parcours d'agility canin en collectivité.",
  "longDescription": "La Grande Balance Woof! est conçue pour les parcours d'agility professionnels en espace public. Sa structure en acier galvanisé thermolaqué résiste aux intempéries et au vandalisme. Les zones de contact colorées guident naturellement le chien. Conforme EN 16630.",
  "image": "/assets/AG04.webp",
  "imageAlt": "Grande Balance pour parcours agility chien - Woof!",
  "features": ["Acier galvanisé thermolaqué", "Surface antidérapante", "Conforme EN 16630", "Garantie 5 ans", "Hauteur réglable"],
  "ref": "AG04"
}
```

```json
// src/content/products/barre-saut-5-niveaux.json
{
  "name": "Barre de Saut 5 Niveaux",
  "slug": "barre-saut-5-niveaux",
  "category": "saut",
  "description": "Haie de saut réglable sur 5 hauteurs pour adapter l'obstacle à toutes les morphologies de chiens.",
  "longDescription": "La Barre de Saut 5 Niveaux Woof! offre une flexibilité maximale pour s'adapter à tous les gabarits de chiens, du petit au grand. Ses 5 positions de réglage permettent une progression pédagogique optimale. Structure robuste en acier traité pour un usage extérieur intensif.",
  "image": "/assets/AG17.webp",
  "imageAlt": "Barre de Saut 5 Niveaux pour agility chien - Woof!",
  "features": ["5 hauteurs réglables", "Barre amovible sécurisée", "Acier thermolaqué", "Conforme EN 16630", "Garantie 5 ans"],
  "ref": "AG17"
}
```

```json
// src/content/products/tunnel-niche.json
{
  "name": "Tunnel Niche",
  "slug": "tunnel-niche",
  "category": "tunnel",
  "description": "Tunnel rigide en forme de niche, obstacle incontournable de tout parcours d'agility canin.",
  "longDescription": "Le Tunnel Niche Woof! est un obstacle polyvalent qui stimule la confiance et l'agilité du chien. Sa structure rigide en PEHD résiste aux UV et aux chocs. L'entrée en forme de niche attire naturellement le chien. Facile à ancrer dans le sol avec les fixations fournies.",
  "image": "/assets/AG24.webp",
  "imageAlt": "Tunnel Niche pour parcours agility chien - Woof!",
  "features": ["Structure PEHD anti-UV", "Ancrage sol inclus", "Intérieur lavable", "Conforme EN 16630", "Garantie 5 ans"],
  "ref": "AG24"
}
```

- [ ] **Step 6: Verify collections compile**

```bash
npx astro check
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 7: Commit**

```bash
git add src/content/
git commit -m "feat: add content collections (blog MDX + product JSON)"
```

---

## Task 4: Layout Component

**Files:**
- Create: `src/layouts/Layout.astro`
- Create: `src/components/layout/Navbar.astro`
- Create: `src/components/layout/Footer.astro`

- [ ] **Step 1: Create Layout.astro with SEO head**

```astro
---
// src/layouts/Layout.astro
import '../styles/global.css';
import Navbar from '@components/layout/Navbar.astro';
import Footer from '@components/layout/Footer.astro';

interface Props {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
  schema?: object | object[];
}

const {
  title,
  description,
  canonical = Astro.url.href,
  ogImage = '/assets/hero-agility-dog.webp',
  noindex = false,
  schema,
} = Astro.props;

const siteUrl = 'https://woof-parcs.fr';

const orgSchema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness"],
  "name": "Woof!",
  "url": siteUrl,
  "logo": `${siteUrl}/assets/logo-header-woof.png`,
  "description": "Équipements d'agility canine professionnels pour collectivités. Une marque du groupe Herkules Fitness.",
  "telephone": "+33184602330",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Ile du Platais",
    "addressLocality": "Villennes Sur Seine",
    "postalCode": "78670",
    "addressCountry": "FR"
  },
  "sameAs": []
};
---

<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="generator" content={Astro.generator} />

    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    {noindex && <meta name="robots" content="noindex, nofollow" />}

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={`${siteUrl}${ogImage}`} />
    <meta property="og:site_name" content="Woof!" />
    <meta property="og:locale" content="fr_FR" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />

    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/assets/logo-header-woof.png" />

    <!-- Schema.org: Organization (global) -->
    <script type="application/ld+json" set:html={JSON.stringify(orgSchema)} />

    <!-- Page-specific schema (single object or array of schemas) -->
    {schema && (Array.isArray(schema) ? schema : [schema]).map((s) => (
      <script type="application/ld+json" set:html={JSON.stringify(s)} />
    ))}
  </head>
  <body class="bg-bg text-text font-body">
    <Navbar />
    <main>
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 2: Create Navbar.astro**

```astro
---
// src/components/layout/Navbar.astro
const navLinks = [
  { label: 'Accueil', href: '/' },
  { label: 'Nos Produits', href: '/produits' },
  { label: "L'Agility", href: '/agility' },
  { label: 'Qui sommes-nous', href: '/qui-sommes-nous' },
  { label: 'Blog', href: '/blog' },
];
const currentPath = Astro.url.pathname;
---

<header class="fixed top-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur-sm border-b border-primary-light">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">

      <!-- Logo -->
      <a href="/" class="flex-shrink-0">
        <img src="/assets/logo-header-woof.png" alt="Woof! - Parcours Canin Agility" class="h-9 w-auto" />
      </a>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center gap-6">
        {navLinks.map(({ label, href }) => (
          <a
            href={href}
            class={`font-body font-600 text-sm transition-colors ${
              currentPath === href
                ? 'text-primary-dark'
                : 'text-text/70 hover:text-primary'
            }`}
          >
            {label}
          </a>
        ))}
      </nav>

      <!-- CTA -->
      <div class="hidden md:flex items-center gap-3">
        <a href="tel:+33184602330" class="text-sm font-600 text-muted hover:text-primary transition-colors">
          +33 1 84 60 23 30
        </a>
        <a
          href="/contact"
          class="bg-primary hover:bg-primary-dark text-white font-700 text-sm px-4 py-2 rounded-lg transition-colors"
        >
          Demander un Devis
        </a>
      </div>

      <!-- Mobile hamburger -->
      <button
        id="menu-toggle"
        class="md:hidden p-2 rounded-lg text-text hover:bg-surface transition-colors"
        aria-label="Ouvrir le menu"
        aria-expanded="false"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  </div>

  <!-- Mobile menu -->
  <div id="mobile-menu" class="hidden md:hidden border-t border-primary-light bg-bg px-4 py-4">
    <nav class="flex flex-col gap-3">
      {navLinks.map(({ label, href }) => (
        <a href={href} class="font-600 text-sm py-2 text-text/80 hover:text-primary transition-colors">
          {label}
        </a>
      ))}
      <a href="/contact" class="mt-2 bg-primary text-white font-700 text-sm px-4 py-2.5 rounded-lg text-center">
        Demander un Devis
      </a>
    </nav>
  </div>
</header>

<!-- Spacer for fixed nav -->
<div class="h-16"></div>

<script>
  const toggle = document.getElementById('menu-toggle')!;
  const menu = document.getElementById('mobile-menu')!;
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('hidden');
    toggle.setAttribute('aria-expanded', String(!open));
  });
</script>
```

- [ ] **Step 3: Create Footer.astro**

```astro
---
// src/components/layout/Footer.astro
const productLinks = [
  { label: 'Obstacles de saut', href: '/produits?category=saut' },
  { label: 'Tunnels', href: '/produits?category=tunnel' },
  { label: 'Passerelles', href: '/produits?category=contact' },
  { label: 'Plateformes', href: '/produits?category=plateforme' },
];
const companyLinks = [
  { label: 'Qui sommes-nous', href: '/qui-sommes-nous' },
  { label: "L'Agility", href: '/agility' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];
const legalLinks = [
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'Politique de confidentialité', href: '/confidentialite' },
  { label: 'CGV', href: '/cgv' },
];
---

<footer class="bg-text text-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

      <!-- Brand -->
      <div class="md:col-span-1">
        <img src="/assets/logo-woof-yellow.png" alt="Woof!" class="h-10 w-auto mb-4" />
        <p class="text-white/60 text-sm leading-relaxed mb-4">
          Équipements d'agility canine professionnels pour collectivités. Une marque du groupe Herkules Fitness, leader européen.
        </p>
        <div class="flex flex-col gap-2 text-sm text-white/60">
          <span>📍 Ile du Platais, 78670 Villennes Sur Seine</span>
          <a href="tel:+33184602330" class="hover:text-primary transition-colors">📞 +33 1 84 60 23 30</a>
          <a href="/contact" class="hover:text-primary transition-colors">✉️ Nous contacter</a>
        </div>
      </div>

      <!-- Products -->
      <div>
        <h3 class="font-display font-700 text-base mb-4">Nos Produits</h3>
        <ul class="flex flex-col gap-2">
          {productLinks.map(({ label, href }) => (
            <li><a href={href} class="text-sm text-white/60 hover:text-primary transition-colors">{label}</a></li>
          ))}
        </ul>
      </div>

      <!-- Company -->
      <div>
        <h3 class="font-display font-700 text-base mb-4">Entreprise</h3>
        <ul class="flex flex-col gap-2">
          {companyLinks.map(({ label, href }) => (
            <li><a href={href} class="text-sm text-white/60 hover:text-primary transition-colors">{label}</a></li>
          ))}
        </ul>
      </div>

      <!-- Legal -->
      <div>
        <h3 class="font-display font-700 text-base mb-4">Informations</h3>
        <ul class="flex flex-col gap-2">
          {legalLinks.map(({ label, href }) => (
            <li><a href={href} class="text-sm text-white/60 hover:text-primary transition-colors">{label}</a></li>
          ))}
        </ul>
      </div>

    </div>

    <div class="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
      <p class="text-white/40 text-sm">© 2026 Woof! — Une marque Herkules Fitness</p>
      <p class="text-white/40 text-sm">Tous droits réservés</p>
    </div>
  </div>
</footer>
```

- [ ] **Step 4: Create a minimal test page**

```astro
---
// src/pages/index.astro (temporary)
import Layout from '../layouts/Layout.astro';
---
<Layout title="Woof! | Test" description="Test page">
  <div class="p-8">
    <h1 class="font-display text-4xl font-800 text-primary">Woof! fonctionne ✓</h1>
  </div>
</Layout>
```

- [ ] **Step 5: Verify layout renders correctly**

```bash
npm run dev
```

Open `http://localhost:4321` — check nav is fixed, footer is present, font Syne renders on the H1.

- [ ] **Step 6: Commit**

```bash
git add src/layouts/ src/components/layout/ src/pages/index.astro
git commit -m "feat: add Layout, Navbar, Footer components"
```

---

## Task 5: UI Components

**Files:**
- Create: `src/components/ui/Button.astro`
- Create: `src/components/ui/Badge.astro`
- Create: `src/components/ui/SectionHeader.astro`

- [ ] **Step 1: Create Button.astro**

```astro
---
// src/components/ui/Button.astro
interface Props {
  href?: string;
  variant?: 'primary' | 'outline' | 'ghost' | 'white';
  size?: 'sm' | 'md' | 'lg';
  class?: string;
}

const { href, variant = 'primary', size = 'md', class: className = '' } = Astro.props;

const base = 'inline-flex items-center gap-2 font-700 rounded-lg transition-all duration-200 no-underline cursor-pointer';

const variants = {
  primary: 'bg-primary hover:bg-primary-dark text-white shadow-sm hover:shadow-md',
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  ghost: 'text-primary hover:bg-surface',
  white: 'bg-white text-primary-darker hover:bg-primary-light',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
---

{href ? (
  <a href={href} class={classes}><slot /></a>
) : (
  <button class={classes}><slot /></button>
)}
```

- [ ] **Step 2: Create Badge.astro**

```astro
---
// src/components/ui/Badge.astro
interface Props {
  class?: string;
}
const { class: className = '' } = Astro.props;
---
<span class={`inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary-dark font-700 text-xs px-3 py-1.5 rounded-full ${className}`}>
  <slot />
</span>
```

- [ ] **Step 3: Create SectionHeader.astro**

```astro
---
// src/components/ui/SectionHeader.astro
interface Props {
  label?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  light?: boolean;
}
const { label, title, subtitle, center = false, light = false } = Astro.props;
---
<div class={center ? 'text-center' : ''}>
  {label && (
    <p class={`font-700 text-xs tracking-widest uppercase mb-3 ${light ? 'text-primary-light' : 'text-primary'}`}>
      {label}
    </p>
  )}
  <h2 class={`font-display font-800 text-3xl md:text-4xl leading-tight mb-4 ${light ? 'text-white' : 'text-text'}`}>
    {title}
  </h2>
  {subtitle && (
    <p class={`text-base leading-relaxed max-w-2xl ${center ? 'mx-auto' : ''} ${light ? 'text-white/70' : 'text-muted'}`}>
      {subtitle}
    </p>
  )}
</div>
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add Button, Badge, SectionHeader UI components"
```

---

## Task 6: Homepage — Hero Section

**Files:**
- Create: `src/components/sections/Hero.astro`

- [ ] **Step 1: Create Hero.astro**

```astro
---
// src/components/sections/Hero.astro
import Button from '@components/ui/Button.astro';
import Badge from '@components/ui/Badge.astro';
---

<section class="relative min-h-[90vh] flex items-center overflow-hidden">

  <!-- Background image -->
  <img
    src="/assets/hero-agility-dog.webp"
    alt="Parc d'agility canine avec chien en action dans une commune française"
    class="absolute inset-0 w-full h-full object-cover"
    fetchpriority="high"
    loading="eager"
  />

  <!-- Overlay -->
  <div class="absolute inset-0 bg-gradient-to-r from-text/75 via-text/50 to-transparent"></div>

  <!-- Content -->
  <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

      <!-- Left: text -->
      <div>
        <Badge class="mb-6">🐾 Déjà plus de 500 communes équipées en Europe</Badge>

        <h1 class="font-display font-800 text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-6">
          Créez votre parcours canin agility<br>
          <span class="text-primary">en collectivité.</span>
        </h1>

        <p class="text-white/80 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
          Des équipements d'agility canine conçus pour les espaces publics.
          Woof!, une marque de <strong class="text-white">Herkules Fitness</strong>,
          leader européen depuis plus de 20 ans.
        </p>

        <div class="flex flex-wrap gap-3">
          <Button href="/produits" variant="white" size="lg">
            📋 Voir le catalogue Mairie
          </Button>
          <Button href="/contact" variant="outline" size="lg" class="border-white text-white hover:bg-white hover:text-primary-darker">
            Demander un devis gratuit
          </Button>
        </div>
      </div>

      <!-- Right: guarantee card -->
      <div class="hidden lg:flex justify-end">
        <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-xs text-white">
          <img
            src="/assets/hero-agility-dog.webp"
            alt="Chien effectuant un parcours d'agility dans un parc public"
            class="w-full h-40 object-cover rounded-xl mb-4"
            loading="lazy"
          />
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-xl flex-shrink-0">✓</div>
            <div>
              <p class="font-700 text-base">Garantie 5 ans</p>
              <p class="text-white/70 text-sm">Sur toute la gamme</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>
```

- [ ] **Step 2: Add Hero to index.astro and verify**

```astro
---
// src/pages/index.astro
import Layout from '../layouts/Layout.astro';
import Hero from '@components/sections/Hero.astro';
---
<Layout
  title="Fabricant d'Équipements Canins pour Collectivités | Woof"
  description="Woof! conçoit des parcours canin agility pour collectivités. Équipements certifiés EN 16630, garantie 5 ans. Devis gratuit en 48h."
>
  <Hero />
</Layout>
```

Run `npm run dev` — verify hero displays with image, gradient overlay, badge, H1, and buttons.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Hero.astro src/pages/index.astro
git commit -m "feat: add Hero section to homepage"
```

---

## Task 7: Homepage — Best-Sellers

**Files:**
- Create: `src/components/sections/BestSellers.astro`

- [ ] **Step 1: Create BestSellers.astro**

```astro
---
// src/components/sections/BestSellers.astro
import SectionHeader from '@components/ui/SectionHeader.astro';
import Button from '@components/ui/Button.astro';

const products = [
  {
    name: 'Grande Balance',
    slug: 'grande-balance',
    image: '/assets/AG04.webp',
    imageAlt: 'Grande Balance - Parcours Agility Chien - Woof!',
    category: 'Équilibre & Contact',
    ref: 'AG04',
  },
  {
    name: 'Barre de Saut 5 Niveaux',
    slug: 'barre-saut-5-niveaux',
    image: '/assets/AG17.webp',
    imageAlt: 'Barre de Saut 5 Niveaux - Parcours Agility Chien - Woof!',
    category: 'Saut',
    ref: 'AG17',
  },
  {
    name: 'Tunnel Niche',
    slug: 'tunnel-niche',
    image: '/assets/AG24.webp',
    imageAlt: 'Tunnel Niche - Parcours Agility Chien - Woof!',
    category: 'Tunnel',
    ref: 'AG24',
  },
];
---

<section class="py-20 bg-bg">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
      <SectionHeader
        label="Équipements d'agility canine"
        title="Nos Best-Sellers pour Parcours Canin Agility"
      />
      <Button href="/produits" variant="outline" size="md" class="flex-shrink-0">
        Voir tout le catalogue →
      </Button>
    </div>

    <p class="text-muted text-base leading-relaxed mb-10 max-w-3xl">
      Découvrez les équipements d'agility canine les plus plébiscités par les mairies et collectivités locales.
      Chaque obstacle est certifié EN 16630 et garanti 5 ans.
    </p>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <article class="bg-white rounded-2xl overflow-hidden border border-primary-light hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div class="aspect-[4/3] overflow-hidden bg-surface">
            <img
              src={product.image}
              alt={product.imageAlt}
              class="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
          <div class="p-5">
            <span class="text-xs font-700 text-primary uppercase tracking-wider">{product.category}</span>
            <h3 class="font-display font-700 text-lg text-text mt-1 mb-3">{product.name}</h3>
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted font-600">Réf. {product.ref}</span>
              <a
                href={`/produits#${product.slug}`}
                class="text-sm font-700 text-primary hover:text-primary-dark transition-colors"
              >
                Voir le détail →
              </a>
            </div>
          </div>
        </article>
      ))}
    </div>

  </div>
</section>
```

- [ ] **Step 2: Add to index.astro and verify**

Import and add `<BestSellers />` after `<Hero />` in `src/pages/index.astro`.

Run dev — verify 3 product cards render with images and hover effect.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/BestSellers.astro src/pages/index.astro
git commit -m "feat: add BestSellers section to homepage"
```

---

## Task 8: Homepage — WhyWoof Section

**Files:**
- Create: `src/components/sections/WhyWoof.astro`

- [ ] **Step 1: Create WhyWoof.astro**

```astro
---
// src/components/sections/WhyWoof.astro
import SectionHeader from '@components/ui/SectionHeader.astro';

const features = [
  {
    icon: '🛡',
    title: 'Durabilité Extrême',
    desc: 'Acier galvanisé thermolaqué résistant aux intempéries, à la corrosion et au vandalisme. Conçu pour un usage intensif en milieu collectif.',
  },
  {
    icon: '✅',
    title: 'Sécurité Certifiée',
    desc: 'Conforme aux normes européennes EN 16630. Coins arrondis, surfaces antidérapantes et hauteurs adaptées pour la sécurité des chiens.',
  },
  {
    icon: '🌟',
    title: 'Sérénité Garantie',
    desc: 'Garantie 5 ans sur toute la gamme. SAV basé en France, pièces détachées disponibles pendant 10 ans.',
  },
];

const advantages = [
  'Fabrication européenne certifiée',
  'Livraison et installation sur site',
  'Accompagnement marchés publics',
  'Plans d\'implantation personnalisés',
  'Formation à la maintenance',
  'Devis gratuit sous 48h',
];
---

<section class="py-20 bg-surface">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    <SectionHeader
      label="Expertise & Qualité"
      title="Pourquoi choisir Woof pour votre parcours canin agility ?"
      subtitle="Depuis plus de 20 ans, Herkules Fitness conçoit des équipements de sports en extérieur pour les collectivités européennes. Woof! perpétue cette expertise dans le domaine de l'agility canine."
      class="mb-12"
    />

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {features.map((f) => (
        <div class="bg-white rounded-2xl p-6 border border-primary-light">
          <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl mb-4">{f.icon}</div>
          <h3 class="font-display font-700 text-lg text-text mb-2">{f.title}</h3>
          <p class="text-muted text-sm leading-relaxed">{f.desc}</p>
        </div>
      ))}
    </div>

    <div class="bg-white rounded-2xl p-6 border border-primary-light">
      <h3 class="font-display font-700 text-base text-text mb-4">Les avantages Woof pour les collectivités</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {advantages.map((adv) => (
          <div class="flex items-center gap-2 text-sm font-600 text-text">
            <span class="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">✓</span>
            {adv}
          </div>
        ))}
      </div>
    </div>

  </div>
</section>
```

- [ ] **Step 2: Add to index.astro and verify**

Import and add `<WhyWoof />` after `<BestSellers />`.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/WhyWoof.astro src/pages/index.astro
git commit -m "feat: add WhyWoof section to homepage"
```

---

## Task 9: Homepage — Guide Élus + Accompagnement + Herkules

**Files:**
- Create: `src/components/sections/GuideElus.astro`
- Create: `src/components/sections/Accompagnement.astro`
- Create: `src/components/sections/Herkules.astro`

- [ ] **Step 1: Create GuideElus.astro**

```astro
---
// src/components/sections/GuideElus.astro
import SectionHeader from '@components/ui/SectionHeader.astro';
import Button from '@components/ui/Button.astro';

const benefits = [
  { icon: '🤝', title: 'Lien social renforcé', desc: 'Un lieu de rencontre pour les propriétaires de chiens.' },
  { icon: '🌿', title: 'Espaces verts préservés', desc: 'Des zones dédiées pour moins de déjections sauvages.' },
  { icon: '🐕', title: 'Bien-être animal', desc: 'Activité physique et mentale complète pour les chiens.' },
];
---

<section class="py-20 bg-bg">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

      <div class="order-2 lg:order-1 rounded-2xl overflow-hidden">
        <img
          src="/assets/features-tunnel-dog.webp"
          alt="Propriétaire et son chien dans un parc d'agility canine municipal"
          class="w-full h-80 lg:h-96 object-cover rounded-2xl"
          loading="lazy"
        />
      </div>

      <div class="order-1 lg:order-2">
        <SectionHeader
          label="Guide pour les élus"
          title="Pourquoi installer un parcours canin agility dans votre commune ?"
          subtitle="Avec plus de 7 millions de chiens en France, offrir des espaces adaptés devient essentiel. Un parcours d'agility valorise vos espaces verts et renforce l'attractivité de votre commune."
        />

        <div class="mt-8 flex flex-col gap-4 mb-8">
          {benefits.map((b) => (
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{b.icon}</div>
              <div>
                <h3 class="font-display font-700 text-base text-text">{b.title}</h3>
                <p class="text-muted text-sm mt-0.5">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Button href="/agility" variant="primary" size="lg">
          En savoir plus sur l'agility →
        </Button>
      </div>

    </div>
  </div>
</section>
```

- [ ] **Step 2: Create Accompagnement.astro**

```astro
---
// src/components/sections/Accompagnement.astro
import SectionHeader from '@components/ui/SectionHeader.astro';
import Button from '@components/ui/Button.astro';

const steps = [
  { icon: '💬', title: 'Conseils personnalisés', desc: 'Nos experts analysent vos besoins et vous orientent vers les meilleures solutions.' },
  { icon: '📐', title: 'Plans sur-mesure', desc: 'Conception de plans adaptés à votre espace et à vos contraintes techniques.' },
  { icon: '🎨', title: 'Visuels & rendus 3D', desc: 'Visualisez votre projet avant réalisation grâce à nos rendus photoréalistes.' },
  { icon: '📅', title: 'Planification', desc: 'Organisation et coordination de toutes les étapes de votre projet.' },
  { icon: '🔧', title: 'Installation', desc: 'Pose professionnelle par nos équipes ou partenaires certifiés.' },
  { icon: '⚙️', title: 'Maintenance', desc: 'Suivi et entretien pour garantir la durabilité de vos équipements.' },
];
---

<section class="py-20 bg-surface">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    <SectionHeader
      label="À vos côtés"
      title="Un accompagnement personnalisé de A à Z"
      subtitle="Du premier contact jusqu'à la maintenance, nos équipes vous accompagnent à chaque étape de votre projet d'aménagement canin."
      class="mb-12"
    />

    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
      {steps.map((step) => (
        <div class="bg-white rounded-xl p-5 border border-primary-light">
          <div class="text-2xl mb-3">{step.icon}</div>
          <h3 class="font-display font-700 text-sm text-text mb-1">{step.title}</h3>
          <p class="text-muted text-xs leading-relaxed">{step.desc}</p>
        </div>
      ))}
    </div>

    <div class="bg-white rounded-2xl p-6 border border-primary flex flex-col sm:flex-row items-center gap-6">
      <div class="flex-1">
        <p class="font-700 text-xs text-primary uppercase tracking-wider mb-1">Réseau national</p>
        <h3 class="font-display font-700 text-lg text-text mb-2">Un accompagnement au plus près de chez vous</h3>
        <p class="text-muted text-sm leading-relaxed">
          Grâce à notre réseau de distributeurs répartis à travers toute la France, nous sommes en mesure de vous accompagner localement.
        </p>
      </div>
      <Button href="/contact" variant="primary" size="md" class="flex-shrink-0">
        Trouver mon interlocuteur →
      </Button>
    </div>

  </div>
</section>
```

- [ ] **Step 3: Create Herkules.astro**

```astro
---
// src/components/sections/Herkules.astro
import Button from '@components/ui/Button.astro';

const steps = [
  { num: '01', title: 'Conseil & Design', desc: 'Étude personnalisée et conception sur-mesure de votre parcours.' },
  { num: '02', title: 'Mandat Administratif', desc: 'Accompagnement dans vos démarches de marchés publics.' },
  { num: '03', title: 'Installation', desc: 'Pose professionnelle par nos équipes certifiées.' },
];
---

<section class="py-20 bg-primary-darker text-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

      <div>
        <p class="font-700 text-xs text-primary-light uppercase tracking-widest mb-3">Herkules Fitness</p>
        <h2 class="font-display font-800 text-3xl md:text-4xl text-white leading-tight mb-6">
          La puissance d'un leader européen au service de l'agility canine.
        </h2>
        <p class="text-white/70 text-base leading-relaxed mb-3">
          Woof! est une marque de <strong class="text-white">Herkules Fitness</strong>, le leader européen des équipements de sports et de loisirs en extérieur. Fort de plus de 20 ans d'expérience, Herkules Fitness a équipé plus de 500 communes en Europe.
        </p>
        <p class="text-white/70 text-base leading-relaxed mb-8">
          Cette expertise industrielle se traduit par des processus de fabrication rigoureux, une logistique optimisée et un accompagnement complet des collectivités dans leurs projets d'aménagement de parcours canins agility.
        </p>
        <Button href="/contact" variant="white" size="lg">
          Démarrer votre projet →
        </Button>
      </div>

      <div class="flex flex-col gap-4">
        {steps.map((step) => (
          <div class="flex items-start gap-5 bg-white/5 border border-white/10 rounded-xl p-5">
            <div class="font-display font-800 text-3xl text-primary flex-shrink-0 leading-none">{step.num}</div>
            <div>
              <h3 class="font-display font-700 text-base text-white mb-1">{step.title}</h3>
              <p class="text-white/60 text-sm leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  </div>
</section>
```

- [ ] **Step 4: Add all three sections to index.astro and verify**

Import and add `<GuideElus />`, `<Accompagnement />`, `<Herkules />` in order after `<WhyWoof />`.

Run dev — verify all sections render correctly.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/GuideElus.astro src/components/sections/Accompagnement.astro src/components/sections/Herkules.astro src/pages/index.astro
git commit -m "feat: add GuideElus, Accompagnement, Herkules sections"
```

---

## Task 10: Homepage — FAQ + Blog Preview + CTA Final

**Files:**
- Create: `src/components/sections/FAQSection.astro`
- Create: `src/components/sections/BlogPreview.astro`
- Create: `src/components/sections/CTAFinal.astro`

- [ ] **Step 1: Create FAQSection.astro**

```astro
---
// src/components/sections/FAQSection.astro
import SectionHeader from '@components/ui/SectionHeader.astro';

interface Props {
  faqs?: Array<{ q: string; a: string }>;
}

const defaultFaqs = [
  {
    q: 'Quel budget prévoir pour un parcours d\'agility canin ?',
    a: 'Le budget pour un parcours d\'agility canin varie selon la taille et le nombre d\'obstacles. Un parcours complet de 8 à 12 obstacles pour une collectivité est généralement compris entre 8 000 € et 25 000 € HT, installation incluse. Nous établissons des devis personnalisés gratuits en moins de 48h, adaptés à votre budget et à la surface disponible.',
  },
  {
    q: 'Quelle surface faut-il pour installer un parcours canin ?',
    a: 'Un parcours canin agility de base nécessite environ 300 à 400 m² pour offrir une expérience satisfaisante. Un parcours complet demande idéalement 600 à 800 m². Nous pouvons adapter notre gamme à des espaces plus restreints en sélectionnant les obstacles les plus adaptés à votre configuration.',
  },
  {
    q: 'Les équipements sont-ils conformes aux normes de sécurité ?',
    a: 'Oui, tous nos équipements Woof! sont conformes à la norme européenne EN 16630 relative aux équipements d\'entraînement en plein air. Ils sont conçus avec des finitions antidérapantes, des coins arrondis et des matériaux résistants aux intempéries et au vandalisme. Chaque livraison est accompagnée du certificat de conformité.',
  },
  {
    q: 'Quelle est la durée de vie des équipements d\'agility ?',
    a: 'Nos équipements en acier galvanisé thermolaqué sont conçus pour durer 15 à 20 ans en usage intensif extérieur. Nous offrons une garantie de 5 ans sur toute la gamme, et les pièces détachées sont disponibles pendant 10 ans minimum après l\'achat. Un entretien annuel simple suffit à maintenir les équipements en parfait état.',
  },
  {
    q: 'Comment se déroule l\'installation d\'un parcours canin ?',
    a: 'L\'installation est réalisée par nos équipes certifiées ou nos partenaires locaux. Elle comprend la préparation du terrain, la pose des ancres béton, l\'assemblage des obstacles et les tests de sécurité finaux. L\'installation d\'un parcours complet prend généralement 1 à 2 jours. Nous fournissons ensuite un plan d\'entretien et une formation à la maintenance.',
  },
  {
    q: 'Proposez-vous un accompagnement pour les marchés publics ?',
    a: 'Oui, nous accompagnons les collectivités dans leurs démarches de marchés publics. Notre équipe administrative peut vous aider à rédiger les cahiers des charges, fournir les documents techniques nécessaires et vous guider dans les procédures d\'appel d\'offres. Nous avons l\'expérience de centaines de marchés publics en France et en Europe.',
  },
];

const { faqs = defaultFaqs } = Astro.props;

const schema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(({ q, a }) => ({
    "@type": "Question",
    "name": q,
    "acceptedAnswer": { "@type": "Answer", "text": a },
  })),
};
---

<section class="py-20 bg-bg" data-faq-schema={JSON.stringify(schema)}>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

    <SectionHeader
      label="Questions fréquentes"
      title="Tout savoir sur les parcours d'agility pour collectivités"
      center
      class="mb-12"
    />

    <div class="flex flex-col gap-2" id="faq-list">
      {faqs.map((faq, i) => (
        <div class="border border-primary-light rounded-xl overflow-hidden">
          <button
            class="w-full text-left px-6 py-4 flex items-center justify-between gap-4 bg-white hover:bg-surface transition-colors font-display font-700 text-sm sm:text-base text-text"
            aria-expanded="false"
            data-faq-toggle={i}
          >
            <span>{faq.q}</span>
            <svg class="w-5 h-5 flex-shrink-0 text-primary transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div class="hidden px-6 pb-4 bg-white text-muted text-sm leading-relaxed" data-faq-answer={i}>
            {faq.a}
          </div>
        </div>
      ))}
    </div>

  </div>
</section>

<!-- Inject FAQPage schema -->
<script is:inline define:vars={{ schema }}>
  const el = document.createElement('script');
  el.type = 'application/ld+json';
  el.textContent = JSON.stringify(schema);
  document.head.appendChild(el);
</script>

<script>
  document.querySelectorAll('[data-faq-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const i = btn.getAttribute('data-faq-toggle');
      const answer = document.querySelector(`[data-faq-answer="${i}"]`)!;
      const svg = btn.querySelector('svg')!;
      const isOpen = !answer.classList.contains('hidden');
      answer.classList.toggle('hidden', isOpen);
      svg.style.transform = isOpen ? '' : 'rotate(180deg)';
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });
</script>
```

- [ ] **Step 2: Create BlogPreview.astro**

```astro
---
// src/components/sections/BlogPreview.astro
import { getCollection } from 'astro:content';
import Button from '@components/ui/Button.astro';

const posts = (await getCollection('blog'))
  .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())
  .slice(0, 3);
---

<section class="py-20 bg-surface">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
      <h2 class="font-display font-800 text-3xl text-text">Nos derniers articles</h2>
      <Button href="/blog" variant="outline" size="md">Voir tous les articles →</Button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {posts.map((post) => (
        <article class="bg-white rounded-2xl overflow-hidden border border-primary-light hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <a href={`/blog/${post.slug}`}>
            <img
              src={post.data.image}
              alt={post.data.imageAlt}
              class="w-full h-48 object-cover"
              loading="lazy"
            />
          </a>
          <div class="p-5">
            <span class="text-xs font-700 text-primary uppercase tracking-wider">{post.data.category}</span>
            <h3 class="font-display font-700 text-base text-text mt-1 mb-2 line-clamp-2">
              <a href={`/blog/${post.slug}`} class="hover:text-primary transition-colors">{post.data.title}</a>
            </h3>
            <p class="text-muted text-sm leading-relaxed line-clamp-2 mb-3">{post.data.description}</p>
            <a href={`/blog/${post.slug}`} class="text-sm font-700 text-primary hover:text-primary-dark transition-colors">
              Lire l'article →
            </a>
          </div>
        </article>
      ))}
    </div>

  </div>
</section>
```

- [ ] **Step 3: Create CTAFinal.astro**

```astro
---
// src/components/sections/CTAFinal.astro
import Button from '@components/ui/Button.astro';
---

<section class="py-20 bg-primary">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

    <h2 class="font-display font-800 text-3xl sm:text-4xl text-white mb-4">
      Prêt à créer un espace canin dans votre commune ?
    </h2>
    <p class="text-white/80 text-base sm:text-lg mb-10 max-w-2xl mx-auto">
      Nos experts vous accompagnent de la conception à l'installation. Obtenez un devis personnalisé gratuit en 48h.
    </p>

    <div class="flex flex-wrap justify-center gap-4 mb-10">
      <Button href="/contact" variant="white" size="lg">
        📋 Demander un devis gratuit
      </Button>
      <Button href="tel:+33184602330" variant="outline" size="lg" class="border-white text-white hover:bg-white hover:text-primary-darker">
        📞 Nous appeler
      </Button>
    </div>

    <div class="flex flex-wrap justify-center gap-6 text-white/70 text-sm">
      <span class="flex items-center gap-2">📍 Ile du Platais, 78670 Villennes Sur Seine</span>
      <span class="flex items-center gap-2">📞 +33 1 84 60 23 30</span>
    </div>

  </div>
</section>
```

- [ ] **Step 4: Complete index.astro**

```astro
---
// src/pages/index.astro — final
import Layout from '../layouts/Layout.astro';
import Hero from '@components/sections/Hero.astro';
import BestSellers from '@components/sections/BestSellers.astro';
import WhyWoof from '@components/sections/WhyWoof.astro';
import GuideElus from '@components/sections/GuideElus.astro';
import Accompagnement from '@components/sections/Accompagnement.astro';
import Herkules from '@components/sections/Herkules.astro';
import FAQSection from '@components/sections/FAQSection.astro';
import BlogPreview from '@components/sections/BlogPreview.astro';
import CTAFinal from '@components/sections/CTAFinal.astro';
---

<Layout
  title="Fabricant d'Équipements Canins pour Collectivités | Woof"
  description="Woof! conçoit des parcours canin agility pour collectivités. Équipements certifiés EN 16630, garantie 5 ans, installation incluse. Devis gratuit en 48h."
>
  <Hero />
  <BestSellers />
  <WhyWoof />
  <GuideElus />
  <Accompagnement />
  <Herkules />
  <FAQSection />
  <BlogPreview />
  <CTAFinal />
</Layout>
```

- [ ] **Step 5: Verify full homepage**

```bash
npm run dev
```

Scroll through the full homepage — all 9 sections must render without errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/sections/ src/pages/index.astro
git commit -m "feat: complete homepage with FAQ, BlogPreview, CTAFinal"
```

---

## Task 11: Products Page

**Files:**
- Create: `src/pages/produits.astro`

- [ ] **Step 1: Create produits.astro**

```astro
---
// src/pages/produits.astro
import Layout from '../layouts/Layout.astro';
import { getCollection } from 'astro:content';
import Button from '@components/ui/Button.astro';
import CTAFinal from '@components/sections/CTAFinal.astro';

const products = await getCollection('products');

const categories = [
  { id: 'all', label: 'Tous les produits' },
  { id: 'saut', label: 'Saut' },
  { id: 'tunnel', label: 'Tunnels' },
  { id: 'contact', label: 'Contact & Équilibre' },
  { id: 'plateforme', label: 'Plateformes' },
];
---

<Layout
  title="Nos Produits — Équipements d'Agility Canin | Woof"
  description="Découvrez toute la gamme d'équipements d'agility canine Woof! pour collectivités : haies de saut, tunnels, passerelles, balances. Certifiés EN 16630, garantie 5 ans."
>
  <section class="py-16 bg-bg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <div class="mb-10">
        <p class="font-700 text-xs text-primary uppercase tracking-widest mb-3">Notre gamme</p>
        <h1 class="font-display font-800 text-4xl text-text mb-4">Équipements d'agility canine pour collectivités</h1>
        <p class="text-muted text-base max-w-2xl">
          Tous nos équipements sont fabriqués en Europe, certifiés EN 16630 et garantis 5 ans.
          Chaque obstacle est pensé pour un usage intensif en espace public.
        </p>
      </div>

      <!-- Category filters -->
      <div class="flex flex-wrap gap-2 mb-10" id="filters">
        {categories.map((cat) => (
          <button
            class:list={[
              'px-4 py-2 rounded-full text-sm font-700 border transition-colors filter-btn',
              cat.id === 'all'
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-text border-primary-light hover:border-primary hover:text-primary',
            ]}
            data-category={cat.id}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <!-- Products grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="products-grid">
        {products.map((product) => (
          <article
            class="bg-white rounded-2xl overflow-hidden border border-primary-light hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
            data-category={product.data.category}
            id={product.data.slug}
          >
            <div class="aspect-[4/3] overflow-hidden bg-surface">
              <img
                src={product.data.image}
                alt={product.data.imageAlt}
                class="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <div class="p-6">
              <span class="text-xs font-700 text-primary uppercase tracking-wider">{product.data.category}</span>
              <h2 class="font-display font-700 text-lg text-text mt-1 mb-2">{product.data.name}</h2>
              <p class="text-muted text-sm leading-relaxed mb-4">{product.data.description}</p>
              <div class="flex flex-wrap gap-1 mb-4">
                {product.data.features.slice(0, 3).map((f) => (
                  <span class="text-xs font-600 bg-surface text-primary-dark px-2 py-1 rounded-full">{f}</span>
                ))}
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-muted">Réf. {product.data.ref}</span>
                <Button href="/contact" variant="primary" size="sm">Demander un devis</Button>
              </div>
            </div>
          </article>
        ))}
      </div>

    </div>
  </section>

  <CTAFinal />
</Layout>

<script>
  const btns = document.querySelectorAll<HTMLButtonElement>('.filter-btn');
  const cards = document.querySelectorAll<HTMLElement>('[data-category]');

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.category!;
      btns.forEach((b) => {
        b.className = b.className
          .replace('bg-primary text-white border-primary', '')
          .replace('bg-white text-text border-primary-light', '')
          + (b === btn ? ' bg-primary text-white border-primary' : ' bg-white text-text border-primary-light');
      });
      cards.forEach((card) => {
        const show = cat === 'all' || card.dataset.category === cat;
        (card as HTMLElement).style.display = show ? '' : 'none';
      });
    });
  });
</script>
```

- [ ] **Step 2: Verify page**

```bash
npm run dev
```

Open `/produits` — check all 3 products display, category filter buttons visible.

- [ ] **Step 3: Commit**

```bash
git add src/pages/produits.astro
git commit -m "feat: add Produits page with category filter"
```

---

## Task 12: Blog Pages

**Files:**
- Create: `src/pages/blog/index.astro`
- Create: `src/pages/blog/[...slug].astro`

- [ ] **Step 1: Create blog listing page**

```astro
---
// src/pages/blog/index.astro
import Layout from '../../layouts/Layout.astro';
import { getCollection } from 'astro:content';
import CTAFinal from '@components/sections/CTAFinal.astro';

const posts = (await getCollection('blog'))
  .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
---

<Layout
  title="Blog — Conseils pour Parcours Canin Agility | Woof"
  description="Découvrez nos conseils et guides sur l'agility canine, l'aménagement de parcs pour chiens et les bonnes pratiques pour les collectivités."
>
  <section class="py-16 bg-bg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <p class="font-700 text-xs text-primary uppercase tracking-widest mb-3">Blog</p>
        <h1 class="font-display font-800 text-4xl text-text">Nos derniers articles</h1>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <article class="bg-white rounded-2xl overflow-hidden border border-primary-light hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <a href={`/blog/${post.slug}`}>
              <img src={post.data.image} alt={post.data.imageAlt} class="w-full h-48 object-cover" loading="lazy" />
            </a>
            <div class="p-5">
              <span class="text-xs font-700 text-primary uppercase tracking-wider">{post.data.category}</span>
              <h2 class="font-display font-700 text-base text-text mt-1 mb-2">
                <a href={`/blog/${post.slug}`} class="hover:text-primary transition-colors">{post.data.title}</a>
              </h2>
              <p class="text-muted text-sm leading-relaxed line-clamp-2 mb-3">{post.data.description}</p>
              <time class="text-xs text-muted" datetime={post.data.pubDate.toISOString()}>
                {post.data.pubDate.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </time>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
  <CTAFinal />
</Layout>
```

- [ ] **Step 2: Create blog article template**

```astro
---
// src/pages/blog/[...slug].astro
import Layout from '../../layouts/Layout.astro';
import { getCollection, render } from 'astro:content';
import CTAFinal from '@components/sections/CTAFinal.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({ params: { slug: post.slug }, props: { post } }));
}

const { post } = Astro.props;
const { Content } = await render(post);

const schema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": post.data.title,
  "description": post.data.description,
  "image": `https://woof-parcs.fr${post.data.image}`,
  "datePublished": post.data.pubDate.toISOString(),
  "author": { "@type": "Organization", "name": "Woof!" },
  "publisher": { "@type": "Organization", "name": "Woof!", "logo": { "@type": "ImageObject", "url": "https://woof-parcs.fr/assets/logo-header-woof.png" } },
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://woof-parcs.fr/" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://woof-parcs.fr/blog" },
    { "@type": "ListItem", "position": 3, "name": post.data.title },
  ],
};
---

<Layout
  title={`${post.data.title} | Blog Woof`}
  description={post.data.description}
  ogImage={post.data.image}
  schema={[schema, breadcrumb]}
>
  <article class="py-16 bg-bg">
    <div class="max-w-3xl mx-auto px-4 sm:px-6">

      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-xs text-muted mb-8">
        <a href="/" class="hover:text-primary">Accueil</a>
        <span>/</span>
        <a href="/blog" class="hover:text-primary">Blog</a>
        <span>/</span>
        <span class="text-text truncate">{post.data.title}</span>
      </nav>

      <!-- Header -->
      <span class="font-700 text-xs text-primary uppercase tracking-wider">{post.data.category}</span>
      <h1 class="font-display font-800 text-3xl sm:text-4xl text-text mt-2 mb-4 leading-tight">{post.data.title}</h1>
      <p class="text-muted text-base mb-6">{post.data.description}</p>
      <time class="text-xs text-muted block mb-8" datetime={post.data.pubDate.toISOString()}>
        Publié le {post.data.pubDate.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
      </time>

      <!-- Hero image -->
      <img src={post.data.image} alt={post.data.imageAlt} class="w-full rounded-2xl mb-10 aspect-video object-cover" loading="eager" />

      <!-- Content -->
      <div class="prose prose-lg prose-headings:font-display prose-headings:font-700 prose-a:text-primary max-w-none">
        <Content />
      </div>

    </div>
  </article>
  <CTAFinal />
</Layout>
```

- [ ] **Step 3: Install Tailwind typography plugin**

```bash
npm install @tailwindcss/typography
```

Add to `src/styles/global.css`:
```css
@plugin "@tailwindcss/typography";
```

- [ ] **Step 4: Verify blog pages**

Run dev, open `/blog` and click an article. Check breadcrumb, image, and MDX content renders.

- [ ] **Step 5: Commit**

```bash
git add src/pages/blog/ src/styles/global.css
git commit -m "feat: add Blog listing and article pages with BlogPosting schema"
```

---

## Task 13: Content Pages (Agility, Qui sommes-nous, Contact)

**Files:**
- Create: `src/pages/agility.astro`
- Create: `src/pages/qui-sommes-nous.astro`
- Create: `src/pages/contact.astro`

- [ ] **Step 1: Create agility.astro**

```astro
---
// src/pages/agility.astro
import Layout from '../layouts/Layout.astro';
import FAQSection from '@components/sections/FAQSection.astro';
import CTAFinal from '@components/sections/CTAFinal.astro';
import SectionHeader from '@components/ui/SectionHeader.astro';

const agilityFaqs = [
  { q: "Qu'est-ce que l'agility canine ?", a: "L'agility canine est un sport qui consiste à guider son chien sur un parcours d'obstacles dans un temps limité. Née en Grande-Bretagne en 1978, cette discipline développe la complicité entre le chien et son maître, améliore l'obéissance, l'agilité et le bien-être mental de l'animal. Elle est pratiquée aussi bien en compétition qu'en loisir dans les parcs publics." },
  { q: "À partir de quel âge un chien peut-il pratiquer l'agility ?", a: "Il est recommandé d'attendre que le chien ait au moins 12 mois, et idéalement 18 mois pour les grandes races, avant de commencer l'agility avec des sauts. Les articulations d'un chiot ne sont pas encore consolidées et les exercices d'impact répété peuvent provoquer des lésions durables. Pour les exercices au sol (tunnels, slalom lent), on peut commencer dès 6-8 mois." },
  { q: "L'agility est-elle adaptée à tous les chiens ?", a: "L'agility convient à la grande majorité des chiens, quelle que soit leur race ou leur taille. Les équipements Woof! sont disponibles en version petits chiens (barres à hauteur réduite) et grands chiens. Même les chiens âgés peuvent pratiquer une forme douce d'agility, adaptée à leurs capacités physiques. Seuls les chiens ayant des contre-indications médicales (troubles articulaires sévères, cardiaques) doivent consulter un vétérinaire avant de commencer." },
];
---

<Layout
  title="L'Agility Canine — Guide Complet pour Collectivités | Woof"
  description="Tout savoir sur l'agility canine : bienfaits, réglementation, équipements, pratique. Guide complet pour les communes souhaitant installer un parcours agility."
>
  <section class="py-16 bg-bg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mb-16">
        <p class="font-700 text-xs text-primary uppercase tracking-widest mb-3">Guide complet</p>
        <h1 class="font-display font-800 text-4xl sm:text-5xl text-text mb-6 leading-tight">
          L'agility canine en collectivité
        </h1>
        <p class="text-muted text-lg leading-relaxed">
          L'agility canine est bien plus qu'un simple loisir : c'est un vecteur de lien social, de bien-être animal et d'attractivité pour votre commune. Découvrez tout ce que vous devez savoir pour créer un espace agility réussi.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[
          { icon: '🧠', title: 'Bien-être mental', desc: 'L\'agility stimule les capacités cognitives du chien et renforce sa confiance en lui grâce à la résolution de problèmes et à la mémorisation des enchaînements.' },
          { icon: '💪', title: 'Condition physique', desc: 'Un parcours d\'agility travaille l\'endurance, la coordination et la souplesse du chien. Une session de 20 minutes équivaut à plusieurs kilomètres de marche.' },
          { icon: '❤️', title: 'Lien maître-chien', desc: 'La pratique de l\'agility renforce considérablement la communication et la confiance mutuelle entre le chien et son propriétaire, base de toute éducation réussie.' },
        ].map((item) => (
          <div class="bg-surface rounded-2xl p-6 border border-primary-light">
            <div class="text-3xl mb-4">{item.icon}</div>
            <h2 class="font-display font-700 text-lg text-text mb-2">{item.title}</h2>
            <p class="text-muted text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

    </div>
  </section>

  <FAQSection faqs={agilityFaqs} />
  <CTAFinal />
</Layout>
```

- [ ] **Step 2: Create qui-sommes-nous.astro**

```astro
---
// src/pages/qui-sommes-nous.astro
import Layout from '../layouts/Layout.astro';
import CTAFinal from '@components/sections/CTAFinal.astro';
---

<Layout
  title="Qui sommes-nous — Woof! par Herkules Fitness | Leader Européen"
  description="Woof! est une marque de Herkules Fitness, leader européen des équipements de sport en extérieur depuis plus de 20 ans. 500+ communes équipées en Europe."
>
  <section class="py-16 bg-bg">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <p class="font-700 text-xs text-primary uppercase tracking-widest mb-3">Notre histoire</p>
      <h1 class="font-display font-800 text-4xl sm:text-5xl text-text mb-8 leading-tight">
        La puissance d'un leader européen au service de l'agility canine
      </h1>

      <div class="prose prose-lg prose-headings:font-display prose-headings:font-700 prose-a:text-primary max-w-none mb-16">
        <p>
          <strong>Woof!</strong> est la marque d'équipements d'agility canine de <strong>Herkules Fitness</strong>,
          le leader européen des équipements de sport et de loisirs en extérieur pour collectivités.
          Fondée il y a plus de 20 ans, Herkules Fitness a équipé plus de <strong>500 communes en Europe</strong>
          avec des équipements de qualité professionnelle.
        </p>
        <h2>Notre expertise industrielle</h2>
        <p>
          Notre savoir-faire dans la fabrication d'équipements extérieurs durables nous a naturellement conduits
          vers le marché de l'agility canine. Nous appliquons les mêmes exigences industrielles à nos équipements
          Woof! : acier galvanisé thermolaqué, certification EN 16630, tests de résistance aux intempéries et au vandalisme.
        </p>
        <h2>Notre engagement qualité</h2>
        <p>
          Tous nos équipements sont fabriqués en Europe et bénéficient d'une garantie de 5 ans.
          Notre SAV est basé en France, et les pièces détachées sont disponibles pendant 10 ans minimum.
          Nous accompagnons chaque collectivité de la conception à la maintenance.
        </p>
      </div>

      <div class="grid grid-cols-3 gap-6">
        {[
          { num: '500+', label: 'Communes équipées' },
          { num: '20+', label: "Ans d'expérience" },
          { num: '5 ans', label: 'Garantie sur gamme' },
        ].map((stat) => (
          <div class="bg-surface rounded-2xl p-6 text-center border border-primary-light">
            <div class="font-display font-800 text-4xl text-primary mb-2">{stat.num}</div>
            <div class="text-muted text-sm font-600">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
  <CTAFinal />
</Layout>
```

- [ ] **Step 3: Create contact.astro**

```astro
---
// src/pages/contact.astro
import Layout from '../layouts/Layout.astro';
---

<Layout
  title="Demandez un Devis Gratuit — Parcours Canin Agility | Woof"
  description="Contactez Woof! pour un devis gratuit personnalisé sous 48h. Parcours canin agility pour collectivités. Tél : +33 1 84 60 23 30"
>
  <section class="py-16 bg-bg">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

        <!-- Left: form -->
        <div>
          <p class="font-700 text-xs text-primary uppercase tracking-widest mb-3">Contact</p>
          <h1 class="font-display font-800 text-3xl sm:text-4xl text-text mb-4">Demandez un devis gratuit</h1>
          <p class="text-muted mb-8">Réponse garantie sous 48h. Devis personnalisé, sans engagement.</p>

          <form class="flex flex-col gap-5" name="contact" method="POST">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-700 text-text block mb-1.5" for="prenom">Prénom *</label>
                <input id="prenom" name="prenom" type="text" required placeholder="Jean"
                  class="w-full border border-primary-light rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all" />
              </div>
              <div>
                <label class="text-sm font-700 text-text block mb-1.5" for="nom">Nom *</label>
                <input id="nom" name="nom" type="text" required placeholder="Dupont"
                  class="w-full border border-primary-light rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all" />
              </div>
            </div>
            <div>
              <label class="text-sm font-700 text-text block mb-1.5" for="email">Email *</label>
              <input id="email" name="email" type="email" required placeholder="jean.dupont@mairie.fr"
                class="w-full border border-primary-light rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all" />
            </div>
            <div>
              <label class="text-sm font-700 text-text block mb-1.5" for="commune">Commune / Organisme *</label>
              <input id="commune" name="commune" type="text" required placeholder="Mairie de..."
                class="w-full border border-primary-light rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all" />
            </div>
            <div>
              <label class="text-sm font-700 text-text block mb-1.5" for="telephone">Téléphone</label>
              <input id="telephone" name="telephone" type="tel" placeholder="01 23 45 67 89"
                class="w-full border border-primary-light rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all" />
            </div>
            <div>
              <label class="text-sm font-700 text-text block mb-1.5" for="message">Votre projet *</label>
              <textarea id="message" name="message" required rows="4" placeholder="Décrivez votre projet : surface disponible, budget estimé, nombre d'obstacles souhaités..."
                class="w-full border border-primary-light rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"></textarea>
            </div>
            <button type="submit"
              class="w-full bg-primary hover:bg-primary-dark text-white font-700 py-3.5 rounded-xl transition-colors text-base">
              Envoyer ma demande de devis →
            </button>
            <p class="text-xs text-muted text-center">Réponse garantie sous 48h. Vos données ne sont jamais revendues.</p>
          </form>
        </div>

        <!-- Right: contact info -->
        <div class="lg:pt-16">
          <div class="bg-surface rounded-2xl p-8 border border-primary-light mb-6">
            <h2 class="font-display font-700 text-lg text-text mb-6">Nos coordonnées</h2>
            <div class="flex flex-col gap-4">
              <div class="flex items-start gap-3">
                <span class="text-xl mt-0.5">📍</span>
                <div>
                  <p class="font-700 text-sm text-text">Adresse</p>
                  <p class="text-muted text-sm">Ile du Platais<br/>78670 Villennes Sur Seine</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <span class="text-xl mt-0.5">📞</span>
                <div>
                  <p class="font-700 text-sm text-text">Téléphone</p>
                  <a href="tel:+33184602330" class="text-primary font-600 text-sm hover:text-primary-dark transition-colors">+33 1 84 60 23 30</a>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-primary-darker rounded-2xl p-6 text-white">
            <p class="font-700 text-sm mb-2">✓ Devis gratuit sous 48h</p>
            <p class="font-700 text-sm mb-2">✓ Accompagnement marchés publics</p>
            <p class="font-700 text-sm mb-2">✓ Plans d'implantation offerts</p>
            <p class="font-700 text-sm">✓ Installation par équipes certifiées</p>
          </div>
        </div>

      </div>
    </div>
  </section>
</Layout>
```

- [ ] **Step 4: Verify all three pages**

Run dev — open `/agility`, `/qui-sommes-nous`, `/contact`. Check for rendering errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/agility.astro src/pages/qui-sommes-nous.astro src/pages/contact.astro
git commit -m "feat: add Agility, Qui sommes-nous, Contact pages"
```

---

## Task 14: Legal Pages

**Files:**
- Create: `src/pages/mentions-legales.astro`
- Create: `src/pages/confidentialite.astro`
- Create: `src/pages/cgv.astro`

- [ ] **Step 1: Create mentions-legales.astro**

```astro
---
// src/pages/mentions-legales.astro
import Layout from '../layouts/Layout.astro';
---
<Layout title="Mentions Légales | Woof" description="Mentions légales de Woof! - Herkules Fitness" noindex>
  <section class="py-16 bg-bg">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 prose prose-headings:font-display prose-headings:font-700 prose-a:text-primary">
      <h1>Mentions Légales</h1>
      <h2>Éditeur du site</h2>
      <p>Woof! est une marque de <strong>Herkules Fitness</strong>.<br/>
      Siège social : Ile du Platais, 78670 Villennes Sur Seine, France<br/>
      Téléphone : +33 1 84 60 23 30</p>
      <h2>Hébergement</h2>
      <p>Ce site est hébergé par Vercel Inc., 340 Pine Street Suite 900, San Francisco, California 94104, USA.</p>
      <h2>Propriété intellectuelle</h2>
      <p>L'ensemble du contenu de ce site (textes, images, logos) est la propriété exclusive de Herkules Fitness et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.</p>
    </div>
  </section>
</Layout>
```

- [ ] **Step 2: Create confidentialite.astro**

```astro
---
// src/pages/confidentialite.astro
import Layout from '../layouts/Layout.astro';
---
<Layout title="Politique de Confidentialité | Woof" description="Politique de confidentialité et protection des données personnelles de Woof!" noindex>
  <section class="py-16 bg-bg">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 prose prose-headings:font-display prose-headings:font-700 prose-a:text-primary">
      <h1>Politique de Confidentialité</h1>
      <p>Conformément au Règlement Général sur la Protection des Données (RGPD), cette page vous informe de nos pratiques concernant la collecte et l'utilisation de vos données personnelles.</p>
      <h2>Données collectées</h2>
      <p>Nous collectons uniquement les données que vous nous fournissez volontairement via notre formulaire de contact : nom, prénom, email, téléphone, commune et message.</p>
      <h2>Utilisation des données</h2>
      <p>Ces données sont utilisées exclusivement pour répondre à vos demandes de devis et vous accompagner dans votre projet. Elles ne sont jamais vendues à des tiers.</p>
      <h2>Vos droits</h2>
      <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour exercer ces droits, contactez-nous à l'adresse indiquée dans les mentions légales.</p>
    </div>
  </section>
</Layout>
```

- [ ] **Step 3: Create cgv.astro**

```astro
---
// src/pages/cgv.astro
import Layout from '../layouts/Layout.astro';
---
<Layout title="Conditions Générales de Vente | Woof" description="Conditions générales de vente Woof! - Herkules Fitness" noindex>
  <section class="py-16 bg-bg">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 prose prose-headings:font-display prose-headings:font-700 prose-a:text-primary">
      <h1>Conditions Générales de Vente</h1>
      <h2>Article 1 — Objet</h2>
      <p>Les présentes CGV régissent les relations commerciales entre Herkules Fitness (Woof!) et ses clients professionnels (collectivités, mairies, campings, résidences).</p>
      <h2>Article 2 — Commandes</h2>
      <p>Toute commande fait l'objet d'un devis préalable accepté par le client. La commande est ferme à réception du bon de commande signé accompagné d'un acompte de 30%.</p>
      <h2>Article 3 — Garantie</h2>
      <p>Tous les équipements Woof! bénéficient d'une garantie de 5 ans couvrant les défauts de fabrication. La garantie ne couvre pas les dommages résultant d'un usage non conforme ou d'un défaut d'entretien.</p>
      <h2>Article 4 — Livraison et installation</h2>
      <p>Les délais de livraison sont indicatifs. L'installation est réalisée par nos équipes ou partenaires certifiés selon les modalités définies dans le devis.</p>
    </div>
  </section>
</Layout>
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/mentions-legales.astro src/pages/confidentialite.astro src/pages/cgv.astro
git commit -m "feat: add legal pages (mentions légales, confidentialité, CGV)"
```

---

## Task 15: Production Build + Verification

**Files:**
- No new files — verification only

- [ ] **Step 1: Run full TypeScript check**

```bash
npx astro check
```

Expected: 0 errors. Fix any type errors before continuing.

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected: build completes with no errors. Note the output in `dist/`.

- [ ] **Step 3: Preview production build**

```bash
npm run preview
```

Open `http://localhost:4321`. Navigate all pages:
- `/` — full homepage, all 9 sections
- `/produits` — product cards, filter buttons
- `/agility` — content + FAQ section
- `/qui-sommes-nous` — stats + prose
- `/blog` — 3 article cards
- `/blog/inclusion-mobilite-reduite` — article renders
- `/contact` — form + contact info
- `/mentions-legales`, `/confidentialite`, `/cgv` — legal content

- [ ] **Step 4: Verify sitemap and robots.txt**

```bash
cat dist/sitemap-index.xml
cat dist/robots.txt
```

Expected: sitemap exists with all public URLs. Legal pages not in sitemap (noindex).

- [ ] **Step 5: Check schema.org injection**

Open browser DevTools → View Page Source on homepage. Search for `application/ld+json`.
Expected: at least 2 script blocks (Organization + FAQPage).

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete Woof! site redesign — Astro + Tailwind + MDX, SEO optimized"
```

---

## Task 16: Deploy to Vercel

- [ ] **Step 1: Push to GitHub**

```bash
git remote add origin <YOUR_GITHUB_REPO_URL>
git branch -M main
git push -u origin main
```

- [ ] **Step 2: Connect to Vercel**

1. Go to vercel.com → New Project
2. Import the GitHub repo
3. Framework: Astro (auto-detected)
4. Click Deploy

- [ ] **Step 3: Verify deployment**

Once deployed, open the Vercel URL and check:
- All pages load (no 404s)
- Images display correctly
- Sitemap accessible at `/sitemap-index.xml`

- [ ] **Step 4: (Optional) Configure custom domain**

In Vercel dashboard → Domains → Add `woof-parcs.fr` and follow DNS configuration instructions.
