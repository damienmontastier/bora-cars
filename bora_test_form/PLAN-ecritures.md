# Écritures Sanity + Airtable — parcours « Leasing professionnel » (à valider)

Préparé le 18/09/2026. **Rien n'a encore été écrit** dans Sanity ni dans Airtable.

---

## 1. Sanity — projet `xyw8hnp3`, dataset `production`

### 1.1 Glossaire (`glossaire`, onglet « Contact ») — 130 nouvelles entrées FR/EN

- Insertion par patch après la dernière entrée existante (`form_consent_after`), puis publication du document `glossaire`.
- Convention : `_key` = la clé avec `_` à la place des `.` (ex. `pro_steps_a_tab`).
- Le FR reprend le prototype mot pour mot (apostrophes typographiques du prototype). Le consentement suit le texte exact validé. L'EN est ma traduction.
- Aucune entrée existante n'est modifiée. L'onglet Demande générale continue d'utiliser `contact.form.*`. Le parcours pro réutilise `contact.form.errors.summary` (message récapitulatif d'erreur) et `contact.form.status.submitting` (« Envoi en cours… »).
- `pro.placeholders.email` contient « @ » : le code lit les placeholders bruts (sinon vue-i18n prend « @ » pour un lien vers un autre message).

| Clé (`contact.…`) | FR | EN |
|---|---|---|
| `profile.label` | Type de demande | Type of request |
| `profile.general.title` | Demande générale | General enquiry |
| `profile.general.subtitle` | Propriétaires · Autre | Owners · Other |
| `profile.pro.title` | Leasing professionnel | Business leasing |
| `profile.pro.subtitle` | LOA · LLD pour votre société | Lease-to-own · long-term lease for your company |
| `pro.steps.label` | Étapes du dossier | Application steps |
| `pro.steps.a.tab` | Vous | You |
| `pro.steps.a.title` | Faisons connaissance | Let’s get to know you |
| `pro.steps.a.subtitle` | On saura ainsi comment vous joindre. | So we know how to reach you. |
| `pro.steps.b.tab` | Société | Company |
| `pro.steps.b.title` | Quelques repères | A few key facts |
| `pro.steps.b.subtitle` | Pour cadrer les solutions envisageables. | To frame the possible solutions. |
| `pro.steps.c.tab` | Situation | Situation |
| `pro.steps.c.title` | Votre profil financier | Your financial profile |
| `pro.steps.c.subtitle` | Rien de définitif — juste pour mieux orienter. | Nothing binding — it just helps us guide you. |
| `pro.steps.d.tab` | Projet | Project |
| `pro.steps.d.title` | Le véhicule visé | The vehicle you want |
| `pro.steps.d.subtitle` | Dites-nous ce que vous avez en tête. | Tell us what you have in mind. |
| `pro.steps.e.tab` | Justificatifs | Documents |
| `pro.steps.e.title` | Presque terminé | Almost done |
| `pro.steps.e.subtitle` | Je dispose des documents suivants : | I have the following documents: |
| `pro.stepCounter` | Étape {current} / {total} | Step {current} / {total} |
| `pro.fields.firstName` | Prénom | First name |
| `pro.fields.lastName` | Nom | Last name |
| `pro.fields.city` | Ville | City |
| `pro.fields.phone` | Téléphone WhatsApp | WhatsApp number |
| `pro.fields.email` | Email (facultatif) | Email (optional) |
| `pro.fields.company` | Nom de la société | Company name |
| `pro.fields.legalForm` | Forme juridique | Legal form |
| `pro.fields.creationDate` | Date de création (mois & année) | Date of incorporation (month & year) |
| `pro.fields.creationMonth` | Mois | Month |
| `pro.fields.creationYear` | Année | Year |
| `pro.fields.creationPending` | Société en cours de création | Company being set up |
| `pro.fields.activity` | Domaine d’activité | Line of business |
| `pro.fields.revenue` | Chiffre d’affaires annuel | Annual revenue |
| `pro.fields.balanceSheets` | Bilans comptables clôturés disponibles (optionnel) | Closed annual accounts available (optional) |
| `pro.fields.hasIncome` | Avez-vous des revenus personnels à côté ? | Do you have personal income on the side? |
| `pro.fields.incomeType` | Type de revenus | Type of income |
| `pro.fields.deposit` | Apport disponible | Available down payment |
| `pro.fields.leaseRefused` | Avez-vous déjà eu un refus de leasing (concession, banque) ? | Have you ever been turned down for a lease (dealership, bank)? |
| `pro.fields.usage` | Usage prévu | Intended use |
| `pro.fields.financing` | Je recherche (optionnel) | I’m looking for (optional) |
| `pro.fields.mileage` | Kilomètres souhaités / an | Kilometres per year |
| `pro.fields.duration` | Durée de financement | Financing term |
| `pro.fields.wantsAdvice` | Je souhaite être conseillé | I’d like some advice |
| `pro.fields.models` | Modèle(s) souhaité(s) (optionnel) | Preferred model(s) (optional) |
| `pro.fields.vehicleCount` | Nombre de véhicules | Number of vehicles |
| `pro.fields.budget` | Budget mensuel envisagé (optionnel) | Planned monthly budget (optional) |
| `pro.fields.timeline` | Délai (optionnel) | Timeframe (optional) |
| `pro.fields.documents` | Documents disponibles (cochez ceux que vous avez) | Available documents (tick the ones you have) |
| `pro.fields.message` | Autre chose à nous dire ? (optionnel) | Anything else to tell us? (optional) |
| `pro.placeholders.firstName` | Alexandre | Alexandre |
| `pro.placeholders.lastName` | Durand | Durand |
| `pro.placeholders.city` | Paris, Lyon, Bordeaux… | Paris, Lyon, Bordeaux… |
| `pro.placeholders.phone` | +33 6 00 00 00 00 | +33 6 00 00 00 00 |
| `pro.placeholders.email` | vous@societe.com | you@company.com |
| `pro.placeholders.company` | Votre société | Your company |
| `pro.placeholders.activity` | VTC, BTP, conseil, e-commerce… | Ride-hailing, construction, consulting, e-commerce… |
| `pro.placeholders.mileage` | Ex. 20 000 km | E.g. 20,000 km |
| `pro.placeholders.models` | Ex. Mercedes GLC, BMW Série 3, Tesla Model Y… | E.g. Mercedes GLC, BMW 3 Series, Tesla Model Y… |
| `pro.placeholders.budget` | Ex. 800 €/mois | E.g. €800/month |
| `pro.placeholders.message` | Un contexte, une contrainte, une échéance… | Some context, a constraint, a deadline… |
| `pro.options.legalForm.micro` | Auto-entrepreneur / Micro-entreprise | Sole trader / Micro-enterprise |
| `pro.options.legalForm.ei` | Entreprise individuelle (EI) | Sole proprietorship (EI) |
| `pro.options.legalForm.eirl` | EIRL | EIRL |
| `pro.options.legalForm.eurl` | EURL | EURL |
| `pro.options.legalForm.sarl` | SARL | SARL |
| `pro.options.legalForm.sasu` | SASU | SASU |
| `pro.options.legalForm.sas` | SAS | SAS |
| `pro.options.legalForm.sa` | SA | SA |
| `pro.options.legalForm.association` | Association | Association |
| `pro.options.legalForm.autre` | Autre | Other |
| `pro.options.revenue.upTo50k` | Entre 0 et 50 000 € | Between €0 and €50,000 |
| `pro.options.revenue.from50kTo100k` | Entre 50 000 et 100 000 € | Between €50,000 and €100,000 |
| `pro.options.revenue.from100kTo500k` | Entre 100 000 et 500 000 € | Between €100,000 and €500,000 |
| `pro.options.revenue.over500k` | Plus de 500 000 € | Over €500,000 |
| `pro.options.balanceSheets.none` | 0 | 0 |
| `pro.options.balanceSheets.one` | 1 | 1 |
| `pro.options.balanceSheets.two` | 2 | 2 |
| `pro.options.balanceSheets.threePlus` | 3 et + | 3 or more |
| `pro.options.yesNo.yes` | Oui | Yes |
| `pro.options.yesNo.no` | Non | No |
| `pro.options.incomeType.cdi` | CDI | Permanent contract |
| `pro.options.incomeType.cdd` | CDD | Fixed-term contract |
| `pro.options.incomeType.interim` | Intérim | Temporary work |
| `pro.options.incomeType.independent` | Indépendant | Self-employed |
| `pro.options.deposit.under5k` | Moins de 5 000 € | Less than €5,000 |
| `pro.options.deposit.over5k` | Plus de 5 000 € | More than €5,000 |
| `pro.options.deposit.none` | Aucun | None |
| `pro.options.usage.personal` | Usage personnel (pour ma société) | Own use (for my company) |
| `pro.options.usage.sublet` | Sous-location | Subletting |
| `pro.options.usage.both` | Les deux | Both |
| `pro.options.financing.loa` | Location avec option d’achat (LOA) | Lease with purchase option (LOA) |
| `pro.options.financing.lld` | Location longue durée (LLD) | Long-term lease (LLD) |
| `pro.options.duration.y3` | 3 ans | 3 years |
| `pro.options.duration.y4` | 4 ans | 4 years |
| `pro.options.duration.y5plus` | 5 ans et + | 5 years or more |
| `pro.options.timeline.urgent` | Urgent | Urgent |
| `pro.options.timeline.withinMonth` | Sous 1 mois | Within a month |
| `pro.options.timeline.flexible` | Flexible | Flexible |
| `pro.options.documents.kbis` | Extrait KBIS (de moins de 3 mois) | Kbis extract (less than 3 months old) |
| `pro.options.documents.bankStatements` | Relevés de compte professionnel (12 derniers mois) | Business bank statements (last 12 months) |
| `pro.options.documents.id` | Pièce d’identité | ID document |
| `pro.options.documents.license` | Permis de conduire | Driving licence |
| `pro.options.documents.lease` | Bail commercial | Commercial lease |
| `pro.options.documents.balanceSheet` | Dernier bilan comptable | Latest annual accounts |
| `pro.options.documents.socialProof` | Preuve sociale ou supports digitaux | Social proof or online presence |
| `pro.options.documents.socialProofHint` | (site internet, réseaux sociaux…) | (website, social media…) |
| `pro.documentsHint` | Ces pièces accélèrent l’étude d’une solution de financement adaptée. Cochez ce que vous avez déjà — rien n’est bloquant. | These documents speed up the search for a suitable financing solution. Tick what you already have — nothing is mandatory. |
| `pro.consent.before` | J'accepte que BORA CARS conserve et utilise ces informations pour étudier mon dossier, le transmettre en toute confidentialité à ses partenaires (banques, loueurs) et me recontacter. Mes données ne sont jamais revendues ; je peux y accéder, les corriger ou les supprimer à tout moment — voir la  | I agree that BORA CARS may keep and use this information to review my application, share it in strict confidence with its partners (banks, leasing companies) and get back to me. My data is never sold; I can access, correct or delete it at any time — see the  |
| `pro.consent.linkLabel` | politique de confidentialité | privacy policy |
| `pro.consent.after` | . | . |
| `pro.actions.start` | Commencer | Start |
| `pro.actions.next` | Continuer | Continue |
| `pro.actions.back` | Précédent | Back |
| `pro.actions.submit` | Envoyer mon dossier | Send my application |
| `pro.note` | Vos informations restent strictement confidentielles et ne servent qu’à l’étude de votre dossier. | Your information remains strictly confidential and is only used to review your application. |
| `pro.errors.firstName` | Merci d’indiquer votre prénom. | Please enter your first name. |
| `pro.errors.lastName` | Merci d’indiquer votre nom. | Please enter your last name. |
| `pro.errors.city` | Merci d’indiquer votre ville. | Please enter your city. |
| `pro.errors.phone` | Merci d’indiquer un numéro valide (chiffres uniquement, au moins 8). | Please enter a valid number (digits only, at least 8). |
| `pro.errors.email` | Format d’email invalide. | Invalid email format. |
| `pro.errors.company` | Merci d’indiquer le nom de votre société. | Please enter your company name. |
| `pro.errors.legalForm` | Merci de sélectionner une forme juridique. | Please select a legal form. |
| `pro.errors.activity` | Merci d’indiquer votre domaine d’activité. | Please enter your line of business. |
| `pro.errors.revenue` | Merci de sélectionner une tranche. | Please select a range. |
| `pro.errors.deposit` | Merci de sélectionner une option. | Please select an option. |
| `pro.errors.usage` | Merci de préciser l’usage prévu. | Please specify the intended use. |
| `pro.errors.consent` | Merci de cocher cette case pour envoyer votre dossier. | Please tick this box to send your application. |
| `pro.status.error` | Une erreur est survenue à l’envoi. Vérifiez votre connexion et réessayez dans un instant. | Something went wrong while sending. Check your connection and try again in a moment. |

