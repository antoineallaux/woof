# Configurateur d'aire canine — mémo de reprise

Dernière mise à jour : 3 septembre 2026. État : v1 complète sur la branche `feat/configurateur`, revue, poussée, preview Vercel validée, **pas encore mergée sur `main`** (le merge = mise en production).

Ce mémo est la référence pour reprendre le travail. Il complète la spec et le plan qui restent hors dépôt (`docs/` est gitignoré) :
- `docs/superpowers/specs/2026-09-02-configurateur-aire-chiens-design.md`
- `docs/superpowers/plans/2026-09-02-configurateur-aire-chiens.md`

## 1. Ce que fait le configurateur

Page `/configurateur/`, accessible depuis la navigation et une section sur l'accueil. Le visiteur :

1. dimensionne un terrain rectangulaire (5 à 60 m par côté) et choisit un sol (sable, terre, gazon) ;
2. pose des équipements depuis un catalogue (clic vignette, puis clic ou tap au sol), les déplace, les tourne, les duplique, les supprime ;
3. active une clôture grillagée (1,20 / 1,50 / 1,80 m) qui suit le périmètre, et ajoute autant de sas d'entrée que voulu, glissables le long des côtés ;
4. regarde en 3D, en plan, ou en satellite (carte aérienne avec recherche d'adresse) ;
5. partage un lien qui contient toute la configuration, imprime un dossier PDF, ou envoie la configuration au panier de devis du site.

Un récapitulatif permanent en bas du panneau donne surface, nombre d'équipements, **mètres linéaires de clôture** et nombre de sas.

## 2. Origine et décisions

Inspiré du configurateur Herkules (`~/Projects/configurator`, un fichier HTML de 9 780 lignes en JavaScript vanilla, sans build ni tests, mobile bloqué). Audit fait le 2 septembre 2026 ; on a réécrit plutôt que copié.

Décisions validées :
- Îlot React `client:only` dans Astro, react-three-fiber pour la 3D, zustand pour l'état, TypeScript, modules courts (< 250 lignes), Vitest sur la logique pure.
- Un seul rectangle de terrain (pas de multi-zones). Pas de prix, pas d'espace commercial, pas de multilingue, pas de norme ni de hauteur de chute.
- Clôture automatique sur le périmètre, sas multiples (demandé en cours de route), écart minimal 0,50 m entre deux sas.
- Tactile dès la v1.
- Fin de parcours = panier existant (`src/scripts/panier.js`, localStorage) et page `/devis/` pré-remplie. Aucun changement d'API : email, lead Zoho et alerte Telegram fonctionnent comme pour le reste du site.
- Style Woof clair (fond crème, vert primaire, Outfit / Nunito), pas de thème sombre.

## 3. Stack et dépendances ajoutées

| Paquet | Rôle |
|---|---|
| `three` 0.185, `@react-three/fiber` 9, `@react-three/drei` 10 | Scène 3D, caméras, contrôles, chargement GLB |
| `zustand` 5 | État unique, historique annuler/rétablir |
| `leaflet` 1.9 | Carte satellite (tuiles Esri World Imagery, géocodage Nominatim) |
| `vitest` 4, `jsdom` | Tests |
| `@gltf-transform/cli` 4 | Compression Draco des modèles (script, hors runtime) |

`tsconfig.json` : `jsx: react-jsx`, `resolveJsonModule`. `package.json` : `npm test`.

## 4. Où est quoi

```
src/configurateur/
  Configurateur.tsx      racine : layout desktop/mobile, lecture du #cfg, hash à jour, raccourcis clavier, boutons export
  store.ts               état + actions validées + undo/redo (20 niveaux)
  types.ts               Config, Sol, Hauteur, CONFIG_DEFAUT, bornes du terrain
  catalogue.ts           typage du JSON, getProduit, corpsDe
  url.ts                 encoder / decoder du lien de partage (#cfg=…)
  geometrie/
    collisions.ts        empreintes, marges, placementValide, snap
    sas.ts               position d'un sas sur un côté, projection, emprises, compatibilité
    cloture.ts           segments, poteaux, mètres linéaires
  scene/
    Scene.tsx            Canvas, lumières, caméras, OrbitControls, pont de capture, filet de fin de drag
    Terrain.tsx          sol, environnement, bordure, capteur de clic, fantôme, cotes
    Equipement.tsx       un équipement : GLB, sélection, drag, contour, poignée de rotation
    Modele.tsx           préparation d'un GLB (axe vertical, échelle, centrage)
    Cloture.tsx / Sas.tsx rendu (et drag pour le sas)
    textures.ts          textures procédurales (sols, grillage)
    pointSol.ts          intersection rayon / sol
  ui/
    PanneauLateral.tsx   nom du projet + onglets Terrain / Équipements / Clôture + Recap
    OngletTerrain, OngletCatalogue, OngletCloture, Recap, Proprietes, BarreOutils
    Satellite.tsx        carte Leaflet + adresse + orientation
    ModalePartage.tsx    <dialog> natif, copie du lien, navigator.share
    Toast.tsx            erreurs (3,5 s)
    Limite.tsx           ErrorBoundary (GLB en erreur, WebGL absent)
    Bouton.tsx           bouton React aux classes de Button.astro
  export/
    captures.ts          captures du canvas (plan cadré + 3D), restauration du point de vue
    dossier.ts           HTML imprimable du dossier, ouverture + print
    devis.ts             lignes de devis, résumé texte, passerelle vers panier.js
src/data/configurateur/catalogue.json   10 produits (placeholders Herkules)
src/pages/configurateur.astro           page (H1 + intro statiques, îlot client:only)
src/components/sections/ConfigurateurCTA.astro   section d'accueil
src/scripts/panier.d.ts                 types de panier.js
public/models/*.glb                     modèles compressés Draco (120 à 600 Ko)
public/draco/                           décodeur Draco servi localement (CSP)
public/assets/configurateur/            vignettes webp, cloture.svg, sas.svg, apercu.webp
scripts/compress-glb.sh                 téléchargement + compression des GLB
tests/configurateur/                    12 fichiers, 94 tests
```

Fichiers du site modifiés : `Navbar.astro` (lien), `index.astro` (section), `devis.astro` (pré-remplissage, liens seulement pour les slugs Woof), `vercel.json` (CSP), `public/llms.txt`, `src/pages/llms-full.txt.ts`.

## 5. Conventions à connaître avant de toucher au code

- Terrain centré sur l'origine. `x` = longueur `l` (est = +x), `z` = largeur `w` (sud = +z), `y` vers le haut.
- Côtés : nord `z = −w/2`, est `x = +l/2`, sud `z = +w/2`, ouest `x = −l/2`.
- Position d'un sas : distance en mètres depuis le début du côté, sens horaire vu de dessus (nord depuis l'angle nord-ouest, est depuis nord-est, sud depuis sud-est, ouest depuis sud-ouest). Bornée à 1,60 m des angles.
- Rotation d'un équipement en degrés 0 à 360, sens trigonométrique vu de dessus (convention three.js `rotation.y`).
- Un `Rect` = centre `(x, z)` + extensions `w` (sur x) et `d` (sur z), aligné sur les axes. L'empreinte d'un équipement pivoté est l'AABB conservatrice.
- Snap au dixième de mètre.

