# Lot 020-audit-acheteurs              Estimation : 12 € · 1 session
Objectif      : le site Woof! applique les actions 3, 4, 6 et 7 de l'audit acheteurs du 23/11 (et prépare l'action 1, masquée), sans aucun prix nouveau.
Contexte      : demande D-20261123-23 (~/Projects/atelier/a-lancer.md, ligne « D-20261123-23 », à lire en entier : c'est la liste exacte) ; Antoine (Q-20261123-101 choix 1, #woof, puis message 1574446932699381801 : « Fais tout sauf les prix, on va le faire bientôt »). Audit : ~/Projects/.cerveau/travaux/woof-seo/audit-acheteurs-2026-11-23.md (lecture seule). Fiches Herkules des mêmes agrès comme niveau de référence (lecture seule, ~/Projects/herkules-site, src/content/produits/).
Taille        : chantier moyen à gros (plusieurs pages et données, un test).
À faire       :
  (4) /caniparc/ : section « Pour qui » (communes et intercommunalités, campings et hôtellerie de plein air, garderies et éducateurs canins, refuges, bailleurs sociaux et promoteurs, hôtels) ; packs nommés (petit, moyen, grand caniparc) décrits par surface et modules, sans prix ; FAQ achat public (mandat administratif, Chorus Pro, délais de fabrication 3 à 4 semaines en coloris standard et 12 à 15 en coloris spécial, pose séparée sur devis ; jamais l'UGAP) ; liens vers /devis/ et /prix-parc-canin/.
  (3) fiches produit Woof! enrichies au niveau de celles d'Herkules sur les mêmes agrès (Dog Park 1, 2, 3 d'abord, puis les agrès agility) : dimensions, emprise, matériaux, garantie 5 ans, délai, FAQ, liens vers les fiches techniques si elles existent dans le dépôt ; aucun prix.
  (6) article « ce que dit la loi » : mise à jour 2026 (date, contenu), Woof! dans le titre, renvois vers /prix-parc-canin/ et /devis/.
  (7) « fabricant français » devient « fabricant européen » partout (pages, données structurées, llms.txt, llms-full.txt, consigne du rédacteur du blog src/lib/blog-cron.ts) ; plus aucun nombre de communes ; « depuis 2007 » gardé ; test qui échoue si « fabricant français » reparaît.
  (1, préparation) bloc « Ils nous ont fait confiance » prêt dans le code mais masqué tant qu'aucune référence n'est validée.
  Pilote SEO du mardi : noter le changement de /caniparc/ dans ses décisions pour qu'il ne réécrive pas la page dans les 3 semaines (là où il lit ses décisions ; le dire dans la Preuve).
Hors périmètre: tout prix, « à partir de » ou fourchette ; herkules-fitness.com (rien ne change, Eskimoz tranche : garder les deux sites) ; aucune référence client affichée (Vidauban attend l'accord de la commune) ; aucune image générée ; aucun envoi.
Contraintes   : branche depuis origin/main (--no-track) ; aucun secret lu ni collé ; jamais l'UGAP ni un nombre de communes ; délais exactement « 3 à 4 semaines en coloris standard, 12 à 15 en coloris spécial », transport et pose en plus sur devis ; tests rouges avant, verts après (« fabricant français » absent, aucun prix nouveau sur les pages touchées) ; contrôle navigateur de la version construite en local, captures 1440 et 390 avant / après des pages touchées. Interdits de l'atelier : ~/Projects/atelier/gabarits/interdits-lot.md.
Fini quand    :
  pour chaque action : pages touchées et avant / après en une ligne dans la Preuve
  recherche « fabricant français », « UGAP », « communes », « € » sur le site construit collée avant / après
  tests rouges avant, verts après ; tests, lint et build verts : sorties collées suivies de « code N » ; gitleaks 0 fuite ; PR ouverte
  captures avant / après jointes au dossier du lot
  section « Pour Alfred » de cette fiche rédigée (texte seulement, aucun envoi) : pages à contrôler en ligne, note sur l'accord à obtenir plus tard de Vidauban pour le bloc masqué, ligne « Suite : »
  ~/Projects/atelier/livre.sh
Hypothèses    : une donnée d'agrès absente du dépôt Woof! et des fiches Herkules (dimension, emprise) n'est pas inventée : elle est omise et listée dans « Pour Alfred ».
Porte         : rien
Ticket        : aucun
Demande       : D-20261123-23
Branche       : lot/020-audit-acheteurs
Tentatives    : 0/3

## Pour Alfred

Fait (PR #24) : actions 3, 4, 6 et 7 de l'audit acheteurs, action 1 préparée et masquée ; aucun prix nouveau (« € » : 125 occurrences dans 9 fichiers avant comme après sur le site construit).
Contrôle en ligne à faire après mise en ligne : /caniparc/ (sections « Pour qui ? », « Trois packs pour démarrer », 5 nouvelles questions de FAQ), /produits/parcours-agility-intermediaire/ (tableau « Caractéristiques techniques », 3 questions de FAQ ajoutées), /blog/creation-dun-parc-chien-collectivite-ce-que-dit-la-loi/ (titre « … en 2026 | Woof! », « Mis à jour le 23 novembre 2026 », section « Acheter les équipements dans les règles »), /llms.txt (« fabricant européen »).
Vidauban : le bloc « Ils nous ont fait confiance » (`src/components/sections/References.astro`, affiché sur l'accueil et /caniparc/ dès qu'une ligne est ajoutée à la liste `references`) attend l'accord écrit de la commune de Vidauban (nom, photo du parc, une ligne de projet) ; mail de demande à préparer par Alfred, envoyé au clic d'Antoine. /prix-parc-canin/ n'a pas reçu le bloc : fichier classé « argent » par sensible.py, laissé intact ; à ajouter dans un lot à part au moment des prix.
Pilote SEO du mardi : ligne « action » datée 2026-11-23 ajoutée à `~/Projects/.cerveau/woof-seo/objectifs/OBJ-03.md` (objectif /caniparc/ sur « caniparc ») ; le pilote juge « stagne », donc ne demande une réécriture, qu'à 3 semaines de la dernière action : contrôlé avec sa propre fonction `decider` (24/11 et 08/12 « à surveiller », 15/12 « stagne »).
Données omises (non inventées), à compléter si une source existe :
- Dog Park 1, 2, 3 : aucune ligne « Matériaux » (absente des fiches PDF publiées ; Herkules écrit « poteaux en bois lamellé-collé, acier galvanisé, contreplaqué antidérapant, PEHD » alors que la fiche Woof dit « Acier galvanisé » : à trancher) ; idem Grande Passerelle, Tunnel Milou, Panneau d'info, Abris.
- Zone de sécurité autour des agrès : absente partout (Woof et Herkules).
- Profondeur d'ancrage et volume de béton : seulement sur les fiches qui les portent ; les valeurs Herkules (600 mm, béton) ne sont pas reprises, fiches-woof les juge non vérifiées (data/manques.json).
Source des caractéristiques : les fiches techniques PDF déjà publiées sur le site (dépôt fiches-woof, `data/fiches/*.json`), pas les fiches Herkules (cotes de fichiers DXF, parfois différentes : Petits Murs 7 635 × 962 mm sur la fiche Woof contre 962 × 135 chez Herkules).
À confirmer par Wiktoria (facturation) : la FAQ dit que les factures aux acheteurs publics sont déposées sur Chorus Pro (obligation légale depuis 2020).
Défaut trouvé, non corrigé (hors périmètre) : sur /produits/barres-hautes/, une « question » de FAQ contient une description au lieu d'une question.
Lint : le dépôt n'a pas de script lint ; `astro check` compte 95 erreurs, les mêmes que sur origin/main (contact.astro, devis.astro, tests/mesure.test.ts), aucune dans les fichiers du lot.

Suite : aucune (contrôle en ligne lancé par livrer.sh) ; Antoine : valider le mail de demande d'accord à la commune de Vidauban (préparé par Alfred) pour afficher sa référence sur le site Woof!

## Preuve

Lot en cours : vérification à lancer par le chef — 020-audit-acheteurs, PR #24 https://github.com/antoineallaux/woof/pull/24
Fait : /caniparc/ (Pour qui, packs, FAQ achat public, liens prix et devis), 45 fiches produit (caractéristiques, garantie, délai, pose sur devis, FAQ), article loi mis à jour 2026, « fabricant européen » partout avec test, bloc références masqué, décision du pilote SEO notée (OBJ-03).
Reste : contrôle en ligne après mise en ligne (livrer.sh) ; accord de Vidauban pour le bloc références.
Dernière preuve : tests 79/79, build vert, gitleaks 0 fuite, PR #24.

Par action (avant → après) :
- (4) `src/pages/caniparc.astro` : page pour collectivités seules, sans packs ni achat public → section « Pour qui ? » (6 publics), « Trois packs pour démarrer » (petit 300 à 500 m², moyen 800 à 1 500 m², grand plus de 1 500 m², modules liés, sans prix), 5 questions achat public (mandat administratif, Chorus Pro, délais exacts, pose séparée sur devis), liens /prix-parc-canin/ et /devis/ ; badge « Collectivités et sites privés ».
- (3) `src/pages/produits/[slug].astro` + 45 `src/content/products/*.json` (champ `specs`, déclaré dans `src/content.config.ts` et `keystatic.config.ts`) : fiches sans dimensions détaillées ni délai → tableau « Caractéristiques techniques » (emprise, hauteur, matériaux, massifs selon la fiche PDF, garantie 5 ans, délai, transport et pose en plus sur devis), lien vers la fiche PDF, 3 questions de FAQ (dimensions, délai, garantie) aussi dans le JSON-LD ; aucun prix.
- (6) `src/content/blog/creation-dun-parc-chien-collectivite-ce-que-dit-la-loi.mdx` + `src/pages/blog/[...slug].astro` : titre « Créer un parc canin en collectivité : ce que dit la loi », date 30/01/2026 → « Parc canin en collectivité : ce que dit la loi en 2026 | Woof! », mis à jour le 23/11/2026 (affiché et dans dateModified), section achat public avec renvois /prix-parc-canin/ et /devis/, bruit R. 1336-4 à R. 1336-11, chiens catégorisés L211-16, défaut d'entretien normal, L421-3 Code de la consommation.
- (7) `src/layouts/Layout.astro`, `public/llms.txt`, `src/pages/llms-full.txt.ts`, `src/lib/blog-cron.ts` : « Fabricant français » → « Fabricant européen » ; consigne du rédacteur « fabricant européen, jamais fabricant français » et validateur qui refuse l'article ; test de build `tests/chiffres.test.ts` (« fabricant français », « fabrication française », « made in France »). Aucun nombre de communes avant ni après ; « depuis 2007 » gardé (test existant vert).
- (1, préparation) `src/components/sections/References.astro`, inclus sur l'accueil et /caniparc/ : rien → bloc « Ils nous ont fait confiance » prêt, liste vide, rien d'affiché (test).
- Pilote SEO : `~/Projects/.cerveau/woof-seo/objectifs/OBJ-03.md`, ligne « - 2026-11-23 · action · lot 020-audit-acheteurs … pas de réécriture de la page par le pilote avant le 2026-12-14 ».

Recherche sur le site construit (`dist/client`, fichiers .html et .txt), avant (origin/main) :
```
« fabricant français » : 106 occurrences dans 106 fichiers
« UGAP » : 0 occurrences dans 0 fichiers
« communes » : 79 occurrences dans 26 fichiers
« € » : 125 occurrences dans 9 fichiers
```
après (branche) :
```
« fabricant français » : 0 occurrences dans 0 fichiers
« UGAP » : 0 occurrences dans 0 fichiers
« communes » : 81 occurrences dans 26 fichiers
« € » : 125 occurrences dans 9 fichiers
```
« communes » +2 : « Les communes, mais aussi… » (Pour qui) et la FAQ achat public ; aucun nombre devant « communes » (recherche `[0-9] ?+? ?communes` : 0 avant, 0 après).

Tests rouges avant (`npm test`, tests écrits, site encore identique à origin/main, build fait) :
```
✖ /caniparc/ : section « Pour qui » avec les six publics (0.379375ms)
✖ /caniparc/ : packs petit, moyen et grand caniparc, par surface et modules (0.242875ms)
✖ /caniparc/ : FAQ achat public (mandat administratif, Chorus Pro, délais, pose sur devis), jamais l'UGAP (0.095125ms)
✖ /caniparc/ : liens vers /devis/ et /prix-parc-canin/ dans le corps de la page (0.096542ms)
✖ bloc « Ils nous ont fait confiance » prêt mais masqué tant qu'aucune référence n'est validée (0.063ms)
✖ aucun ancien chiffre : fabricant français (75.32275ms)
✖ fiches produit : caractéristiques techniques, garantie, délai, pose sur devis et FAQ, sans prix (0.749166ms)
✖ fiches Dog Park 1, 2, 3 : dimensions de la fiche technique (0.6725ms)
✖ article « ce que dit la loi » : mise à jour 2026, Woof! dans le titre, renvois vers le prix et le devis (0.181958ms)
  +   'index.html : « Fabricant français »',
  +   'llms-full.txt : « fabricant français »',
  +   'llms.txt : « fabricant français »',
ℹ tests 78
ℹ pass 69
ℹ fail 9
```
code 1

Test du rédacteur, rouge avec `src/lib/blog-cron.ts` de origin/main (`node --test tests/blog-cron.test.ts`, fichier remis ensuite) :
```
✖ validateur : « fabricant français » refusé, consigne « fabricant européen » (0.593334ms)
ℹ pass 23
ℹ fail 1
```
code 1

Tests verts après (`npm test`) :
```
✔ validateur : « fabricant français » refusé, consigne « fabricant européen » (0.142917ms)
✔ /caniparc/ : section « Pour qui » avec les six publics (0.118083ms)
✔ /caniparc/ : packs petit, moyen et grand caniparc, par surface et modules (0.443042ms)
✔ /caniparc/ : FAQ achat public (mandat administratif, Chorus Pro, délais, pose sur devis), jamais l'UGAP (0.134167ms)
✔ /caniparc/ : liens vers /devis/ et /prix-parc-canin/ dans le corps de la page (1.630792ms)
✔ bloc « Ils nous ont fait confiance » prêt mais masqué tant qu'aucune référence n'est validée (0.370708ms)
✔ aucun ancien chiffre : fabricant français (91.76775ms)
✔ fiches produit : caractéristiques techniques, garantie, délai, pose sur devis et FAQ, sans prix (38.294458ms)
✔ fiches Dog Park 1, 2, 3 : dimensions de la fiche technique (2.510459ms)
✔ aucun prix nouveau : /caniparc/ garde ses seuls repères, article loi sans montant (2.338ms)
✔ article « ce que dit la loi » : mise à jour 2026, Woof! dans le titre, renvois vers le prix et le devis (0.166208ms)
ℹ tests 79
ℹ pass 79
ℹ fail 0
```
code 0

`npm run build` :
```
16:43:47 [build] Server built in 6.96s
16:43:47 [build] Complete!
```
code 0

Lint : pas de script lint dans package.json ; `npx astro check` rouge, pour des erreurs déjà présentes sur origin/main dans des fichiers que le lot ne touche pas.
origin/main (copie détachée temporaire, retirée ensuite) :
```
  20 src/pages/contact.astro
  26 src/pages/devis.astro
  49 tests/mesure.test.ts
- 95 errors
- 0 warnings
- 34 hints
```
code 1
branche :
```
  20 src/pages/contact.astro
  26 src/pages/devis.astro
  49 tests/mesure.test.ts
- 95 errors
- 0 warnings
- 38 hints
```
code 1
écart entre les deux (`diff` des diagnostics, numéros de ligne retirés) :
```
29a30,33
> src/content.config.ts - warning ts(6385): 'z' is deprecated.
> src/content.config.ts - warning ts(6385): 'z' is deprecated.
> src/content.config.ts - warning ts(6385): 'z' is deprecated.
> src/content.config.ts - warning ts(6385): 'z' is deprecated.
```
code 1

`gitleaks git --log-opts="origin/main..HEAD" .` :
```
INF scanned ~54403 bytes (54.40 KB) in 52.1ms
INF no leaks found
```
code 0

Contrôle navigateur de la version construite en local (python http.server sur dist/client, Playwright) : largeur de page à 390 px = 390 sur /caniparc/, /produits/parcours-agility-essentiel/, /produits/slalom/, l'article loi et l'accueil (pas de défilement horizontal).
Fiche : critère « Pour Alfred » du « Fini quand » reformulé sans changer son sens (le pré-contrôle Jev y lisait une action réelle : c'est un texte à écrire).
Captures avant / après, 1440 et 390 : `docs/chantier/lots/020-captures/` (caniparc, dogpark1, dogpark2, dogpark3, slalom, loi ; suffixes -avant et -apres, 24 fichiers).