### 1.2 Singleton `contact` — nouveaux champs (onglet « Leasing professionnel » du Studio)

| Champ | FR | EN |
|---|---|---|
| `proIntro.heading` | Vous êtes professionnel et rencontrez des difficultés à obtenir un leasing, un financement ou un véhicule en longue durée ? | Are you a business struggling to get a lease, financing or a long-term vehicle? |
| `proIntro.lead` | Ici, on qualifie d’abord votre situation — puis on vous apporte la solution. | Here, we assess your situation first — then we bring you the solution. |
| `proIntro.text` | Décrivez-nous votre projet en 2 minutes. Notre équipe étudie votre dossier et revient vers vous sous 48 heures avec les solutions possibles. | Tell us about your project in 2 minutes. Our team reviews your application and gets back to you within 48 hours with the possible solutions. |
| `proSuccess.kicker` | Dossier envoyé | Application sent |
| `proSuccess.title` | Votre dossier a bien été reçu | We’ve received your application |
| `proSuccess.text` | Merci {prenom}. Notre équipe l’étudie et revient vers vous sous 48 h avec les solutions possibles. | Thank you {prenom}. Our team is reviewing it and will get back to you within 48 hours with the possible solutions. |
| `proSuccess.linksTitle` | En attendant, restons en contact | In the meantime, let’s stay in touch |
| `proSuccess.whatsapp.title` | Restez connectés aux actualités leasing | Stay up to date with leasing news |
| `proSuccess.whatsapp.subtitle` | En suivant notre chaîne WhatsApp ! | By following our WhatsApp channel! |
| `proSuccess.whatsapp.url` | https://whatsapp.com/channel/0029VbDKVGIIt5ryo8uh4M1N | (même lien) |
| `proSuccess.instagram.title` | Nous suivre sur Instagram | Follow us on Instagram |
| `proSuccess.instagram.subtitle` | @bora.cars | @bora.cars |
| `proSuccess.instagram.url` | https://www.instagram.com/bora.cars/ (celle des réseaux déjà utilisée par le site) | (même lien) |

