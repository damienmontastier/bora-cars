# Refonte page Contact : parcours Particulier / Pro (phase 1 : design Figma uniquement)

## Règle n°1
**Cette conversation sert uniquement au design Figma.** Tu ne modifies AUCUN fichier du repo et tu n'écris rien dans Sanity ni dans Airtable (la lecture est autorisée). Le code se fera dans une autre conversation, une fois une piste validée.

## Contexte
Le projet BORA CARS (monorepo `bora-cars`) est décrit dans les `CLAUDE.md` à la racine, dans `web/` et dans `studio/`, et dans ta mémoire projet. À retenir : BORA fait de la **location** de voitures de luxe, jamais de vente. Aucun libellé ne doit parler d'« acheter » ou de « vente ». LOA et LLD restent des formules de location.

Le client a prototypé seul un formulaire de qualification réservé aux professionnels (`bora_test_form/index.html`). Il le voyait comme une page à part, accessible par un lien privé. On part plutôt sur **une page Contact avec deux parcours** :
- en haut du formulaire, un **sélecteur de profil** : « Particulier » / « Professionnel » (le nom reste à trouver, voir §4) ;
- **Particulier** : le formulaire actuel, inchangé (Nom*, Prénom, Email*, Téléphone*, Objet de la demande*, Message*, case newsletter) ;
- **Professionnel** : tous les champs et toute la logique du prototype client, remis au propre (voir §5).

Le lien privé voulu par le client est remplacé par un lien direct `/{fr|en}/contact?profil=pro`, qui ouvre la page Contact directement sur le parcours Pro. Il pourra le partager sur WhatsApp ou Instagram, avec des UTM.

Je veux **plusieurs propositions de rendu (3 pistes)**, pas une solution unique.

## 1. À lire avant de dessiner
- **Le prototype client** `bora_test_form/index.html` pèse 148 Ko, dont des polices et un logo en base64. Lis-le sans ces blocs :
  `sed -E 's/base64,[A-Za-z0-9+\/=]{100,}/base64,<STRIPPED>/g' bora_test_form/index.html > <scratchpad>/form.html`
  Reprends ses **champs, sa logique conditionnelle et son écran de fin**. Ne reprends **pas** son thème sombre « BORA Club » : le site est beige et noir, et le DS Figma fait foi.
- **Le code actuel**, pour savoir ce qui existe déjà :
  - `web/app/pages/contact.vue` et `web/app/components/elements/ContactForm.vue` ;
  - les atomes `web/app/components/atoms/` : `FieldText`, `FieldPhone`, `FieldSelect`, `FieldTextarea`, `FieldCheckbox`, `Switch` ;
  - `CurrencyToggle`, un sélecteur à deux options déjà codé qui peut servir de base au sélecteur de profil.
- **Figma** : fichier `JujmgSOaOw3qXqrAvlhp6y` ([PROD] BORA).
  - Page « ✅  Contact » `459:15529` :
    - composant `input` `838:3001`, avec 4 types : `text`, `text-char` (textarea), `num` (téléphone +33) et `dropdown` ;
    - ses états : `empty`, `cliqued`, `Variant4` (saisie en cours), `filled` et `error` ;
    - maquette desktop `838:2798` (1440 px), avec un doublon en `839:1606` ;
    - maquette mobile `857:3527` (393 px), dont la frame est mal nommée « Catalogue ».
  - Page « ✅  DS » `430:3944`, **à respecter obligatoirement** :
    - `ButtonContact` `415:83` : couleurs black, beige et orange ; styles fill, transparent et outline ; états default, hover et disable ;
    - `ButtonText` `430:4406`, `ButtonIcon` `431:5804` ;
    - `Tabs(step)` `431:5440` (« (A) Prise de contact »), états default et active ;
    - `Step` `430:4885`, `Title`, `Text` ;
    - les icônes `431:5790` (chevrons, flèches) ;
    - FONDATIONS Couleur `3029:1021`, Typographie `3033:749` et Typographie mobile `3014:693`.
  - Utilise toujours les variables, styles de texte et composants existants. Aucune valeur en dur quand un token existe.

## 2. D'abord, compléter le DS
Travaille sur la page ✅ DS, dans une nouvelle frame « Form ». Le DS ne contient que des champs texte, select, textarea et téléphone. Le parcours Pro a besoin en plus de :
- **Sélecteur de profil** : deux options (partir de `AtomsCurrencyToggle` et du style de `Tabs(step)`). États default, hover et active, en desktop et en mobile.
- **Checkbox** : elle existe dans le code (`AtomsFieldCheckbox`) mais pas dans Figma. États unchecked, checked, hover, error et disabled.
- **Choix unique en carte (radio)** : pour Oui/Non, l'usage prévu, le délai, LOA/LLD. Une variante en ligne (2 ou 3 options côte à côte) et une variante en colonne.
- **Choix multiple en carte** : pour la liste des justificatifs.
- **Indicateur d'étape ou de progression** (si une piste en a besoin) : étendre `Tabs(step)` plutôt qu'inventer un nouveau composant.
- **Bouton « Précédent »** : vérifier d'abord si `ButtonContact` en transparent ou outline suffit.
- **Date de création (mois + année)** : deux dropdowns côte à côte et une case « Société en cours de création » qui les désactive. Ajouter l'état `disabled` à l'input dropdown s'il n'existe pas.
- **Encart d'aide** : l'équivalent du « doc-hint » du prototype.

