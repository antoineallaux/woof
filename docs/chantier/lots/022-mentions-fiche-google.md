# Lot 022-mentions-fiche-google              Estimation : 2 € · 1 session
Objectif      : avant la création de la fiche Google Business « Woof! Parcs », le site woof-parcs.fr ne dit plus « leader européen » ni « Made in Europe » : une seule formule, « fabricant européen » ; les chiffres de /qui-sommes-nous/ sont clairement ceux du groupe Herkules Fitness.
Contexte      : demande D-20261125-3 (~/Projects/atelier/a-lancer.md, ligne « D-20261125-3 », à lire en entier) ; origine : clic d'Antoine sur Q-20261125-6, choix 1 (#woof, 25/11 09:26). Détail : ~/Projects/.cerveau/travaux/woof-seo/fiche-google-et-places-de-marche-2026-11-25.md § A5 (lecture seule). Lot 020 (fusionné le 23/11) : « fabricant européen » partout et test qui bloque « fabricant français » (tests/chiffres.test.ts) : même méthode ici.
Taille        : textes de quelques composants et pages (critère de fin : tests et build du dépôt).
À faire       :
  « leader européen » remplacé par une phrase avec « fabricant européen » partout où il apparaît (relevé du chef au 25/11 sur origin/main : src/components/sections/Hero.astro:40, Herkules.astro:18 et 21, layout/Footer.astro:29, pages/qui-sommes-nous.astro:10 ; chercher aussi dans src/content, src/lib et le reste du dépôt) ; phrases relues pour rester correctes en français
  /agility/ : « Made in Europe » (src/pages/agility.astro:188, avec son « 100 % ») remplacé par la même formule « fabricant européen »
  /qui-sommes-nous/ : « 500+ appareils installés, 100+ appareils différents, 15 pays » (qui-sommes-nous.astro:148-151 et 178) clairement attribués au groupe Herkules Fitness (titre ou libellé du bloc), sans laisser croire à des parcs canins ; chiffres eux-mêmes inchangés
  test qui bloque « leader européen » et « Made in Europe » sur tout le site construit (ou les sources), dans tests/chiffres.test.ts comme « fabricant français » au lot 020 ; rouge avant la correction, vert après
Hors périmètre: tout autre texte, page, article ou mise en page ; aucun chiffre nouveau ni modifié ; herkules-fitness.com ; la fiche Google elle-même ; aucun envoi ; aucune image.
Contraintes   : branche lot/022-mentions-fiche-google depuis origin/main (--no-track) ; aucun secret lu ni collé ; jamais l'UGAP ni un nombre de communes ; « fabricant européen », jamais « fabricant français » ni « leader » ; textes seulement.
Fini quand    :
  liste de chaque remplacement (fichier:ligne, avant → après) collée dans la Preuve
  grep « leader européen » et « Made in Europe » sur src et sur la page construite (dist) : 0 ligne, sortie collée
  test neuf rouge sur origin/main puis vert : sorties collées
  tests et build verts : sorties collées suivies de « code N » ; gitleaks 0 fuite ; PR ouverte
  fiche de lot « Lot en cours : … » après « ## Preuve »
  « Pour Alfred » rédigé (texte seulement) avec sa ligne « Suite : » (contrôle en ligne de l'accueil, /agility/ et /qui-sommes-nous/ ; la fiche Google peut alors être créée)
  ~/Projects/atelier/livre.sh
Hypothèses    : 1) « fabricant européen » est la formule validée (lot 020) et vaut aussi pour la marque Herkules Fitness. 2) Les chiffres de /qui-sommes-nous/ sont ceux du groupe : on les attribue, on ne les vérifie pas dans ce lot.
Porte         : rien
Ticket        : aucun
Demande       : D-20261125-3
Branche       : lot/022-mentions-fiche-google
Tentatives    : 0/3

## Pour Alfred

## Preuve