Patch puis publication du document `contact`. Les autres champs ne changent pas.

### 1.3 Singleton `professionnel` — description SEO

| | Avant | Après |
|---|---|---|
| FR | … Sans bilan exigé. Réponse sous 72h. Paris et Genève. | … Sans bilan exigé. Réponse sous 48h. France uniquement. |
| EN | … No balance sheet required. Response within 72h. France only. | … No balance sheet required. Response within 48h. France only. |

Patch de `seo.description`, puis publication. En prod, le changement n'apparaît qu'après une mise en ligne.

### 1.4 À la mise en ligne seulement : objets du menu Demande générale

- Retrait de `ea34c6eaf461` « (PRO) Je cherche un leasing / location longue durée (LOA / LLD) » dans `contact.subjectOptions`, puis publication.
- Dans le même lot, retrait de l'entrée `ea34c6eaf461` de `LEAD_TYPE_BY_SUBJECT_KEY` dans l'API. La clé morte `88b02953258b` est déjà retirée.

---

## 2. Airtable — base `appzqdmWjxE1FkAer`, table `Leads` (`tblRVnNijTcEInX7L`)

### 2.1 Champs à créer (`create_field`)

| Champ | Type | Options exactes |
|---|---|---|
| `Ville` | Texte | — |
| `Domaine d'activité` | Texte | — |
| `Revenus personnels` | Sélection unique | Non · CDI · CDD · Intérim · Indépendant |
| `Apport disponible` | Sélection unique | Moins de 5 000 € · Plus de 5 000 € · Aucun |
| `Usage prévu` | Sélection unique | Usage personnel (pour ma société) · Sous-location · Les deux |
| `Nombre de véhicules` | Nombre (entier) | — |
| `Délai` | Sélection unique | Urgent · Sous 1 mois · Flexible |
| `Souhaite être conseillé` | Case à cocher | — |
| `Documents disponibles` | Sélection multiple | Extrait KBIS (de moins de 3 mois) · Relevés de compte professionnel (12 derniers mois) · Pièce d'identité · Permis de conduire · Bail commercial · Dernier bilan comptable · Preuve sociale ou supports digitaux (site internet, réseaux sociaux…) |
| `Récap dossier PRO` | Texte long | Récapitulatif lisible de tout le dossier, écrit par le site |

