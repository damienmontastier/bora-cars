# Refonte page Contact : parcours Demande générale / Leasing professionnel (phase 2 : implémentation)

> Le client a répondu à toutes les questions. Il ne reste qu'un `[À CONFIRMER]`, qui a une valeur par défaut.

## Règle d'or
**Le prototype du client `bora_test_form/index.html` fait foi** : ses étapes, ses champs, leur ordre, ses listes, ses libellés, ses textes et sa logique conditionnelle. Les seuls écarts sont ceux listés ci-dessous, et le client les a validés le 18/09/2026. Si tu trouves autre chose d'illogique, **demande-moi** au lieu de trancher.

Lis le prototype sans ses blocs base64 :
`sed -E 's/base64,[A-Za-z0-9+\/=]{100,}/base64,<STRIPPED>/g' bora_test_form/index.html > <scratchpad>/form.html`

## Maquettes validées (Figma)
Fichier `JujmgSOaOw3qXqrAvlhp6y`, page « ✅  Contact » `459:15529`, section `3177:397` (piste A, parcours en étapes). Les maquettes ont été réalignées sur le prototype.

| Écran | Desktop | Mobile |
|---|---|---|
| 1 — Demande générale | `3178:396` | `3178:520` |
| 2 — (A) Vous | `3179:595` | `3179:750` |
| 3 — (B) Société | `3180:824` | `3180:963` |
| 4 — (C) Situation | `3180:1101` | `3180:1241` |
| 5 — (D) Projet | `3181:1368` | `3181:1553` |
| 6 — (E) Justificatifs | `3181:1735` | `3181:1884` |
| 7 — Erreur de validation | `3183:1984` | `3183:2084` |
| 8 — Succès | `3183:2179` | `3183:2251` |

- Le Guide de la page est la frame `3188:6581` : principe, logique conditionnelle, listes et écarts.
- Nouveaux composants du DS : page « ✅  DS » `430:3944`, frame « Form » `3170:761`.

  | Composant | Node ID |
  |---|---|
  | En-tête | `3170:762` |
  | Sélecteur de profil | `3172:765` |
  | Checkbox | `3170:765` |
  | ChoiceCard | `3171:763` |
  | Tabs(step) S | `3175:823` |
  | HelpNote | `3173:799` |
  | LinkCard | `3173:815` |
  | Motifs | `3176:871` |

  `Tabs(step)` `431:5440` a aussi été étendu.

## Ce qui a été décidé
**Page et sélecteur**
- Onglets « Demande générale » (Propriétaires · Autre) / « Leasing professionnel » (LOA · LLD pour votre société). En anglais : « General enquiry » / « Business leasing ». « Location » n'apparaît pas dans le sous-titre : le client a choisi de ne pas traiter la location depuis la page Contact.
- Demande générale = le formulaire actuel, inchangé.
- Le lien direct `/{fr|en}/contact?profil=pro` ouvre l'onglet pro. Il remplace la page privée que le client avait prototypée.
- Onglets des étapes terminées cliquables pour revenir en arrière : **[À CONFIRMER, défaut : oui]**.