Chaque composant est un component set, avec des variantes nommées comme les composants existants (`state=…, type=…`), en auto-layout et relié aux tokens.

## 3. Trois pistes de rendu
Travaille sur la page « ✅  Contact », dans une nouvelle section « 🚧 Particulier / Pro — pistes ». Ne modifie et ne supprime rien de l'existant.

Mise en page actuelle : en desktop, deux colonnes de 656 px (H1 à gauche, formulaire à droite), fond beige, footer orange. Les 3 pistes partagent le même sélecteur de profil, en tête de la colonne formulaire.

- **Piste A — Parcours en étapes.**
  - En Pro, la colonne de droite devient un parcours en 5 étapes : (A) Vous, (B) Société, (C) Situation, (D) Projet, (E) Justificatifs.
  - L'indicateur d'étape reprend le style de `Tabs(step)`, avec des boutons Précédent / Continuer.
  - Dans la colonne de gauche, le H1 laisse la place au pitch pro du prototype (« Vous êtes professionnel et rencontrez des difficultés à obtenir un leasing… »).
- **Piste B — Un seul long formulaire en sections.**
  - Tout tient sur une page, en sections titrées (A) à (E).
  - En desktop, la colonne de gauche reste fixe au scroll et sert d'index et de progression.
  - Un seul bouton d'envoi, en bas.
- **Piste C — Sections repliables.**
  - Une seule section est ouverte à la fois.
  - Une section terminée se replie en une ligne de résumé modifiable, par exemple « Société — SAS · créée 03/2021 · 50–150 k€ ✎ ».

Pour chaque piste, dessine en desktop 1440 **et** en mobile 393 :
1. le parcours Particulier sélectionné (formulaire actuel + sélecteur) ;
2. chaque étape ou section du parcours Pro, avec les **champs conditionnels affichés** ;
3. un état d'erreur de validation ;
4. l'écran de succès. Le prototype propose une liste de liens : rejoindre la chaîne WhatsApp BORA Club, Instagram @bora.cars et le site. Adapte-la au DS et supprime le lien vers le site, puisque l'utilisateur y est déjà.

Contraintes :
- aucun défilement horizontal en desktop ;
- maquettes en français, mais prévois de la place pour des libellés anglais plus longs (les boutons ne doivent pas passer à la ligne).

## 4. Nom du sélecteur : au moins 2 variantes dans le Figma
- **Par statut** : « Particulier / Professionnel ». C'est cohérent avec la navigation du site (le footer liste Propriétaire, Professionnel, Particulier). Le risque : un pro qui veut louer une voiture pour un week-end tombe sur un formulaire de financement en 5 étapes.
- **Par besoin** : par exemple « Location & autres demandes / Leasing professionnel (LOA · LLD) ». Ou bien le statut avec un sous-titre sous chaque option, par exemple « Professionnel — LOA / LLD pour votre société ».

Donne une recommandation argumentée.

## 5. Champs du parcours Pro
Les réponses iront dans la table Airtable `Leads`, qui a déjà plusieurs listes à choix. **Dessine avec les listes « proposées » ci-dessous, pas avec celles du prototype**, et signale tout ce qui te paraît faux. (*) = obligatoire.