Chaque champ reçoit une description en français. Exemple pour `Documents disponibles` : « Pièces que le prospect DÉCLARE avoir. À ne pas confondre avec Documents reçus. »

### 2.2 Selects existants : ajout des options exactes

| Champ | Options à ajouter | Anciennes options (0 enregistrement, vérifié) |
|---|---|---|
| `Forme juridique` | Auto-entrepreneur / Micro-entreprise · Entreprise individuelle (EI) · EIRL · EURL · SARL · SASU · SAS · SA · Association (« Autre » existe déjà) | SAS / SASU · SARL / EURL · Micro-entreprise · Sàrl (CH) · SA (CH) · En cours de création |
| `CA société` | Entre 0 et 50 000 € · Entre 50 000 et 100 000 € · Entre 100 000 et 500 000 € · Plus de 500 000 € | < 50 k€ · 50–150 k€ · 150–500 k€ · > 500 k€ · Pas encore de CA |
| `Bilans disponibles` | 0 · 1 · 2 · 3 et + | Aucun · 1 bilan · 2 bilans+ |
| `Type de demande` (si validé, cf. question 2) | Leasing professionnel | — |

**Limite du MCP :** `update_field` ne modifie que le nom et la description d'un champ. Il ne peut ni ajouter ni supprimer d'options.

