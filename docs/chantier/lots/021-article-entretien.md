# Lot 021-article-entretien              Estimation : 4 € · 1 session
Objectif      : l'article « Entretien d'un parc canin : la checklist annuelle des services techniques » de woof-parcs.fr est retravaillé pour obtenir des clics (titre, angle, réponses chiffrées, liens internes).
Contexte      : demande D-20261124-1 (~/Projects/atelier/a-lancer.md, ligne « D-20261124-1 », à lire en entier) ; origine : conception du pilote SEO validée par Antoine (#woof, message 1569312902886850631). Article https://www.woof-parcs.fr/blog/entretien-dun-parc-canin-la-checklist-annuelle-des-services-techniques/ (fichier src/content/blog/entretien-dun-parc-canin-la-checklist-annuelle-des-services-techniques.mdx) : 0 clic 6 semaines après sa publication, 2 affichages, indexé. Mesures : ~/Projects/.cerveau/travaux/woof-seo/hebdo/2026-11-24.json et 2026-11-24.md (lecture seule). Lot 020 (fusionné le 23/11) : « fabricant européen », délais, aucun prix nouveau.
Taille        : un article et ses liens (critère de fin : tests, lint et build du dépôt).
À faire       :
  titre et méta-description recentrés sur ce que cherche un service technique (entretien parc canin, fréquence, contrôle des agrès, coût d'entretien annuel) ; même adresse (URL inchangée, aucune redirection)
  angle : checklist utilisable telle quelle (mensuel, trimestriel, annuel), réponses courtes et chiffrées en tête de section (fréquences, durées, points de contrôle) ; FAQ en fin d'article
  liens internes vers /caniparc/, /produits/ (agrès concernés), /prix-parc-canin/, /devis/ et l'article sur la loi ; deux articles du blog au plus qui renvoient vers celui-ci
  date de mise à jour de l'article posée au 24/11/2026
Hors périmètre: tout autre article ou page ; tout prix nouveau, « à partir de » ou fourchette ; herkules-fitness.com ; aucune image générée ; aucun envoi ; fiches d'objectifs du pilote (~/Projects/.cerveau/woof-seo/).
Contraintes   : branche depuis origin/main (--no-track) ; aucun secret lu ni collé ; jamais l'UGAP ni un nombre de communes ; « fabricant européen », jamais « fabricant français » ; un chiffre d'entretien non sourcé dans le dépôt ou les fiches Herkules n'est pas inventé : il s'écrit comme une recommandation (« au moins une fois par… ») ou il est omis ; garantie et délais comme dans le lot 020.
Fini quand    :
  avant / après du titre, de la méta-description et du plan (H2) collés dans la Preuve
  liens internes ajoutés listés ; build vert et page construite qui contient chaque lien
  tests, lint et build verts : sorties collées suivies de « code N » ; gitleaks 0 fuite ; PR ouverte
  « Pour Alfred » rédigé (texte seulement) avec sa ligne « Suite : » (demande d'indexation Search Console de l'article, contrôle en ligne)
  ~/Projects/atelier/livre.sh
Hypothèses    : 1) Le faible nombre d'affichages vient d'un titre et d'un angle qui ne répondent pas aux requêtes des services techniques, pas d'un défaut d'indexation (indexé d'après Search Console). 2) L'URL reste la même : la changer ferait perdre l'indexation.
Porte         : rien
Ticket        : aucun
Demande       : D-20261124-1
Branche       : lot/021-article-entretien
Tentatives    : 0/3

## Pour Alfred
L'article sur l'entretien d'un parc canin est réécrit pour répondre à ce que cherche un service technique : quoi contrôler et à quelle fréquence. Nouveau titre Google « Entretien d'un parc canin : checklist et fréquences », une checklist à cocher (chaque semaine, mois, trimestre et année), un tableau récapitulatif, le registre, les postes du budget annuel (sans nouveau prix), la garantie 5 ans et les pièces détachées 10 ans (repris des CGV), une FAQ de 5 questions. Même adresse, date de mise à jour au 24/11/2026. L'article est maintenant lié depuis l'article sur la loi et l'article sur le coût d'un parc canin (en plus de celui sur le parcours agility).
Suite : demander l'indexation de https://www.woof-parcs.fr/blog/entretien-dun-parc-canin-la-checklist-annuelle-des-services-techniques/ dans Search Console (inspection de l'URL) ; contrôle en ligne (titre, « Mis à jour le 24 novembre 2026 », checklist et liens) ; relire clics et affichages de l'article dans l'hebdo SEO du 08/12.

