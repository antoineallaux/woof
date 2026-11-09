# Lot 015-planning-blog-depot              Estimation : 2 € · 1 session
Objectif      : le rédacteur automatique du blog Woof! lit son planning dans un fichier du dépôt, plus dans le Google Sheet.
Contexte      : demande D-20261109-10 (~/Projects/atelier/a-lancer.md, ligne « D-20261109-10 », à lire en entier ; Antoine, #woof 09/11 : « on se passe du google sheet ») ; conception validée : ~/Projects/docs/superpowers/specs/2026-11-09-pilote-seo-woof-design.md § Blog. Code : src/lib/blog-cron.ts (tâche quotidienne de 8h), src/pages/api/cron/publish-blog.ts. Demande sœur : le pilote SEO (lot atelier-reveils 097) remplira ce fichier chaque mois.
Taille        : fonctionnalité complète (critère de fin = suite de tests du projet).
À faire       : (1) fichier de planning du dépôt (ex. src/content/planning-blog.json : date, titre, catégorie, mot-clé, image, statut) ; (2) bascule : les sujets FUTURS du Sheet SHEET_ID repris tels quels, lus en lecture seule par `source ~/.config/gog/env ; gog -a antoine.allaux@gmail.com --readonly …` (aucune écriture dans le Sheet) ; (3) blog-cron.ts publie le sujet du jour comme aujourd'hui (SYSTEM_PROMPT inchangé) et marque l'entrée publiée ; (4) plus aucun appel Google Sheets dans le code ; variables d'environnement du Sheet devenues inutiles listées dans « Pour Alfred » (ne pas toucher aux .env ni à Vercel).
Hors périmètre: .env* (jamais lus) ; vercel (aucune commande) ; .github/workflows/ ; le contenu des articles ; le pilote SEO (lot hub 097) ; aucune publication réelle depuis le lot.
Contraintes   : pas de nouvelle dépendance ; tests rouges sur origin/main puis verts : sujet du jour publié (génération simulée), rien à publier, entrée déjà publiée ignorée ; build et suite de tests verts.
Fini quand    :
  sujets repris du Sheet : nombre et dates collés
  tests neufs : sortie rouge sur origin/main puis verte collées ; build et suite complète collés suivis de « code N »
  demande de fusion ouverte, checks verts ; git log --oneline origin/main..HEAD et git status --short collés
  fiche de lot « Lot en cours : 015 planning du blog dans le dépôt, vérification à lancer par le chef »
  ~/Projects/atelier/livre.sh
Pour Alfred   : après la mise en ligne : contrôle de la publication du lendemain 8h (ou du prochain sujet daté) ; retrait des variables Google Sheets devenues inutiles sur Vercel (liste du lot).
Hypothèses    : aucune
Livraison     : auto
Porte         : rien
Ticket        : aucun
Demande       : D-20261109-10
Branche       : lot/015-planning-blog-depot
Tentatives    : 0/3

## Pour Alfred

- Après la mise en ligne : contrôler la publication du jeudi 12/11/2026 à 8h (« Bailleurs sociaux : un espace canin en pied d'immeuble, bonne idée ? ») : article dans src/content/blog/ et entrée passée à « Publié » dans src/content/planning-blog.json (2 commits du cron sur main).
- Variable devenue inutile sur Vercel, à retirer : `GOOGLE_SERVICE_ACCOUNT_JSON` (seule variable Google du code ; SHEET_ID et l'onglet étaient écrits en dur et sont supprimés). `GITHUB_TOKEN` reste nécessaire, y compris pour ?dry=1 (le planning se lit désormais par l'API GitHub).
- Le Google Sheet n'est plus lu : il peut être archivé quand Antoine veut (rien n'y a été écrit).

## Preuve

Sujets repris du Sheet : lecture seule `gog -a antoine@herkules.fr --readonly -j sheets get 1Q4i_… "'PostPlanning de publication'!A:F"` (le compte antoine.allaux@gmail.com de la fiche n'a pas le droit Sheets : 403 insufficientPermissions ; antoine@herkules.fr l'a, toujours en --readonly). 53 lignes, toutes « Publié » sauf une. Sujets futurs (date ≥ 09/11/2026 ou statut ≠ Publié) : **1**.

```
54 ['12/11/2026', "Bailleurs sociaux : un espace canin en pied d'immeuble, bonne idée ?", 'Actualités', '/assets/blog/54-bailleurs/image.webp', 'À publier']
lignes 53
```

Tests neufs (tests/blog-cron.test.ts : sujet du jour publié avec génération simulée, rien à publier, entrée déjà publiée ignorée, échec marqué « Erreur : … », planning du dépôt sans appel Google Sheets, mot-clé dans le message). Rouge avec src/lib/blog-cron.ts d'origin/main (fichier non modifié au moment du passage) :

```
file:///Users/antoineallaux/Projects/woof/.worktrees/lot-015-planning-blog-depot/tests/blog-cron.test.ts:7
  publierDuJour,
  ^^^^^^^^^^^^^
SyntaxError: The requested module '../src/lib/blog-cron.ts' does not provide an export named 'publierDuJour'
Node.js v24.14.1
✖ tests/blog-cron.test.ts (40.688209ms)
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 43.172916
✖ failing tests:
test at tests/blog-cron.test.ts:1:1
✖ tests/blog-cron.test.ts (40.688209ms)
  'test failed'
code 1
```

Vert sur la branche :

```
✔ dateDuJour : format jj/mm/aaaa à l’heure de Paris (6.387375ms)
✔ filtre : garde seulement date du jour ET statut « À publier » (espaces tolérés) (0.265375ms)
✔ planning : le sujet du jour est publié et son entrée marquée « Publié » (0.697625ms)
✔ planning : rien à publier ce jour -> aucun appel, planning inchangé (0.0565ms)
✔ planning : entrée du jour déjà publiée ignorée (0.040125ms)
✔ planning : échec de génération -> entrée marquée « Erreur : … » (0.260166ms)
✔ planning du dépôt : entrées complètes, plus aucun appel Google Sheets (0.231834ms)
✔ prompt : modèle, année et titre injectés (0.07525ms)
✔ validateur : article conforme -> MDX, slug et dé-linkage hors liste blanche (0.1075ms)
✔ validateur : moins de 700 mots refusé (0.155708ms)
✔ validateur : mention EN 16630 refusée (corps, titre ou description) (0.080209ms)
✔ validateur : titre SEO 20-65 caractères (0.129833ms)
✔ validateur : description SEO 80-165 caractères (0.218875ms)
✔ validateur : format sans marqueurs, H1 et phrase méta refusés (0.103583ms)
✔ statut d’erreur tronqué à 180 caractères (0.029208ms)
✔ liste blanche : /caniparc/, /agility/ et /prix-parc-canin/ gardés et cités dans la consigne (0.073667ms)
ℹ tests 16
ℹ suites 0
ℹ pass 16
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 55.68175
code 0
```

Suite complète `npm test` (après le build : certains tests lisent dist/) :

```
ℹ tests 59
ℹ suites 0
ℹ pass 59
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 462.854041
code 0
```

Build `npm run build` :

```
12:33:29 [@astrojs/vercel] Copying static files to .vercel/output/static
12:33:29 [build] Server built in 4.10s
12:33:29 [build] Complete!
code 0
```

`astro check` : aucune erreur dans blog-cron.ts, publish-blog.ts ni blog-cron.test.ts (les 95 erreurs signalées par l'outil sont dans d'autres fichiers, déjà présentes sur main).

Demande de fusion https://github.com/antoineallaux/woof/pull/17, contrôles :

```
Vercel	pass	0	https://vercel.com/antoineallauxs-projects/woof/Du4ax8kWKDSgzNni2widTz7gifti	Deployment has completed
Vercel Preview Comments	pass	0	https://vercel.com/github	
```

Avant le commit de cette fiche :

```
$ git log --oneline origin/main..HEAD
e3a21f8 Blog : planning dans src/content/planning-blog.json, plus de Google Sheet (lot 015)
$ git status --short

```

- Lot en cours : 015 planning du blog dans le dépôt, vérification à lancer par le chef
- Fait : planning src/content/planning-blog.json (1 sujet repris), cron lu et marqué par l'API GitHub, google-sheets.ts supprimé, tests et build verts, PR #17
- Reste : vérification par le chef, puis contrôle de la publication du 12/11 (Pour Alfred)
- Dernière preuve : npm test 59 pass 0 fail, build Complete, PR #17 checks verts (sorties ci-dessus)