**Parcours pro : 5 étapes, contenu du prototype**
- **Texte d'accueil** (colonne de gauche) : repris mot pour mot du prototype. Titre « Vous êtes professionnel et rencontrez des difficultés à obtenir un leasing, un financement ou un véhicule en longue durée ? », puis les deux paragraphes, avec « sous 48 heures ».
- **(A) Vous** :
  - Prénom*, Nom* ;
  - Ville* ;
  - Téléphone WhatsApp* (au moins 8 chiffres ; lettres filtrées à la saisie) ;
  - Email (facultatif ; format vérifié s'il est rempli) ;
  - Nom de la société*.

  Bouton « Commencer », pas de « Précédent ».
- **(B) Société** :
  - Forme juridique* (liste du prototype) ;
  - Date de création (mois + année, facultative) ou case « Société en cours de création », qui désactive et vide le mois et l'année ;
  - Domaine d'activité* ;
  - Chiffre d'affaires annuel* ;
  - Bilans comptables clôturés disponibles (optionnel).
- **(C) Situation** :
  - Revenus personnels Oui/Non. Oui → Type de revenus ; Non → masqué et vidé ;
  - **Apport disponible*** : Moins de 5 000 € / Plus de 5 000 € / Aucun (cartes empilées) ;
  - **Avez-vous déjà eu un refus de leasing (concession, banque) ?** Oui/Non.
- **(D) Projet** :
  - Usage prévu* ;
  - Je recherche (optionnel) : LOA / LLD. Un choix fait apparaître Kilomètres souhaités / an et Durée de financement ;
  - Je souhaite être conseillé (case) ;
  - Modèle(s) souhaité(s) (optionnel) ;
  - Nombre de véhicules (1 par défaut) ;
  - Budget mensuel envisagé (optionnel) ;
  - Délai (optionnel).
- **(E) Justificatifs** :
  - encart d'aide, affiché seulement si l'usage prévu est « Usage personnel (pour ma société) » ou « Les deux » ;
  - Documents disponibles (cases multiples) ;
  - Autre chose à nous dire ? (optionnel) ;
  - **case de consentement obligatoire** ;
  - bouton « Envoyer mon dossier » ;
  - note « Vos informations restent strictement confidentielles… ».
- **Succès** :
  - « Votre dossier a bien été reçu » ;
  - « Merci {prénom}. Notre équipe l'étudie et revient vers vous sous 48 h avec les solutions possibles. » ;
  - « En attendant, restons en contact » :
    - bouton principal « Restez connectés aux actualités leasing / En suivant notre chaîne WhatsApp ! » → `https://whatsapp.com/channel/0029VbDKVGIIt5ryo8uh4M1N` ;
    - bouton Instagram @bora.cars (sur mobile, ouverture de l'appli, sinon repli sur le web, comme dans le prototype).

**Listes (valeurs exactes)**

| Champ | Options |
|---|---|
| Forme juridique | Auto-entrepreneur / Micro-entreprise · Entreprise individuelle (EI) · EIRL · EURL · SARL · SASU · SAS · SA · Association · Autre |
| Chiffre d'affaires | Entre 0 et 50 000 € · Entre 50 000 et 100 000 € · Entre 100 000 et 500 000 € · Plus de 500 000 € |
| Bilans | 0 · 1 · 2 · 3 et + |
| Type de revenus | CDI · CDD · Intérim · Indépendant |
| Apport disponible | Moins de 5 000 € · Plus de 5 000 € · Aucun |
| Usage prévu | Usage personnel (pour ma société) · Sous-location · Les deux |
| Je recherche | Location avec option d'achat (LOA) · Location longue durée (LLD) |
| Durée | 3 ans · 4 ans · 5 ans et + |
| Délai | Urgent · Sous 1 mois · Flexible |
| Documents | Extrait KBIS (de moins de 3 mois) · Relevés de compte professionnel (12 derniers mois) · Pièce d'identité · Permis de conduire · Bail commercial · Dernier bilan comptable · Preuve sociale ou supports digitaux (site internet, réseaux sociaux…) |

**Écarts avec le prototype validés par le client**
- Les tranches de chiffre d'affaires ont été corrigées, car elles se chevauchaient.
- « Aucun » est retiré des types de revenus.
- L'apport est simplifié : 3 choix (Moins de 5 000 € · Plus de 5 000 € · Aucun), sans champ « Montant précis ».
- La case « Contrat professionnel » est **retirée**. Elle concerne les loueurs en location directe, pas ce formulaire.
- La question sur le refus de leasing est **ajoutée**.
- Le délai de réponse est de **48 h partout**.
- **France uniquement** : pas de société suisse, formes juridiques et Kbis français, montants en €, indicatif +33.
- La case de consentement mentionne la transmission aux partenaires. Texte exact : « J'accepte que BORA CARS conserve et utilise ces informations pour étudier mon dossier, le transmettre en toute confidentialité à ses partenaires (banques, loueurs) et me recontacter. Mes données ne sont jamais revendues ; je peux y accéder, les corriger ou les supprimer à tout moment — voir la politique de confidentialité. » Le lien pointe vers la page légale de confidentialité (`legal-slug`), pas vers `politique-confidentialite.html`.
- Sur l'écran de succès, le lien « Visiter notre site » est retiré (on y est déjà). Le pied de page du prototype n'est pas repris : le site a le sien.

**Autres décisions du client**
- **Le client rédige lui-même les textes.** Aucun texte du parcours pro ne doit être écrit en dur dans le code : tous doivent être modifiables dans le Studio (voir §2). « BORA Club » n'est pas affiché pour l'instant.
- L'objet « Je souhaite louer un véhicule » a été **retiré exprès** : la location ne passe pas par la page Contact. On ne le remet pas.
- L'objet « (PRO) Je cherche un leasing… » (`ea34c6eaf461`) est **retiré** du menu Demande générale au moment de la mise en ligne, puisque l'onglet pro le remplace.

## Règles
- Commence par lire les `CLAUDE.md` de la racine, de `web/` et de `studio/`, ainsi que ta mémoire projet. Évalue les skills comme le demande le `CLAUDE.md` global, en particulier :
  - `figma:figma-design-to-code` (obligatoire avant `get_design_context`) ;
  - `nuxtjs` ;
  - `vueuse-functions` ;
  - `gsap-frameworks` s'il y a des animations ;
  - `airtable-overview`.
- **Avant toute écriture dans Airtable ou dans Sanity (patch ou publication), montre-moi ce que tu vas faire et attends mon OK.** Le CRM Airtable est celui du client, en production.
- Pas de commit sans que je le demande.

## 1. Figma → composants
- Lance `get_design_context` sur les frames ci-dessus et sur les composants du DS. Si une maquette et le prototype se contredisent, c'est le prototype qui gagne (voir la règle d'or). Signale-moi l'écart.
- Réutilise les atomes existants : `AtomsFieldText`, `FieldPhone`, `FieldSelect`, `FieldTextarea`, `FieldCheckbox`, et le modèle de `AtomsCurrencyToggle` pour le sélecteur de profil.
- Ne crée un atome que pour un composant du DS qui n'a pas d'équivalent : choix en carte (radio ou case), mois + année, indicateur d'étape, encart d'aide, carte de lien. Respecte les conventions :
  - classes BEM `app-atoms-*` ;
  - `desktop-vw()` / `mobile-vw()` ;
  - `@include mobile`, `@include hover` ;
  - focus visible.
- Découpe `ElementsContactForm` pour qu'il ne devienne pas un fichier géant :
  - le conteneur garde le sélecteur, le honeypot, l'état d'envoi et le message de statut ;
  - chaque parcours a son propre composant ;
  - la logique partagée va dans un composable `useContactForm` si c'est utile.
- Garde le comportement actuel : validation au premier envoi puis revalidation à chaque saisie, focus sur le premier champ invalide, `aria-invalid`, `fieldset` / `legend` pour les groupes de choix.
- Parcours en étapes :
  - validation étape par étape ;
  - Entrée = « Continuer », sauf dans un textarea ;
  - retour en haut du formulaire via l'instance **Lenis** (pas `window.scrollTo`) ;
  - focus sur le premier champ de l'étape ;
  - un champ conditionnel masqué est vidé ;
  - changer d'onglet ne vide pas les réponses déjà saisies.
- **Lien direct `?profil=pro`** : en prod, `/contact` est **prérendu**, donc le HTML statique ne connaît pas la query. Lis la query côté client, après l'hydratation, pour éviter une erreur d'hydratation (vérifie la bonne pratique avec l'agent `nuxt-specialist`). Décide si changer d'onglet met à jour l'URL (`router.replace`).
- Ajoute ce lien aux CTA pros qui le justifient (pages `professionnel` et `catalogue-professionnel`), via `BaseLink` avec `{ name: 'contact', query: { profil: 'pro' } }`. Jamais de chemin en dur.

## 2. Sanity (contenus et textes d'interface)
- **Textes d'interface** (libellés, placeholders, erreurs, libellés des options, titres et sous-titres d'étapes, boutons, note de confidentialité, consentement) : dans le singleton `glossaire`, sous `contact.pro.*` et `contact.profile.*`, en **FR et EN**.
  - Le FR est celui du prototype. L'EN est à traduire.
  - Ajoute les clés par patch puis publie (après mon OK). Aucun JSON local.
- **Contenu éditorial** (texte d'accueil pro, textes de l'écran de succès, lien de la chaîne WhatsApp, libellés des boutons de liens) : ajoute des champs au singleton `contact` (`studio/schemaTypes/singletons/contact.ts`), avec les valeurs ci-dessus comme contenu initial. Mets ensuite à jour à la main la projection GROQ et l'interface `ContactData` dans `web/app/queries/contact.ts`.
- **Valeurs des options** : des constantes dans le code web, jamais modifiables depuis le Studio. Seuls leurs libellés sont traduits. Raison : l'API écrit dans Airtable avec `typecast: true`, donc une valeur inconnue crée une nouvelle option dans le CRM sans prévenir.
- **Textes modifiables par le client** : chaque texte visible du parcours pro doit se trouver soit dans `glossaire`, soit dans le singleton `contact`. Cela vaut pour le texte d'accueil, les titres et sous-titres d'étapes, les libellés, les placeholders, les options, l'encart d'aide, le consentement, la note de confidentialité, l'écran de succès et les liens. Regroupe ce qui relève de la page (accueil, succès, liens) dans le singleton `contact`, avec des descriptions claires en français pour le client (voir `studio/CLAUDE.md` pour le vocabulaire du Studio).
- **Objets du menu Demande générale** (`subjectOptions` du singleton `contact`) : retire `ea34c6eaf461` au moment de la mise en ligne, après mon OK. Ne recrée **pas** l'objet location courte durée. Objets actuels :

  | Clé | Objet |
  |---|---|
  | `ea34c6eaf461` | (PRO) Je cherche un leasing / location longue durée |
  | `596582a6e799` | Je suis propriétaire, je souhaite rentabiliser mon véhicule |
  | `ee37b0534b50` | Autre |

- **Cohérence du site** (après mon OK) : la description SEO de la page `professionnel` doit être corrigée sur deux points.
  - Elle annonce « Réponse sous 72h » → passer à 48 h.
  - Elle dit « Paris et Genève » en FR mais « France only » en EN → France uniquement.

## 3. API `web/server/api/contact.post.ts`
- Un seul endpoint, avec un payload à deux variantes selon `profile: 'particulier' | 'pro'`. Le parcours Demande générale ne change pas (son email reste obligatoire).
- Pour le parcours Pro :
  - valide les champs obligatoires et les longueurs ;
  - vérifie que la case de consentement est cochée ;
  - compare chaque valeur de liste à une **liste blanche**, puis convertis-la vers le **libellé exact de l'option Airtable** (une valeur inconnue ne doit jamais être envoyée) ;
  - vérifie les champs conditionnels côté serveur aussi.
- À réutiliser : le honeypot `website`, `createAirtableRecord` (qui retire un champ supprimé côté CRM au lieu de perdre le lead) et des logs d'erreur **sans données personnelles**.
- Correspondance vers les champs Airtable de la table Leads :

  | Donnée du formulaire | Champ Airtable |
  |---|---|
  | Prénom + Nom | `Nom complet` |
  | Téléphone WhatsApp | `Téléphone` |
  | Email | `Email` |
  | Nom de la société | `Société` |
  | Date de création (MM/AAAA), ou « En cours de création » | `Société créée le` |
  | LOA / LLD | `Type de financement` (options existantes `LOA` / `LLD`) |
  | Durée | `Durée (mois)` : 36 / 48 / 60 |
  | Kilomètres / an | `Km / an` (nombre extrait de la saisie libre) |
  | Budget mensuel | `Budget mensuel (€)` (nombre extrait) |
  | Modèle(s) souhaité(s) | `Véhicule (texte libre)` |
  | Refus de leasing = Oui | `Refusé en concession` = true |
  | Autre chose à nous dire ? | `Message` |

- Valeurs fixes pour un lead Pro :
  - `Type de lead` = `LLD PRO — Leasing société` ;
  - `Canal` = `Site web` ;
  - `Étape` = `Nouveau` ;
  - `Source` et `Statut` (anciens champs) remplis comme aujourd'hui ;
  - `Langue`, UTM et `Page d'origine` comme pour Demande générale ;
  - `Consentement RGPD` = valeur de la case.
- `LEAD_TYPE_BY_SUBJECT_KEY` : supprime la clé morte `88b02953258b` (objet location retiré exprès par le client) et l'entrée `ea34c6eaf461` une fois l'objet PRO retiré. Les leads pros sont typés par `profile: 'pro'`.
- Récapitulatif : écris aussi un récapitulatif lisible de tout le dossier dans un champ texte long, pour que le commercial voie tout dans l'email de notification. Propose : un nouveau champ `Récap dossier PRO`, ou le champ `Message`.
- Analytics : ajoute `profile` aux événements `trackContactFormSubmit`, `Success` et `Error` (`web/app/composables/useAnalytics.ts`), et mets à jour `docs/ANALYTICS.md` si les événements y sont listés.

## 4. Airtable : base `appzqdmWjxE1FkAer`, table `Leads` `tblRVnNijTcEInX7L`
L'ancienne table « Demandes de contact » a été **renommée** `Leads` et garde le même ID (celui que lit `NUXT_AIRTABLE_TABLE_ID`). Les interfaces « Demandes de contact » (`pbdiiPv19kfEeR7VA`) et « BORA CRM 📱 » (`pbdpVWqnPmjibG6hj`) lisent cette table.

**Le client a validé : on adapte Airtable au formulaire.** Relis d'abord le schéma avec `get_table_schema`, puis propose-moi le plan complet et attends mon OK.

- **Selects existants à adapter** :
  - `Forme juridique`, `CA société`, `Bilans disponibles` : ajoute les options exactes des listes ci-dessus.
  - Les anciennes options (SAS / SASU, < 50 k€, 2 bilans+, Sàrl (CH)…) ne sont supprimées que si aucun enregistrement ne les utilise. Vérifie avant de proposer la suppression.
- **Champs à créer** :
  - `Ville` ;
  - `Domaine d'activité` ;
  - `Revenus personnels` (select : Non · CDI · CDD · Intérim · Indépendant) ;
  - `Apport disponible` (select : Moins de 5 000 € · Plus de 5 000 € · Aucun) ;
  - `Usage prévu` (select) ;
  - `Nombre de véhicules` (number) ;
  - `Délai` (select) ;
  - `Souhaite être conseillé` (checkbox) ;
  - `Documents disponibles` (multi-select, liste du prototype) ;
  - le récapitulatif si c'est l'option choisie.
- **À ne pas faire** :
  - pas de champ `Contrat professionnel` ;
  - ne pas écrire dans `Documents reçus` : ce sont les pièces **reçues** par BORA, pas celles que le prospect déclare avoir ;
  - `Prénom` est une **formule** : on écrit `Nom complet` ;
  - `Apport / caution (€)` reste vide, puisqu'il n'y a plus de montant précis.
- **Vue** : crée une vue « 💼 Leads PRO » : filtre `Type de lead = LLD PRO — Leasing société`, colonnes pros visibles, kanban par `Étape` si c'est pertinent. Si le MCP le permet, ajoute aussi une page « Pro » dans l'interface « BORA CRM 📱 ». Sinon, donne-moi les étapes manuelles.
- **Automations** :
  - « 🔔 Nouveau lead - Notif commercial » (déployée) : propose d'ajouter le récapitulatif pro au corps de l'email.
  - Aucune automation n'écrit au client : l'email facultatif ne casse rien.
- **Test** : crée un seul lead de test depuis `develop` (après mon OK), vérifie chaque champ dans Airtable, puis supprime-le.
- **Documentation** : mets à jour `docs/AIRTABLE.md`, qui n'est plus à jour (nom de la table, automations, champs).

## 5. Vérifications
- `npm run lint`, `npm --prefix web run typecheck`, `npm --prefix studio run typecheck`.
- `npm run dev` : teste les deux onglets en FR et en EN, en desktop et en mobile, avec :
  - le lien direct `?profil=pro` ;
  - chaque champ conditionnel (affichage, masquage et remise à zéro de la valeur) ;
  - l'encart d'aide selon l'usage prévu ;
  - la case de consentement obligatoire ;
  - les erreurs de validation ;
  - l'écran de succès et ses liens ;
  - le honeypot.
- Validation serveur : fais des `curl` avec un payload pro invalide (champ manquant, valeur hors liste, consentement absent, parcours inconnu) → réponse 422 attendue.
- Compare avec le prototype et les maquettes (captures côte à côte).
- Termine par un résumé :
  - les fichiers modifiés ;
  - ce qui a été écrit dans Sanity et Airtable ;
  - ce qu'il reste à faire côté client :
    - publier ;
    - lancer la « Mise en ligne » pour reconstruire la prod ;
    - compléter la **politique de confidentialité** pour y mentionner la transmission des dossiers aux partenaires (banques, loueurs).
