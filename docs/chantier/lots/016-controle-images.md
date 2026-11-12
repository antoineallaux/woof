# Lot 016-controle-images              Estimation : 2 € · 1 session
Objectif      : aucun article du blog Woof ne part avec une image sans nos agrès : l'image de l'article du jour est contrôlée avant rédaction ; sans agrès Woof, la publication est bloquée et signalée dans #woof avec une image de remplacement proposée.
Contexte      : demande D-20261112-15 (~/Projects/atelier/a-lancer.md, Antoine #woof 12/11 11:45, Q-20261112-55 choix 2) : l'image de l'article du 12/11 « Bailleurs sociaux » ne montrait aucun agrès. Chemin réel : cron Vercel (vercel.json, 8h) -> src/pages/api/cron/publish-blog.ts -> src/lib/blog-cron.ts, planning src/content/planning-blog.json (lot 015). Aucun workflow GitHub dans le dépôt. Modèle de vision : Claude, même clé ANTHROPIC_API_KEY que la rédaction des articles.
Taille        : fonctionnalité complète (critère de fin = suite de tests du projet).
Hors périmètre: aucune publication ni dépublication réelle ; aucun message Discord réel (factice dans les tests) ; aucune génération d'image ; articles publiés inchangés ; .env* ; vercel ; .github/workflows/.
Contraintes   : pas de nouvelle dépendance (appel HTTP comme la rédaction) ; aucun appel payant dans les tests.
Fini quand    :
  npm test et npm run build verts, sorties collées suivies de « code N »
  essai image du 12/11 (refusée) et image avec agrès (acceptée) collés
  liste des images à venir sans agrès, ou commande exacte pour Alfred
  « Pour Alfred » avec ligne « Suite : »
  demande de fusion ouverte
  fiche « Lot en cours : 016-controle-images livré, PR #N, vérification à lancer par le chef »
  ~/Projects/atelier/livre.sh
Hypothèses    :
  une image où l'agrès n'apparaît que sur un écran, une affiche, un plan ou une fiche est refusée (44, 45, 50) : l'humain peut toujours changer l'image et relancer
  contrôle impossible (modèle en panne, verdict illisible, image absente) = publication bloquée aussi, même alerte
  le contrôle n'a lieu que le jour de la publication (pas d'alerte anticipée) : une entrée bloquée passe en « Erreur : image sans agrès Woof… » ; pour la publier, nouvelle image, nouvelle date, statut « À publier »
  proposition de remplacement = une des 5 images de la bibliothèque relues le 12/11 (43, 48, 49, 52, 53), choisie d'après le titre, jamais l'image refusée
  modèle claude-opus-5-5, effort low, réponse JSON imposée : environ 0,01 à 0,02 € par article contrôlé
Porte         : rien
Ticket        : aucun
Demande       : D-20261112-15
Branche       : lot/016-controle-images
Tentatives    : 1/3

## Fait