## 6. Modèle de données

```ts
interface Config {
  nom: string
  terrain: { l: number; w: number; sol: 'sable' | 'terre' | 'gazon' }
  cloture: { active: boolean; hauteur: 1.2 | 1.5 | 1.8; sas: { cote: Cote; pos: number }[] }
  equipements: { uid: string; id: string; x: number; z: number; rot: number }[]
}
```

Catalogue (`catalogue.json`) : `id`, `ref`, `name`, `category`, `w`, `d`, `h` (mètres), `clearance` (marge de dégagement, 1 m par défaut), `image`, `glb`, `slug` (slug du produit Woof, `null` pour les placeholders).

Lien de partage : `#cfg=` + base64url d'un JSON compact version 2 `{ v: 2, n, t: [l, w, sol], c: [0|1, hauteur, [[cote, pos], …]], e: [[id, x, z, rot], …] }`. Le décodeur accepte encore la version 1 (un seul sas). Tout est validé et borné au décodage : ids inconnus, équipements hors terrain ou en collision, sas invalides ou qui se chevauchent sont ignorés avec un toast « Équipements ignorés : … ».

## 7. Règles métier

- **Placement valide** : la marge de dégagement de l'équipement reste dans le terrain ; son corps n'entre pas dans la marge d'un autre ; sa marge n'entre pas dans le corps d'un autre ; son corps ne chevauche pas l'emprise d'un sas. Deux marges peuvent se recouvrir. Un déplacement de groupe est validé en bloc (positions futures), sinon refusé sans bouger.
- **Clôture** : poteaux aux angles et tous les 2,50 m au plus par segment, lisse haute, grillage. `metres = périmètre − nombre de sas × 1,20`.
- **Sas** : emprise 1,20 × 2,00 m à cheval sur la clôture, deux portillons. `ajouterSas` essaie le milieu du sud, puis est, nord, ouest, puis balaye le sud par pas de 1 m. Deux sas sur un même côté gardent 0,50 m entre leurs emprises. Réduire le terrain reborne les sas et retire ceux devenus incompatibles.
- **Terrain réduit** : les équipements qui ne tiennent plus sont retirés, avec un toast.
- **Historique** : chaque action utilisateur est une étape ; un drag (équipement, poignée de rotation, sas) n'en crée qu'une, grâce à `enregistrer()` au début du geste puis des mises à jour non enregistrées.

