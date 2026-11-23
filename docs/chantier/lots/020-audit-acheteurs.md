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
  « Pour Alfred » écrit (contrôle en ligne, demande à la commune de Vidauban pour le bloc masqué, ligne « Suite : »)
  ~/Projects/atelier/livre.sh
Hypothèses    : une donnée d'agrès absente du dépôt Woof! et des fiches Herkules (dimension, emprise) n'est pas inventée : elle est omise et listée dans « Pour Alfred ».
Porte         : rien
Ticket        : aucun
Demande       : D-20261123-23
Branche       : lot/020-audit-acheteurs
Tentatives    : 0/3

## Pour Alfred

Suite : à écrire par l'exécutant

## Preuve