- src/lib/blog-cron.ts : controlerImage (image du planning, ou l'image par défaut, lue puis jugée par le modèle de vision ; sans agrès : alerte puis erreur), requeteControleImage, lireVerdictImage, propositionImage, messageImageRefusee (texte + image refusée + proposition en vignettes), bibliothèque IMAGES_AVEC_AGRES.
- src/pages/api/cron/publish-blog.ts : contrôle appelé avant la rédaction Claude (rien n'est rédigé ni payé pour une image refusée) ; image lue dans le dépôt par l'API GitHub sur la branche publiée ; alerte #woof par le webhook DISCORD_WOOF_WEBHOOK (pas d'alerte en recette dry=1, le verdict figure dans la réponse).
- tests/blog-cron.test.ts : 7 tests neufs (les deux essais sur les vraies images du dépôt, contrôle impossible, image par défaut, requête, bibliothèque, contrôle bien placé dans la route du cron).

## Images à venir sans agrès

Planning (src/content/planning-blog.json) : une seule entrée, le 12/11, déjà « Publié » ; **aucune image à venir** à contrôler aujourd'hui. Les images 44 à 54 sont toutes déjà publiées (lot 015 : 53 lignes reprises, toutes publiées).

Relecture à l'œil des 12 images du dossier public/assets/blog/43 à 54 (gratuite, pas de passe payante : pas de clé dans l'environnement du lot, .env jamais lu) :

- **sans agrès Woof** : 44-financer-un-caniparc (fiche technique imprimée), 45-faire-elire (présentation projetée), 46-cahier (bureau, ordinateur), 47-quelle-surface (terrain vide), 50-ParcCanin (bureau, photo sur l'écran), 51-idee (place de village), 54-bailleurs (résidence, pelouse vide) ;
- **avec agrès** (bibliothèque de remplacement) : 43-combien-coute-un-parc, 48-cloture, 49-Entretien, 52-drainage, 53-camping.

Confirmation par le vrai contrôle (12 images, environ 0,20 € en tout), commande pour Alfred, depuis ~/Projects/woof après fusion, clé ANTHROPIC_API_KEY dans l'environnement :

```
node --input-type=module -e '
import { readFileSync, readdirSync } from "node:fs";
import { requeteControleImage, lireVerdictImage } from "./src/lib/blog-cron.ts";
for (const d of readdirSync("public/assets/blog").filter((d) => /^\d+-/.test(d)).sort()) {
  const c = `/assets/blog/${d}/image.webp`;
  const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" }, body: JSON.stringify(requeteControleImage(readFileSync("public" + c), c)) });
  console.log(c, JSON.stringify(lireVerdictImage(await r.json())));
}'
```

## Pour Alfred

- Créer sur Vercel (projet woof, Production) la variable `DISCORD_WOOF_WEBHOOK` : adresse d'un webhook du salon #woof. Sans elle, une image refusée bloque bien la publication, mais l'alerte #woof ne part pas (journal Vercel seulement).
- Pilote SEO Woof (remplit le planning chaque mois) : choisir les images dans la bibliothèque IMAGES_AVEC_AGRES de src/lib/blog-cron.ts ou des photos avec nos agrès ; le contrôle du cron refusera les autres le jour J.
- Articles publiés avec une image sans agrès (44, 45, 46, 47, 50, 51, 54) : à remplacer si Antoine le veut (hors lot, aucun article touché). Confirmation possible par la commande ci-dessus.
- Aucun workflow GitHub à modifier (le cron est celui de Vercel).
- Suite : mise en service

## Preuve

`npm test` :

```
✔ /agility : title et description (0.867792ms)
ℹ tests 66
ℹ suites 0
ℹ pass 66
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 992.192334
code 0
```

`npm run build` :

```
11:51:38 [@astrojs/sitemap] `sitemap-index.xml` created at `dist/client`
11:51:38 [@astrojs/vercel] Copying static files to .vercel/output/static
11:51:38 [build] Server built in 8.66s
11:51:38 [build] Complete!
code 0
```

Les deux essais hors ligne (`node --test --test-name-pattern="essai" tests/blog-cron.test.ts`, vraies images du dépôt lues sur disque, modèle de vision et Discord factices) : image du 12/11 refusée, publication bloquée, message #woof factice ; image 52-drainage acceptée, publiée, aucune alerte :

```
publish-blog Bailleurs sociaux : un espace canin en pied d'immeuble, bonne idée ? Erreur : image sans agrès Woof, publication bloquée (/assets/blog/54-bailleurs/image.webp : un homme devant une résidence, pelouse vide)
Message #woof factice :
{
  "content": "⛔ Blog Woof : publication du 12/11/2026 bloquée, « Bailleurs sociaux : un espace canin en pied d'immeuble, bonne idée ? ».\nL'image prévue ne montre aucun agrès Woof (un homme devant une résidence, pelouse vide).\nProposition : /assets/blog/52-drainage/image.webp\nPour publier : dans src/content/planning-blog.json, mettre cette image (ou une autre avec nos agrès), une nouvelle date et le statut « À publier ».",
  "embeds": [
    {
      "title": "Image refusée",
      "description": "/assets/blog/54-bailleurs/image.webp",
      "image": {
        "url": "https://www.woof-parcs.fr/assets/blog/54-bailleurs/image.webp"
      }
    },
    {
      "title": "Proposition (agrès Woof)",
      "description": "/assets/blog/52-drainage/image.webp",
      "image": {
        "url": "https://www.woof-parcs.fr/assets/blog/52-drainage/image.webp"
      }
    }
  ]
}
✔ essai image du 12/11 (54-bailleurs, sans agrès) : publication bloquée, alerte #woof avec image refusée et proposition (2.384709ms)
✔ essai image avec agrès (52-drainage) : acceptée, l'article est rédigé et publié, aucune alerte (0.817125ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 93.529625
code 0
```

`astro check` : aucune erreur dans blog-cron.ts, publish-blog.ts ni blog-cron.test.ts.

Demande de fusion : https://github.com/antoineallaux/woof/pull/18 (commit 625a035).

- Lot en cours : 016-controle-images livré, PR #18, vérification à lancer par le chef
- Fait : contrôle de l'image dans le cron Vercel avant rédaction, blocage + alerte #woof avec proposition, 7 tests neufs, essais 54 refusée / 52 acceptée, liste des images sans agrès (44, 45, 46, 47, 50, 51, 54, toutes déjà publiées ; aucune à venir)
- Reste : vérification par le chef ; après fusion, DISCORD_WOOF_WEBHOOK sur Vercel (Pour Alfred)
- Dernière preuve : npm test 66 pass 0 fail, build Complete, essais 2 pass (sorties collées dans la Preuve)