## 8. Interactions

- Souris : clic vignette puis clic au sol pour poser (fantôme vert / rouge) ; drag pour déplacer ; anneau vert pour la rotation fine (aimant à ±3° des multiples de 45°) ; Shift+clic pour la multi-sélection ; clic net au sol pour désélectionner (pas au début d'un orbit).
- Clavier : Ctrl+Z / Ctrl+Y (ou Ctrl+Shift+Z), Suppr / Retour arrière, Échap (annule l'outil et la sélection), R / Shift+R (±90°). Inactifs dans un champ texte ou sous une modale.
- Tactile : un doigt sur un équipement le déplace, un doigt ailleurs orbite, deux doigts zooment. Sous 1024 px, le panneau devient un tiroir bas ; le bouton d'ouverture se masque quand la fiche Propriétés est affichée.
- Vue satellite : la carte reçoit les gestes (le canvas est en `pointer-events: none`), l'échelle du terrain suit le zoom (pixels par mètre calculés depuis la latitude), un curseur oriente le terrain. La carte est montée une seule fois et garde son cadrage. L'édition est désactivée dans cette vue.

## 9. Exports

- **Partage** : le hash suit la configuration (`history.replaceState`, débounce 300 ms). Modale avec copie et `navigator.share`.
- **Dossier PDF** : `capturer()` bascule en plan (cadrage automatique sur le terrain), capture, bascule en 3D (cadrage), capture, puis restaure vue, caméra et sélection. `htmlDossier()` produit 4 pages A4 (couverture, plan coté avec cadre et cotes, perspective, composition avec quantités, clôture en ml, sas, lien du projet), ouvertes dans une fenêtre puis `window.print()`. Images en JPEG 0,85. Garde anti double-clic.
- **Devis** : `lignesDevis()` regroupe les équipements par produit, ajoute une ligne clôture (`cloture-1-8`, « Clôture grillagée 1,80 m — 67,6 ml ») et une ligne sas avec quantité. `envoyerAuDevis()` pousse dans le panier (`ajouter` puis `changerQty`, qui **remplace** la quantité), stocke un résumé texte dans `localStorage['woof-devis-config']` (nom, terrain, sol, clôture, lien) et redirige vers `/devis/`, qui le pré-remplit dans le message et efface la clé après envoi réussi.

## 10. Assets et CSP

- GLB : `scripts/compress-glb.sh` télécharge depuis le serveur Herkules (CORS ouvert) et compresse avec `gltf-transform optimize --compress draco --texture-size 1024`. Résultat : 3,7 à 11 Mo → 120 à 600 Ko. Lancer avec `/bin/bash` (compatible bash 3).
- Décodeur Draco copié depuis `node_modules/three/examples/jsm/libs/draco/gltf/` dans `public/draco/` : `useGLTF(url, '/draco/')`. Sans ce second argument, drei charge le décodeur depuis un CDN Google bloqué par la CSP.
- CSP (`vercel.json`) : `script-src` + `'wasm-unsafe-eval'` (Draco), `img-src` + `blob:` et `https://server.arcgisonline.com` (tuiles), `connect-src` + `blob:` (textures embarquées des GLB, chargées en `fetch` par GLTFLoader) et `https://nominatim.openstreetmap.org`, `worker-src 'self' blob:`. Vérifié sur la preview : aucune violation hors le script `vercel.live` propre aux previews.
- Poids : le JS du configurateur (≈ 330 Ko gzip + React 57 Ko) n'est chargé que sur `/configurateur/`. Les autres pages ne chargent rien de nouveau.

## 11. Ajouter les modèles Woof

1. Exporter le modèle en GLB (Y vers le haut de préférence, sinon `preparerModele` redresse l'axe dont la proportion correspond à `h`).
2. Compresser : `npx gltf-transform optimize entree.glb public/models/REF.glb --compress draco --texture-size 1024`.
3. Vignette webp dans `public/assets/configurateur/REF.webp`.
4. Entrée dans `catalogue.json` avec dimensions réelles, `clearance`, et surtout `slug` = slug du produit Woof (sinon pas de lien vers la fiche dans le panier).
5. Supprimer les entrées Herkules et leurs fichiers.
Aucun changement de code.

## 12. Tests et vérification

- `npm test` : 94 tests Vitest sur collisions, sas, clôture, URL, store, préparation des GLB, catalogue, dossier, devis, récap, ErrorBoundary.
- `npx tsc --noEmit -p tsconfig.json` : 0 erreur dans `src/configurateur/`. `npx astro check` remonte des erreurs préexistantes dans d'autres pages Astro, sans rapport.
- `npm run build` doit passer. `npm run preview` renvoie 404 avec l'adapter Vercel : servir `.vercel/output/static` en statique pour tester le build.
- Vérification navigateur systématique avec Playwright pendant l'implémentation (desktop 1400 × 900, mobile 390 × 844). L'orbite à deux doigts n'a jamais été testée sur un vrai appareil.

## 13. Historique du chantier (2 et 3 septembre 2026)

Branche `feat/configurateur`, 35 commits depuis `main` (`434649e`). Déroulé : audit Herkules + exploration Woof → spec → plan en 16 tâches → exécution par sous-agents avec revue de conformité et de qualité à chaque tâche → refactor sas multiples → revue finale → lot correctif (ErrorBoundary, revalidation des équipements, liens 404 du panier, H1 SEO, carte montée une fois, cibles tactiles 44 px, récap permanent) → preview Vercel vérifiée.

Choix techniques notables pris pendant l'exécution :
- Bordure du terrain en 4 lattes `boxGeometry` (les lignes WebGL font 1 px, invisibles), environnement teinté plus clair.
- Champ numérique du terrain non contrôlé, appliqué au blur (sinon saut à 5 m pendant la frappe).
- `onLostPointerCapture` n'est jamais émis par react-three-fiber sur les objets : filet global sur `window` (`blur`, `pointerup`, `pointercancel`) qui coupe `dragging`, et chaque composant oublie son état local quand `dragging` repasse à faux.
- Heuristique d'axe vertical des GLB par proportion (ratio taille / plus grande taille contre `h / max(w, d, h)`), avec un biais infime vers Y.

Lead Zoho de test « Test Configurateur Woof » et email de test créés lors de la vérification du devis : à supprimer.

## 14. Limites connues et suite

- Placeholders Herkules sans fiche Woof : noms non cliquables dans le panier tant que `slug` est vide.
- Bandeau d'intro SEO de 89 px sur mobile (2 phrases) : à raccourcir si gênant.
- Vue satellite : les tuiles Esri et Nominatim reçoivent l'IP du visiteur ; à mentionner dans la page confidentialité. Nominatim n'a pas de proxy côté serveur (limite d'usage par IP).
- Pas de `role="tabpanel"` ni de navigation par flèches dans les onglets.
- Leaflet est dans le bundle principal même si la vue satellite n'est jamais ouverte (≈ 40 Ko gzip) : un `React.lazy` le sortirait.
- `catalogue.json` n'est pas validé par un schéma : une entrée mal saisie produit des `NaN` silencieux.
- Multi-zones, prix, espace commercial et multilingue restent hors périmètre.

Côté Herkules (`~/Projects/configurator`), deux bugs de production relevés par l'audit et non traités : la CSP du `.htaccess` bloque le tracking vers le dashboard (`connect-src`), et le `.htaccess` n'est pas versionné, donc jamais déployé par la CI.

## 15. Pour reprendre

1. `git checkout feat/configurateur && npm install && npm test && npm run dev`, puis `http://localhost:4321/configurateur/`.
2. Lire `store.ts` (toutes les actions), puis `geometrie/` (règles), puis `scene/Equipement.tsx` (interactions).
3. Mémoire de session Claude : `~/.claude/projects/-Users-antoineallaux-Projects-woof/memory/woof-configurateur.md`.
4. Preview Vercel de la branche : `https://woof-git-feat-configurateur-antoineallauxs-projects.vercel.app` (protégée par le SSO Vercel).
5. Mise en production = merge sur `main`.