## Preuve
Avant / après (source : git show origin/main et page construite dist/client/blog/entretien-…/index.html)
- Titre Google : « Entretien parc canin : checklist annuelle des services techniques » → « Entretien d'un parc canin : checklist et fréquences | Woof! » (58 car.)
- Méta-description : « La checklist complète pour entretenir votre caniparc toute l'année : inspections, budget, maintenance des équipements. Devis gratuit avec Woof! » → « Quoi contrôler et quand : la checklist d'entretien d'un parc canin (agrès, sol, clôture), semaine, mois, trimestre et année, plus le registre et le budget. » (152 car.)
- H1 : « Entretien d'un parc canin : la checklist annuelle des services techniques. » → « Entretien d'un parc canin : la checklist des services techniques »
- H2 avant : À retenir / Pourquoi l'entretien d'un parc canin est une responsabilité des collectivités / La checklist hebdomadaire : les contrôles rapides / L'inspection technique semestrielle : le cœur de la checklist / Budget annuel : anticiper les postes de dépense / Traçabilité : le registre d'entretien, un outil indispensable / Choisir des équipements pensés pour réduire l'entretien / Mettre en place un planning annuel type / Faites de l'entretien un atout, pas une contrainte
- H2 après : À retenir / Quelle fréquence d'entretien pour un parc canin ? / Chaque semaine : le passage visuel / Chaque mois : sol, propreté et signalétique / Chaque trimestre : fixations et agrès / Chaque année : l'inspection complète et le bilan / Le registre d'entretien : ce qu'il doit contenir / Quel coût d'entretien prévoir chaque année ? / Garantie et pièces : ce que couvre le fabricant / Questions fréquentes (5 questions) / Un parc qui s'entretient facilement se choisit dès le départ
- URL inchangée (nom de fichier identique), aucune redirection. updatedDate: 2026-11-24 → page construite : « Mis à jour le 24 novembre 2026 », dateModified 2026-11-24.
- Chiffres : seulement ceux du dépôt (garantie 5 ans et pièces 10 ans minimum : src/pages/cgv.astro art. 5 ; 3 à 4 / 12 à 15 semaines et pose sur devis : lot 020 ; devis sous 48 h : accueil). Fréquences écrites comme recommandations (« au moins une fois par… »). Aucun prix, aucun « à partir de ». Retirés : contrat de maintenance, modèles de registre de la Société Centrale Canine, liens service-public/Légifrance (non sourcés).
Liens internes ajoutés dans l'article : /caniparc/, /produits/, /prix-parc-canin/, /devis/ (remplace /contact/), /blog/creation-dun-parc-chien-collectivite-ce-que-dit-la-loi/, /produits/panneau-info/, /produits/porte-laisse/ ; gardés : grande-passerelle, passerelle, grande-palissade, grande-plateforme, grande-balance, tunnel-rex, tunnel-milou, abris-en-bois.
Liens entrants ajoutés (2) : creation-dun-parc-chien-collectivite-ce-que-dit-la-loi.mdx (§ Entretien et maintenance) et combien-coute-un-parc-canin-pour-une-commune-budget-detaille.mdx (§ coûts cachés) ; existant : creer-un-parcours-agility-chien-dans-sa-commune.mdx.
Page construite (grep -c href dans dist/client/blog/entretien-…/index.html, en-tête et pied compris) : /caniparc/ 3, /produits/ 3, /prix-parc-canin/ 2, /devis/ 3, /blog/creation-dun-parc-chien-collectivite-ce-que-dit-la-loi/ 1. Test ajouté : maillage.test.ts « l'article entretien lie les pages d'achat et la loi, deux articles le lient » ; titres.test.ts : titre et description de l'article.
npm run build (fin de sortie) :
```
08:21:13 [@astrojs/vercel] Copying static files to .vercel/output/static
08:21:13 [build] Server built in 3.80s
08:21:13 [build] Complete!
```
code 0
npm test (résumé et tests du lot) :
```
✔ maillage : l'article entretien lie les pages d'achat et la loi, deux articles le lient (0.943958ms)
✔ /blog/entretien-dun-parc-canin-la-checklist-annuelle-des-services-techniques : title et description (0.066042ms)
ℹ tests 81
ℹ pass 81
ℹ fail 0
```
code 0
Lint : pas de script lint dans package.json ; npx astro check rouge, même total que sur origin/main (lot 020 : 95 errors), aucune erreur dans les fichiers du lot (0 ligne de sortie qui les cite).
npx astro check :
```
- 95 errors
- 0 warnings
```
code 1
gitleaks detect --log-opts origin/main..HEAD :
```
8:21AM INF no leaks found
```
code 0

Lot en cours : vérification à lancer par le chef — 021-article-entretien, PR #25 https://github.com/antoineallaux/woof/pull/25
Fait : article entretien réécrit (titre Google, méta, H1, checklist semaine/mois/trimestre/année, tableau, registre, budget sans prix, garantie et pièces, FAQ 5 questions, lien devis), updatedDate 24/11/2026, liens entrants depuis les articles loi et coût, tests titres et maillage étendus.
Reste : demande d'indexation Search Console et contrôle en ligne après mise en ligne (ligne Suite de « Pour Alfred »).
Dernière preuve : build vert, tests 81/81 verts, gitleaks 0 fuite, PR #25.
