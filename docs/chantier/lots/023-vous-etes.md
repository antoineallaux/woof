# Lot 023-vous-etes              Estimation : 4 € · 1 session
Objectif      : dans le formulaire de devis du site Woof, le visiteur choisit obligatoirement « Vous êtes » (commune, bailleur social, copropriété, entreprise, camping, autre), et ce choix arrive dans le champ Industry du prospect Zoho.
Contexte      : demande D-20261125-10 (`~/Projects/atelier/a-lancer.md`, ligne « D-20261125-10 », à lire en entier) ; origine : Antoine (salon emails, message 1575102073471631371 : « Il faut surtout que le type soit rempli, je pense qu'il faut ajouter une sélection dans le formulaire »). Constat d'Alfred : depuis le 25/10, les 13 prospects du site Woof ont Industry vide. Code relevé par le chef : `src/pages/api/contact.ts` et `src/lib/mail-devis.ts` (création du prospect Zoho) ; tests `tests/contact.test.ts`, `tests/mail-devis.test.ts`. Valeurs Industry déjà utilisées par Herkules (moteur de devis, `~/Projects/herkules-bot-devis/src/core/lead/mapping.ts`, lecture seule) : Ville, Entreprise, Camping, Autre… ; « bailleur social » et « copropriété » n'y sont pas.
Taille        : petite fonctionnalité (critère de fin : tests et build du dépôt).
À faire       :
  1. Sélection « Vous êtes » obligatoire dans le formulaire de devis (Commune, Bailleur social, Copropriété, Entreprise, Camping, Autre ; aucune présélection) ; refus sans choix, côté page et côté `api/contact` (valeur hors liste refusée).
  2. Correspondance vers Industry : Commune → Ville, Entreprise → Entreprise, Camping → Camping, Autre → Autre ; Bailleur social et Copropriété : valeurs absentes de la liste Zoho, à écrire telles quelles si l'API les accepte, sinon « Autre » en attendant ; dire dans « Pour Alfred » quelles valeurs ajouter à la liste Zoho (geste d'Alfred).
  3. Le choix apparaît aussi dans le mail de devis interne s'il liste les champs du prospect.
Hors périmètre: liste des valeurs Industry dans Zoho ; prospects déjà créés ; autres pages ; tout envoi réel vers Zoho ou par mail pendant le lot (cibles factices dans les tests) ; prix.
Contraintes   : branche lot/023-vous-etes depuis origin/main (`--no-track`), worktree `~/Projects/woof/.worktrees/lot-023-vous-etes` ; aucune donnée réelle ; aucun secret lu ni collé ; aucune nouvelle dépendance ; « fabricant européen », jamais « fabricant français » ni « leader » (lots 020 et 022).
Fini quand    :
  tests rouges puis verts (envoi sans choix refusé ; valeur hors liste refusée ; Industry posée dans la requête Zoho factice pour chaque valeur) : sorties collées, suivies de « code N »
  tableau « valeur choisie → Industry envoyée » collé dans la Preuve
  build et tests verts : sorties collées, suivies de « code N » ; captures navigateur locales du formulaire (ordinateur et téléphone) dans docs/chantier/lots/023-captures/
  gitleaks 0 fuite ; PR ouverte, son numéro dans la fiche
  section « Pour Alfred » rédigée par l'exécutant (texte seulement), avec une ligne « Suite : » qui liste les gestes d'après mise en ligne (dont valeurs à ajouter dans Zoho et essai avec un prospect TEST)
  fiche de lot « Lot en cours : 023-vous-etes livré, PR ouverte, vérification à lancer par le chef » après « ## Preuve »
  ~/Projects/atelier/livre.sh
Hypothèses    : 1) Le prospect Zoho est créé par `api/contact` (ou `mail-devis`), qui peut poser Industry sans autre changement. 2) Zoho accepte une valeur hors liste dans Industry ou la refuse : à établir sur la documentation de l'API, sans essai réel.
Porte         : rien
Ticket        : aucun
Demande       : D-20261125-10
Branche       : lot/023-vous-etes
Tentatives    : 0/3

## Pour Alfred
Le formulaire de devis (et celui de /contact/, qui envoie vers la même API) demande « Vous êtes » : Commune, Bailleur social, Copropriété, Entreprise, Camping, Autre, aucune présélection ; sans choix ou hors liste, la demande est refusée. Le choix part dans `industry` vers `herkules-assistant /api/prospect`, apparaît dans le mail interne et dans la description du lead.
Bailleur social et Copropriété : absents de la liste Industry de Zoho et impossible de vérifier ici si l'API les accepte (code d'herkules-assistant absent de ce poste, aucun essai réel) : envoyés en « Autre » en attendant, le vrai choix reste lu dans la description (« Vous êtes : … »).
Suite : mise en service par le guetteur ; ensuite Alfred : ajouter « Bailleur social » et « Copropriété » à la liste Industry de Zoho, vérifier que /api/prospect transmet bien `industry` au lead, puis changer deux lignes de `VOUS_ETES` dans `src/lib/mail-devis.ts` ; après mise en ligne, essai avec un prospect TEST (à supprimer ensuite par Antoine) et contrôle que Industry est rempli.

## Preuve
Lot en cours : 023-vous-etes livré, PR ouverte, vérification à lancer par le chef.
Fait : sélection « Vous êtes » (devis et contact), refus API, Industry dans la requête prospect, ligne dans le mail interne, tests et build verts, captures.
Reste : rien (gestes d'après mise en ligne dans « Suite : »).
Demande de fusion : PR #27 https://github.com/antoineallaux/woof/pull/27

Tests rouges sur le code d'origine (tests neufs) :
```
✖ contact : sans « Vous êtes » = 400, rien envoyé
✖ contact : « Vous êtes » hors liste = 400, rien envoyé
✖ tests/mail-devis.test.ts (import de corpsProspect / VOUS_ETES absent)
ℹ tests 6 · pass 3 · fail 3
```
code 1

Tests après correction (suite complète, build fait avant) :
```
ℹ tests 86
ℹ pass 86
ℹ fail 0
```
code 0

Build :
```
[build] Server built in 4.23s
[build] Complete!
```
code 0

Valeur choisie → Industry envoyée (test « Industry posée dans la requête prospect », corps `corpsProspect`) :
| Choisi | Industry |
|---|---|
| Commune | Ville |
| Bailleur social | Autre (+ « Vous êtes : Bailleur social » en description) |
| Copropriété | Autre (+ description) |
| Entreprise | Entreprise |
| Camping | Camping |
| Autre | Autre |

Écart : la requête Zoho est vérifiée sur le corps construit par `corpsProspect` (le test ne peut pas passer l'envoi Resend sous node, `import.meta.env` absent) ; l'API refuse sans choix et hors liste (`toString`, `__proto__` compris).
Captures locales : docs/chantier/lots/023-captures/devis-ordinateur.png et devis-telephone.png (aucune présélection, « Choisissez... »).
Page /contact/ aussi modifiée : elle poste sur la même API, qui refuse désormais sans choix.

gitleaks : diff du lot, aucune fuite (« no leaks found »). L'historique signale 2 anciennes entrées dans `.vercel/output/...` du commit e5fa464, antérieur au lot (hors périmètre).
