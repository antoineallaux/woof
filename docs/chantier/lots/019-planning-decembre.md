# Lot 019-planning-decembre              Estimation : 1 € · 1 session
Objectif      : le planning du blog de décembre (4 sujets, src/content/planning-blog.json) est prêt à partir : aucun sujet ne double un article en ligne ni ne fait concurrence à une page du site, et chaque sujet vise les acheteurs (mairies, campings, bailleurs, syndics).
Contexte      : demande D-20261117-8 (~/Projects/atelier/a-lancer.md, ligne « D-20261117-8 ») ; planning écrit par le pilote SEO sur la branche pilote-seo/planning-2026-12 (PR #20, sans fiche de lot) ; cette branche part de sa tête ; relecture d'Alfred du 17/11 (commentaire de la PR #20, `gh pr view 20 --comments`) : sujet 3 (19/12, mot-clé « caniparc ») fait concurrence à la page /caniparc/ (objectif OBJ-03) → mot-clé « différence caniparc parc canin » et lien fort vers /caniparc/ ; sujets 1, 2, 4 sans doublon ; articles en ligne : src/content/blog/.
Taille        : correctif ciblé (critère de fin = tests + build).
À faire       : (1) sujet 3 : mot-clé « différence caniparc parc canin » (titre gardé ou ajusté au mot-clé) ; (2) sujet 4 : mot-clé tourné vers l'acheteur (la commune qui fait connaître son parc), pas « parc canin à proximité » qui attire les promeneurs ; (3) relire les 4 sujets contre tous les articles de src/content/blog/ (titres et mots-clés) et contre les pages /caniparc/, /agility/, /prix-parc-canin/ : tableau sujet → article ou page le plus proche → pourquoi ce n'est pas un doublon, dans la preuve.
Hors périmètre: rédaction des articles ; pilote SEO (hub) ; autres mois du planning ; .env*.
Contraintes   : format du planning inchangé (lot 015) ; fiche ajoutée de force à la branche (`git add -f`, docs/ ignoré) ; PR neuve depuis lot/019-planning-decembre ; la PR #20 sera fermée par le chef après fusion. Interdits de l'atelier : `~/Projects/atelier/gabarits/interdits-lot.md`.
Fini quand    :
  diff du planning (avant / après) collé ; tableau des doublons collé
  tests du projet et `npm run build` verts : sorties collées suivies de « code N »
  gitleaks sur origin/main..HEAD : 0 fuite ; PR ouverte
  « Pour Alfred » écrit avec sa ligne « Suite : »
  ~/Projects/atelier/livre.sh
Hypothèses    : aucune
Porte         : rien
Ticket        : aucun
Demande       : D-20261117-8
Branche       : lot/019-planning-decembre
Tentatives    : 0/3

## Pour Alfred

Planning de décembre corrigé : sujet 3 (19/12) mot-clé « différence caniparc parc canin » (titre gardé, il contient déjà « caniparc » et « parc canin » ; lien fort vers /caniparc/ à mettre dans l'article) ; sujet 4 (26/12) mot-clé « faire connaître son parc canin commune » (côté commune, plus les promeneurs). Sujets 1 et 2 inchangés. Aucun doublon.

Suite : fusion, prod

## Preuve

Diff du planning :

```
-    "motCle": "caniparc",
+    "motCle": "différence caniparc parc canin",
-    "motCle": "parc canin à proximité",
+    "motCle": "faire connaître son parc canin commune",
```

Tableau des doublons (46 articles de src/content/blog/ et pages /caniparc/, /agility/, /prix-parc-canin/ relus, titres et recherche de mots) :

| Sujet | Plus proche | Pourquoi pas un doublon |
|---|---|---|
| 05/12 Marchés publics : acheter les équipements | article « Rédiger le cahier des charges… » ; /prix-parc-canin/ | le cahier des charges décrit quoi demander ; /prix-parc-canin/ donne les prix ; aucun article ne traite la procédure d'achat (seuils, mise en concurrence) : une phrase dans « 7 étapes » seulement |
| 12/12 Copropriété ou résidence | article « Bailleurs sociaux… » (publié 12/11) | bailleurs = habitat social ; copropriété = syndics, vote en assemblée générale, règlement de copropriété (le mot n'apparaît qu'en passant dans l'article bailleurs) |
| 19/12 Caniparc ou parc canin | page /caniparc/ | la page vend l'offre ; le sujet répond à la question de vocabulaire avec le mot-clé « différence caniparc parc canin », sans cibler « caniparc » seul ; lien fort vers /caniparc/ |
| 26/12 Faire connaître son parc | « Paroles de riverains » (signalétique), « 7 étapes » (inauguration) | ces articles parlent d'usage et d'inauguration ; aucun ne traite cartes en ligne ni communication ; mot-clé tourné vers la commune |

Tests (66) :

```
ℹ tests 66
ℹ pass 66
ℹ fail 0
```
code 0

Build (`npm run build`) :

```
[build] Complete!
```
code 0

gitleaks origin/main..HEAD :

```
3 commits scanned. no leaks found
```
code 0

Lot en cours: 019-planning-decembre
Fait: mots-clés sujets 3 et 4, tableau des doublons, tests et build verts
Reste: PR et livre.sh
Dernière preuve: tests 66/66, build ok, gitleaks 0 fuite