- **Ajout :** je crée les options par *typecast* (le mécanisme que l'API utilise déjà).
  - D'abord, le lead de test (§ 2.5) crée les valeurs qu'il utilise.
  - Ensuite, je mets à jour ce même enregistrement de test, une valeur à la fois, pour créer les options restantes. Une mise à jour ne déclenche pas l'automation de création.
  - Enfin, je supprime l'enregistrement de test.
- **Suppression des anciennes options :** à faire à la main dans Airtable, en 2 minutes.
  - Clic droit sur l'en-tête du champ → « Modifier le champ » → croix à droite de chaque ancienne option → « Enregistrer ».

### 2.3 Vue « 💼 Leads PRO » + page d'interface

- **Page d'interface « 💼 Leads PRO »** dans « BORA CRM 📱 » (`create_page`, faisable avec le MCP) :
  - kanban par `Étape` ;
  - portée limitée à `Type de lead = LLD PRO — Leasing société` ;
  - cartes : Nom complet, 🔥 Priorité, Société, Usage prévu, Apport disponible, Type de financement, Date de création.
  - ⚠ Pour qu'elle apparaisse côté utilisateurs, il faut publier l'interface (`publish_interface`), ce qui publie aussi **tous les brouillons en cours** de « BORA CRM 📱 ». Je ne le fais qu'avec votre accord ; sinon, publication à la main.
- **Vue de table « 💼 Leads PRO »** : le MCP ne sait pas créer de vue. Étapes à la main :
  1. Table `Leads` → « + Créer » (en bas à gauche) → Kanban → nom « 💼 Leads PRO ».
  2. Empiler par `Étape`.
  3. Filtre : `Type de lead` est `LLD PRO — Leasing société`.
  4. Champs visibles : Nom complet, Téléphone, Ville, Société, Forme juridique, CA société, Apport disponible, Usage prévu, Type de financement, Délai, 🔥 Priorité, Récap dossier PRO.

### 2.4 Automation « 🔔 Nouveau lead - Notif commercial »

- **Proposition :** ajouter au corps de l'email, après « Message », les lignes suivantes (vides pour une Demande générale) :
  - `🏷️ Type de lead : {Type de lead}`
  - `📋 Récap dossier PRO : {Récap dossier PRO}`
- Avec « Type de demande = Leasing professionnel », l'objet de l'email devient « 🔔 Nouveau lead : Alexandre Durand — Leasing professionnel ».
- `update_automation` modifie le **brouillon** de l'automation. Il faut ensuite cliquer « Update » dans Airtable pour que la version déployée change.
- Aucune automation n'écrit au prospect : l'email facultatif ne casse rien.

### 2.5 Test

- Un seul lead de test, envoyé depuis le formulaire en local (branche `develop`, serveur de dev branché sur la table de prod).
- Nom : « TEST — Claude (à supprimer) ». Dossier complet : LLD, documents cochés, date de création, etc.
- ⚠ Il déclenche **une fois** l'email de notification au commercial (boramotioncars@gmail.com).
- Je vérifie chaque champ dans Airtable, je crée les options restantes (§ 2.2) sur ce même enregistrement, puis je le supprime.

### 2.6 Documentation

Mise à jour de `docs/AIRTABLE.md` : table `Leads`, champs, parcours pro, automations réelles, vue et page PRO.