| Étape | Champ | Type | Liste proposée / remarque |
|---|---|---|---|
| A Vous | Prénom*, Nom* | texte ×2 | Le prototype rend le Prénom obligatoire, le formulaire actuel non |
| A | Téléphone WhatsApp* | num (+33 / +41) | Au moins 8 chiffres |
| A | Email | texte | Facultatif dans le prototype, obligatoire dans le formulaire actuel → question ouverte |
| A | Ville* | texte | |
| B Société | Nom de la société* | texte | |
| B | Forme juridique* | dropdown | Airtable : SAS / SASU · SARL / EURL · Micro-entreprise · Sàrl (CH) · SA (CH) · Autre. La liste du prototype est 100 % française alors que BORA est à **Genève et Paris** : proposer une liste FR + CH |
| B | Date de création | mois + année, ou case « en cours de création » | Envoyée au format MM/AAAA |
| B | Domaine d'activité* | texte | Placeholder « VTC, BTP, conseil, e-commerce… » |
| B | Chiffre d'affaires annuel* | dropdown | Les tranches du prototype se chevauchent (« Plus de 100 000 € » et « Plus de 500 000 € »). Prendre celles d'Airtable : Pas encore de CA · < 50 k€ · 50–150 k€ · 150–500 k€ · > 500 k€ |
| B | Bilans clôturés disponibles | dropdown | Airtable : Aucun · 1 bilan · 2 bilans+ (le prototype propose 0/1/2/3+) |
| C Situation | Revenus personnels à côté ? | Oui/Non | Si Oui : type de revenus (CDI · CDD · Intérim · Indépendant). Retirer « Aucun », qui contredit « Oui » |
| C | Apport ou caution mobilisable* | dropdown | Aucun · Moins de 5 000 € · 5 000–15 000 € · Plus de 15 000 €. Si « Moins de 5 000 € » : champ « Montant précis* » (voir question 3) |
| C | *Suggestion* : « Avez-vous déjà essuyé un refus de financement (concession, banque) ? » | Oui/Non | Correspond au pitch du prototype et à la case Airtable `Refusé en concession`, qui existe déjà |
| D Projet | Usage prévu* | radio | Usage pour ma société · Sous-location · Les deux |
| D | Je recherche | radio | LOA · LLD · Je ne sais pas encore. Si LOA ou LLD : km / an (num) + durée (3 ans · 4 ans · 5 ans et +) |
| D | Contrat professionnel · Je souhaite être conseillé | checkbox ×2 | « Contrat professionnel » n'est pas clair → question ouverte |
| D | Modèle(s) souhaité(s) | texte | « Mercedes GLC, BMW Série 3… » |
| D | Nombre de véhicules | num | Valeur par défaut : 1 |
| D | Budget mensuel envisagé | num | |
| D | Délai | radio en ligne | Urgent · Sous 1 mois · Flexible |
| E Justificatifs | Documents disponibles | choix multiple | Kbis de moins de 3 mois · Relevés de compte pro (12 mois) · Pièce d'identité · Permis · Bail commercial · Dernier bilan · Présence en ligne (site, réseaux). Prévoir l'équivalent suisse du Kbis (extrait du Registre du commerce). Encart : « rien n'est bloquant » |
| E | Autre chose à nous dire ? | textarea | |
| E | Consentement | mention | Le formulaire actuel affiche une mention RGPD sous le bouton, sans case à cocher. Le prototype impose une case → question ouverte |

Logique conditionnelle à **montrer dans les maquettes** :
- la case « en cours de création » désactive le mois et l'année ;
- « Oui » fait apparaître le type de revenus ;
- « Moins de 5 000 € » fait apparaître le montant précis ;
- LOA ou LLD fait apparaître km / an et la durée.

Bug du prototype à ne pas reproduire : le bloc km / durée ne se referme jamais.

## 6. Méthode, livrables et arrêt
- Avant d'écrire dans Figma, charge les skills `figma:figma-use` (obligatoire avant tout `use_figma`) et `figma:figma-generate-design`. Pour les nouveaux composants du DS, charge aussi `figma:figma-generate-library`.
- **Police** : Neue Haas ne se charge pas via `use_figma`. Crée le texte en Inter avec les métriques du style, applique `setTextStyleIdAsync` en dernier, avec une largeur fixe, et ne modifie plus le texte ensuite.
- Ajoute dans la section une frame « Guide » qui contient :
  - le nom recommandé pour le sélecteur ;
  - la logique conditionnelle ;
  - les questions ouvertes du §7.
- Termine en me donnant :
  - les captures de chaque piste (`get_screenshot`) ;
  - la liste des node IDs créés ;
  - ta recommandation.
- Ensuite, **arrête-toi**. Je validerai en écrivant « Garde la piste X ». Cela veut dire : ne laisser **que** X sur la page, supprimer les autres pistes et leurs mentions dans le Guide, et ne jamais supprimer ni déplacer la page.

## 7. Questions ouvertes à écrire dans le Guide (ne tranche pas seul)
1. Quel nom pour le sélecteur (voir §4) ?
2. L'email est-il obligatoire pour les pros ? (WhatsApp est leur canal principal.)
3. Le montant précis de l'apport : seulement sous 5 000 €, ou dès qu'il y a un apport ? Le commentaire du prototype dit « tout montant », son code dit « < 5 000 € » seulement.
4. Que veut dire la case « Contrat professionnel » ?
5. Clients suisses : formes juridiques CH, extrait RC, montants en CHF plutôt qu'en € ?
6. Consentement : mention (formulaire actuel) ou case obligatoire (prototype) ?
7. Faut-il retirer l'objet « (PRO) Je cherche un leasing / location longue durée » du menu Particulier, puisqu'il devient le parcours Pro ?
8. L'objet « Je souhaite louer un véhicule » (location courte durée) a disparu de Sanity, alors que la maquette mobile l'affiche encore : faut-il le remettre ?
9. Quel est le lien de la chaîne WhatsApp BORA Club pour l'écran de succès ?
