# Lot 018-installation-sur-devis              Estimation : 3 € · 1 session
Objectif      : sur woof-parcs.fr, plus aucune promesse d'installation dans le prix : « installation incluse », « installation comprise », « pose comprise » et toute formule équivalente deviennent « installation possible sur devis » ; « garantie 5 ans » reste.
Contexte      : demande D-20261117-4 (~/Projects/atelier/a-lancer.md, ligne « D-20261117-4 », à lire en entier) ; décision d'Antoine Q-20261117-29 choix 2 (#woof, 17/11). Lot 017-depuis-2007 fusionné (PR #21) : même rédacteur `src/lib/blog-cron.ts` (`SYSTEM_PROMPT`) et même contrôle des articles (test « chiffres », `chiffres.test.ts`) à étendre.
Taille        : correctif ciblé (critère de fin = tests du projet + build).
À faire       : tout le site : pages, composants, FAQ, données structurées (JSON-LD), llms.txt et llms-full.txt, descriptions (meta), page /prix-parc-canin/ et article budget (fourchettes de prix inchangées, seule la mention de la pose change), articles du blog déjà publiés, consigne du rédacteur (« Garantie 5 ans, installation possible sur devis » ; « depuis 2007 » déjà là, jamais « plus de 15 ans »). Adapter la phrase autour quand la grammaire l'exige, sans rien ajouter d'autre.
Hors périmètre: montants et fourchettes de prix ; garantie ; autres formulations ; planning de décembre (PR #20) ; pilote SEO ; .env* ; tout envoi externe.
Contraintes   : pas de nouvelle dépendance ; test qui échoue si « installation incluse », « installation comprise » ou « pose comprise » (casse et apostrophes typographiques comprises) reparaît dans le build (rouge avant, vert après) ; aucun montant modifié (le dire dans la preuve avec le diff des nombres : 0 nombre changé) ; si `sensible.py` classe le lot en argent à cause des prix, le dire dans « Pour Alfred » : seule la mention de la pose change, aucun montant. La fiche est ajoutée de force à la branche (`git add -f`, docs/ est ignoré dans ce dépôt). Interdits de l'atelier : `~/Projects/atelier/gabarits/interdits-lot.md`.
Fini quand    :
  liste de chaque phrase changée, avant / après (fichier et ligne), dans la preuve
  `grep -rniE "installation (incluse|comprise)|pose comprise"` sur les sources et sur le build : 0 résultat (sortie collée)
  test rouge avant, vert après ; tests du projet et `npm run build` verts : sorties collées suivies de « code N »
  gitleaks sur origin/main..HEAD : 0 fuite
  PR ouverte ; « Pour Alfred » écrit avec sa ligne « Suite : »
  ~/Projects/atelier/livre.sh
Hypothèses    : 1) Les articles publiés sont dans le dépôt (comme au lot 017). 2) « installation offerte » ou « posé par nos soins » compte comme promesse : à changer aussi, listé dans la preuve.
Porte         : rien
Ticket        : aucun
Demande       : D-20261117-4
Branche       : lot/018-installation-sur-devis
Tentatives    : 0/3

## Pour Alfred

Fait : « installation possible sur devis » partout sur woof-parcs.fr à la place de « installation incluse / comprise », « pose comprise » et équivalents (« incluant l'installation », « la pose est incluse », « fourniture et pose comprises », « qui inclut l'installation dans son offre », « ces montants incluent… leur pose ») : 21 fiches produits, pages caniparc et prix-parc-canin (FAQ et JSON-LD compris), FAQ de l'accueil, llms.txt et llms-full.txt, descriptions, 13 articles du blog publiés, consigne du rédacteur. « Garantie 5 ans » gardée. Aucun montant modifié : 0 nombre changé dans src/ et public/.
sensible.py classe le lot en **argent** (`src/pages/prix-parc-canin.astro`) : seule la mention de la pose change sur cette page, aucun montant ni fourchette.
Gardé tel quel (pas une promesse de prix, hors « autres formulations ») : « Pose professionnelle par nos équipes certifiées » (accueil, accompagnement), « L'installation est réalisée par nos équipes… » (FAQ, CGV), « devis complet : fourniture, livraison, installation » (contact), « parcours clés en main », « installés par des professionnels » (article financer), « installation clé en main, garantie 5 ans incluse » (article cahier des charges), prix de clôture « par mètre linéaire posé » (montant de marché, inchangé).
Descriptions plus longues : prix-parc-canin (≈ 180 caractères), caniparc (≈ 175), campings (168) ; Google peut couper la fin.
Contrôle en ligne à faire : /prix-parc-canin/ (ligne « Pose : Sur devis » et FAQ), /caniparc/ (paragraphe équipements), /produits/slalom/ (puce « Installation possible sur devis »).

Suite : Alfred : contrôle en ligne des 3 pages ci-dessus après mise en ligne.

## Preuve

Lot en cours : vérification à lancer par le chef — 018-installation-sur-devis, PR #22 https://github.com/antoineallaux/woof/pull/22

Phrases changées (avant → après, fichier:ligne) :
- `src/content/blog/financer-un-caniparc-subventions-et-aides-pour-les-collectivites.mdx:74` : « et installation incluse par des équipes qualifiées » → « et installation possible sur devis par des équipes qualifiées »
- `src/content/blog/campings-et-hotellerie-de-plein-air-le-parc-canin-qui-fidelise.mdx:3` : « Garantie 5 ans, installation incluse. Devis gratuit. » → « Garantie 5 ans, installation possible sur devis. Devis gratuit. »
- `src/content/blog/campings-et-hotellerie-de-plein-air-le-parc-canin-qui-fidelise.mdx:20` : « - Garantie 5 ans et installation incluse permettent » → « - Garantie 5 ans et installation possible sur devis permettent »
- `src/content/blog/campings-et-hotellerie-de-plein-air-le-parc-canin-qui-fidelise.mdx:74` : « et d'une **installation incluse**, afin que » → « et d'une **installation possible sur devis**, afin que »
- `src/content/blog/entretien-dun-parc-canin-la-checklist-annuelle-des-services-techniques.mdx:79` : « la garantie proposée s'étend sur 5 ans, incluant l'installation. » → « la garantie proposée s'étend sur 5 ans ; l'installation est possible sur devis. »
- `src/content/blog/budget-participatif-faire-elire-un-projet-de-caniparc-dans-sa-ville.mdx:85` : « avec une garantie de 5 ans et une installation incluse dans chaque projet. » → « avec une garantie de 5 ans et une installation possible sur devis. »
- `src/content/blog/bailleurs-sociaux-un-espace-canin-en-pied-dimmeuble-bonne-idee.mdx:104` : « Chaque projet bénéficie d'une garantie de 5 ans et d'une installation incluse, » → « Chaque projet bénéficie d'une garantie de 5 ans et d'une installation possible sur devis, »
- `src/content/blog/un-caniparc-ouvert-toute-lannee-drainage-eclairage-et-revetements.mdx:100` : « avec installation incluse et garantie 5 ans » → « avec installation possible sur devis et garantie 5 ans »
- `src/content/blog/parc-canin-et-assurance-ce-que-la-commune-doit-prevoir.mdx:60` : « et bénéficie d'une garantie de 5 ans incluant l'installation. » → « et bénéficie d'une garantie de 5 ans ; l'installation est possible sur devis. »
- `src/content/blog/de-lidee-a-linauguration-les-7-etapes-dun-projet-de-caniparc.mdx:116` : « avec une garantie de 5 ans et une pose incluse. » → « avec une garantie de 5 ans et une installation possible sur devis. »
- `src/content/blog/combien-coute-un-parc-canin-pour-une-commune-budget-detaille.mdx:23` : « * Choisir un fabricant proposant garantie et installation incluse réduit » → « * Choisir un fabricant proposant garantie et installation possible sur devis réduit »
- `src/content/blog/combien-coute-un-parc-canin-pour-une-commune-budget-detaille.mdx:51` : « Faire appel à un fabricant qui inclut l'installation dans son offre, comme c'est le cas chez Woof!, évite » → « Faire appel à un fabricant chez qui l'installation est possible sur devis, comme c'est le cas chez Woof!, évite »
- `src/content/blog/combien-coute-un-parc-canin-pour-une-commune-budget-detaille.mdx:72` : « Ces montants incluent la fourniture des équipements et leur pose, mais peuvent varier » → « Installation possible sur devis ; ces montants peuvent varier »
- `src/content/blog/combien-coute-un-parc-canin-pour-une-commune-budget-detaille.mdx:115` : « avec des équipements certifiés et une installation incluse. » → « avec des équipements certifiés et une installation possible sur devis. »
- `src/content/blog/quelle-surface-et-quel-emplacement-pour-un-caniparc-reussi.mdx:22` : « de l'étude du terrain jusqu'à l'installation incluse. » → « de l'étude du terrain jusqu'à l'installation, possible sur devis. »
- `src/content/blog/quelle-surface-et-quel-emplacement-pour-un-caniparc-reussi.mdx:95` : « et installation incluse avec une garantie de 5 ans » → « et installation possible sur devis, avec une garantie de 5 ans »
- `src/content/blog/cloture-de-parc-canin-hauteur-sas-dentree-et-reglementation.mdx:81` : « sur l'ensemble des équipements Woof! et une pose incluse dans chaque projet. » → « sur l'ensemble des équipements Woof! et une installation possible sur devis. »
- `src/content/blog/cloture-de-parc-canin-hauteur-sas-dentree-et-reglementation.mdx:96` : « avec une garantie de 5 ans et une installation incluse. » → « avec une garantie de 5 ans et une installation possible sur devis. »
- `src/content/blog/rediger-le-cahier-des-charges-dun-parc-canin-le-guide-des-communes.mdx:118` : « propose systématiquement l'installation incluse et un accompagnement technique » → « propose une installation possible sur devis et un accompagnement technique »
- `src/content/blog/creer-un-parcours-agility-chien-dans-sa-commune.mdx:78` : « chez Woof!, la pose est incluse. » → « chez Woof!, l'installation est possible sur devis. »
- `src/content/blog/creer-un-parcours-agility-chien-dans-sa-commune.mdx:138` : « installation incluse partout en France » → « installation possible sur devis partout en France »
- `src/pages/caniparc.astro:63` : « a: 'À titre de repère, fourniture et pose comprises : 8 000 » → « a: 'À titre de repère : 8 000 »
- `src/pages/caniparc.astro:63` : « avec zones séparées. Le montant dépend du terrain » → « avec zones séparées. Installation possible sur devis. Le montant dépend du terrain »
- `src/pages/caniparc.astro:79` : « et l\'installation est incluse.' » → « et l\'installation est possible sur devis.' »
- `src/pages/caniparc.astro:86` : « de 8 000 à 45 000 € pose comprise, 6 à 12 mois » → « de 8 000 à 45 000 €, installation possible sur devis, 6 à 12 mois »
- `src/pages/caniparc.astro:185` : « garanti 5 ans, installation incluse. » → « garanti 5 ans, installation possible sur devis. »
- `src/pages/caniparc.astro:238` : « Trois scénarios types, fourniture et pose comprises. » → « Trois scénarios types, installation possible sur devis. »
- `src/pages/prix-parc-canin.astro:27` : « { poste: 'Pose', prix: 'Incluse chez Woof!', note: 'Les trois parcs types comprennent fourniture et pose' } » → « { poste: 'Pose', prix: 'Sur devis', note: 'Installation possible sur devis' } »
- `src/pages/prix-parc-canin.astro:33` : « entre 8 000 € et 45 000 €, fourniture et pose comprises : 8 000 » → « entre 8 000 € et 45 000 € : 8 000 »
- `src/pages/prix-parc-canin.astro:33` : « pour une aire urbaine avec zones séparées.', » → « pour une aire urbaine avec zones séparées. Installation possible sur devis.', »
- `src/pages/prix-parc-canin.astro:49` : « a: 'Oui, chez Woof! l\'installation est incluse. Les fourchettes des trois parcs types comprennent la fourniture des équipements et leur pose ; elles varient selon » → « a: 'Chez Woof!, l\'installation est possible sur devis ; son montant varie selon »
- `src/pages/prix-parc-canin.astro:60` : « 8 000 à 45 000 € pose comprise selon la taille. » → « 8 000 à 45 000 € selon la taille, installation possible sur devis. »
- `src/pages/prix-parc-canin.astro:71` : « 45 000 €</strong>, fourniture et pose comprises, selon la surface, le niveau d'équipement et la clôture. » → « 45 000 €</strong> selon la surface, le niveau d'équipement et la clôture, installation possible sur devis. »
- `src/pages/prix-parc-canin.astro:100` : « Fourniture et pose comprises ; le montant varie » → « Installation possible sur devis ; le montant varie »
- `src/components/sections/FAQSection.astro:15` : « 25 000 € HT, installation incluse. » → « 25 000 € HT, installation possible sur devis. »
- `src/pages/llms-full.txt.ts:13` : « garantis 5 ans, installation incluse. » → « garantis 5 ans, installation possible sur devis. »
- `public/llms.txt:3` : « garantis 5 ans, installation incluse. » → « garantis 5 ans, installation possible sur devis. »
- `src/lib/blog-cron.ts:45` : « Garantie 5 ans, installation incluse. » → « Garantie 5 ans, installation possible sur devis. »
- `src/content/products/<fiche>.json:12` (21 fiches) : « Installation incluse » → « Installation possible sur devis » : anneaux-ligne, anneaux-triangle, barres-hautes, barres, champignons, grand-triangle, grande-palissade, grande-plateforme, labyrinthe, obstacles-os, obstacles-pattes, parcours-agility-complet, parcours-agility-essentiel, petit-triangle, petite-balance, petite-palissade, petite-plateforme, petits-murs, slalom, triple-cerceau, triple-stand

Test rouge avant (`tests/chiffres.test.ts`, motif « installation promise dans le prix », après build) :
```
✖ aucun ancien chiffre : installation promise dans le prix
ℹ tests 11 · pass 10 · fail 1
42 pages fautives, dont : index.html « installation incluse », llms.txt, llms-full.txt, caniparc, prix-parc-canin « fourniture et pose », 21 fiches produits « Installation incluse », 13 articles (« pose incluse », « pose est incluse », « incluant l’installation »…)
```
code 1

Après, `npm test` :
```
ℹ tests 68
ℹ pass 68
ℹ fail 0
```
code 0

`npm run build` :
```
[build] Complete!
```
code 0

`grep -rniE "installation (incluse|comprise)|pose comprise" src public tests` puis `… dist` :
```
(aucun résultat)
```
code 1 (aucune ligne trouvée) dans les deux cas. docs/ exclu : la fiche cite les anciennes formules.

Nombres dans le diff de src/ et public/ :
```
nombres retirés: {} nombres ajoutés: {}
```
0 nombre changé.

gitleaks origin/main..HEAD :
```
INF no leaks found
```
code 0
