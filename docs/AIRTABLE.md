# Airtable — Intégration & roadmap

Documentation de l'intégration Airtable du site `bora-cars.com` avec le CRM du client.

---

## 🔌 Setup actuel (MàJ 2026-09-18)

### Base & table cibles

| Élément | Valeur |
|---|---|
| Base | `BORA CARS - CRM Parc Automobile` (`appzqdmWjxE1FkAer`) |
| Table | **`Leads`** (`tblRVnNijTcEInX7L`). C'est l'ancienne « Demandes de contact », renommée par le client ; elle a gardé le même ID, celui lu par `NUXT_AIRTABLE_TABLE_ID`. |
| Endpoint | `POST /api/contact` (Nitro, `web/server/api/contact.post.ts`) |
| Interfaces qui lisent la table | « Demandes de contact » (`pbdiiPv19kfEeR7VA`, Record review), « BORA CRM 📱 » (`pbdpVWqnPmjibG6hj` : Pipeline, Aujourd'hui, Chiffres, 💼 Leads PRO…) |

La table est la source de vérité de **tous** les leads (site, WhatsApp, Instagram, Google, apporteurs…). Le site n'en alimente qu'une partie.

### Authentification

- **Personal Access Token (PAT)** scopé `data.records:write` (+ optionnel `data.records:read`) sur la base CRM uniquement
- Stocké dans `runtimeConfig.airtableToken` (privé, jamais côté client)
- Env vars : `NUXT_AIRTABLE_TOKEN`, `NUXT_AIRTABLE_BASE_ID`, `NUXT_AIRTABLE_TABLE_ID`
- En prod (Netlify) : variables à set dans le dashboard Netlify avec **"Contains secret values"** activé pour le TOKEN

### Rendu

Preset Nitro `netlify` sur les deux branches (jamais `netlify_static`) : `/api/contact` est une Netlify Function, en prod (pages prérendues) comme sur develop (SSR). Cf. `web/CLAUDE.md`.

### Robustesse de l'écriture

- `typecast: true` : Airtable crée à la volée une option de liste inconnue. **Toute valeur de liste envoyée par le site est donc d'abord vérifiée contre une liste blanche**, puis convertie en libellé exact :
  - l'objet de la Demande générale est comparé aux options du singleton Sanity `contact` (`resolveSubject`) ;
  - les choix du Leasing pro sont comparés aux options de la config Sanity `contact.proForm` (relue à chaque envoi) ; une valeur inconnue est ignorée.
- Une colonne refusée par Airtable (`UNKNOWN_FIELD_NAME`, `INVALID_VALUE_FOR_COLUMN`) est retirée et l'écriture rejouée. Pour un dossier pro, toute autre erreur 422 déclenche un dernier essai avec les seules colonnes essentielles (nom, téléphone, email, consentement, récap, type de demande/lead, champs communs).
- `createAirtableRecord` (`web/server/utils/airtable.ts`) : si un champ a été renommé ou supprimé côté CRM, il est retiré et l'écriture est rejouée. **Le lead n'est jamais perdu** ; un `console.warn` liste les champs abandonnés.
- Les logs d'erreur ne contiennent que les **noms** de champs, jamais les valeurs (données personnelles).

---

## 🧭 Deux parcours sur la page Contact

Payload `profile: 'general' | 'pro'` : absent = `general` (payload historique), inconnu = 422.

| Parcours | Onglet | Où dans le code |
|---|---|---|
| `general` | « Demande générale » (Propriétaires · Autre) : le formulaire historique | `ElementsContactFormGeneral`, `generalFields()` |
| `pro` | « Leasing professionnel » (LOA · LLD pour votre société) : 5 étapes, reprises du prototype client | `ElementsContactFormPro`, `server/utils/contactPro.ts` |

Lien direct : `/{fr|en}/contact?profil=pro`.

### Champs communs (les deux parcours)

| Champ | Valeur |
|---|---|
| `Langue` | `FR` / `EN` |
| `Canal` | `Site web` |
| `Étape` | `Nouveau` |
| `Source` / `Statut` | `Site web` / `Nouveau` (anciens champs, encore lus par des vues ou automations) |
| `Page d'origine` | URL de la page au moment de l'envoi |
| `UTM source` / `UTM medium` / `UTM campaign` | 1er touch de la session (sessionStorage) |

### Demande générale

| Champ | Source |
|---|---|
| `Nom complet` | `firstName + lastName` |
| `Email` | obligatoire |
| `Téléphone` | ≥ 8 chiffres |
| `Message` | obligatoire |
| `Type de demande` | libellé FR de l'objet choisi (options Sanity) ; `Autre` sinon |
| `Type de lead` | selon l'objet (`LEAD_TYPE_BY_SUBJECT_KEY`) ; pas d'objet propriétaire, FLOW ou FLEX se décide avec le propriétaire |
| `Consentement RGPD` | `true` (mention visible sous le bouton) |
| `Opt-in newsletter` | case du formulaire |

### Leasing professionnel

Valeurs fixes : `Type de lead` = `LLD PRO — Leasing société`, `Type de demande` = `Leasing professionnel`.

**Le formulaire se construit dans Sanity** (Contact → onglet « Leasing professionnel » → Formulaire). Pour chaque champ, le client peut indiquer une **Colonne Airtable** (nom exact) ; pour chaque choix, une **Valeur envoyée à Airtable** si l'option Airtable diffère du libellé FR. **Toutes** les réponses vont dans `Récap dossier PRO`, avec ou sans colonne. Toujours écrits par le site, quelle que soit la config : `Nom complet`, `Téléphone`, `Email` (s'il est rempli), `Consentement RGPD`, `Récap dossier PRO`.

Config livrée (reprise à l'identique de l'ancien formulaire codé en dur, migration `studio/migrations/seed-contact-pro-form`) :

| Donnée du formulaire | Champ Airtable | Remarque |
|---|---|---|
| Prénom + Nom | `Nom complet` | `Prénom` est une formule |
| Ville | `Ville` | |
| Téléphone WhatsApp | `Téléphone` | ≥ 8 chiffres |
| Email (facultatif) | `Email` | écrit seulement s'il est rempli |
| Nom de la société | `Société` | |
| Forme juridique | `Forme juridique` | Auto-entrepreneur / Micro-entreprise · Entreprise individuelle (EI) · EIRL · EURL · SARL · SASU · SAS · SA · Association · Autre |
| Date de création | `Société créée le` | `MM/AAAA`, ou `En cours de création` |
| Domaine d'activité | `Domaine d'activité` | |
| Chiffre d'affaires | `CA société` | Entre 0 et 50 000 € · Entre 50 000 et 100 000 € · Entre 100 000 et 500 000 € · Plus de 500 000 € |
| Bilans clôturés | `Bilans disponibles` | 0 · 1 · 2 · 3 et + |
| Revenus personnels | `Revenus personnels` | Oui/Non (format texte) puis type de revenus sur la même colonne : `Non`, CDI · CDD · Intérim · Indépendant ; `Oui` si « Oui » sans type |
| Apport disponible | `Apport disponible` | Moins de 5 000 € · Plus de 5 000 € · Aucun (`Apport / caution (€)` reste vide) |
| Refus de leasing | `Refusé en concession` | case cochée si « Oui » (rien d'écrit sans réponse) |
| Usage prévu | `Usage prévu` | Usage personnel (pour ma société) · Sous-location · Les deux |
| LOA / LLD | `Type de financement` | `LOA` / `LLD` |
| Kilomètres / an | `Km / an` | 1er nombre de la saisie libre (« 20 000 km » → 20000) |
| Durée | `Durée (mois)` | 36 / 48 / 60 |
| Je souhaite être conseillé | `Souhaite être conseillé` | |
| Modèle(s) souhaité(s) | `Véhicule (texte libre)` | |
| Nombre de véhicules | `Nombre de véhicules` | pré-rempli à 1 |
| Budget mensuel | `Budget mensuel (€)` | 1er nombre de la saisie libre |
| Délai | `Délai` | Urgent · Sous 1 mois · Flexible |
| Documents disponibles | `Documents disponibles` | pièces **déclarées** ; ne jamais écrire dans `Documents reçus` (pièces reçues par BORA) |
| Autre chose à nous dire ? | `Message` | |
| Tout le dossier | `Récap dossier PRO` | texte lisible, repris dans l'email de notification |
| Case de consentement (obligatoire) | `Consentement RGPD` | le serveur refuse le dossier sans elle |

**Ajouter un choix dans Sanity = une nouvelle option créée dans Airtable** (`typecast`), au nom de sa « Valeur envoyée à Airtable » (ou de son libellé FR). Renommer un choix change ce qui est envoyé : renseigner « Valeur envoyée à Airtable » pour garder l'option existante. Si plusieurs champs visent la même colonne, le dernier champ rempli l'emporte.

**Champs conditionnels vérifiés côté serveur :** l'API rejoue les conditions « Afficher seulement si… » de la config publiée ; la réponse d'un champ masqué est ignorée et jamais écrite. Le dossier n'est pas refusé pour autant (on ne perd pas un lead à cause d'un bug du site).

---

## 🖥️ Interfaces & vues

- **« Demandes de contact »** (`pbdiiPv19kfEeR7VA`) : Record review historique, avec le bouton `📞 +1 contact`.
- **« BORA CRM 📱 »** (`pbdpVWqnPmjibG6hj`) :
  - pages Chiffres, Pipeline, Aujourd'hui, ➕ Nouvelle location, Projets, ✅ À faire, 💶 Comptabilité ;
  - **💼 Leads PRO** (`pagnNmyTqNqkbNxyP`, créée le 2026-09-18) : kanban par `Étape`, limité à `Type de lead = LLD PRO — Leasing société`. Elle reste en brouillon tant que l'interface n'a pas été publiée.
- **Vues de la table** : 🗂️ Toutes les demandes, À traiter, Relances aujourd'hui, Hot leads, Perdus — analyse, Pipeline.
  - Vue « 💼 Leads PRO » à créer à la main : Kanban, empilé par `Étape`, filtre `Type de lead` = `LLD PRO — Leasing société`.

---

## 🤖 Automations (état au 2026-09-18)

| Automation | Statut | Rôle |
|---|---|---|
| 🔔 Nouveau lead - Notif commercial | déployée | Création d'un lead → email à `boramotioncars@gmail.com`. Objet : `🔔 Nouveau lead : {Nom complet} — {Type de demande}`. Corps : nom, email, téléphone, type de demande, **type de lead**, langue, message, **Récap dossier PRO**, page d'origine, lien Airtable. Les ajouts du 2026-09-18 sont dans le **brouillon** : cliquer « Update » dans Airtable pour les déployer. |
| ⏱️ Auto-fill Date 1er contact | déployée | `Statut = Contacté` et `Date dernier contact` vide → remplit la date |
| 📞 +1 contact (bouton) | déployée | Bouton d'interface : 1er contact ou relance |
| 🔔 Lead urgent → notification iPhone | non déployée | Assigne le lead (push iOS) + email de secours |
| ☀️ Brief du matin — leads à relancer | non déployée | Email quotidien 8 h |
| ✍️ Nouveau lead → tâche de relance | non déployée | Crée une tâche « Contacter » |

**Aucune automation n'écrit au prospect.** L'ancienne réponse automatique au client n'existe plus, donc l'email facultatif du parcours pro ne casse rien.

---

## 🧪 Tester sans polluer le CRM

- Les requêtes invalides (422) et le honeypot (`website` rempli → 200 sans écriture) ne créent rien.
- Un envoi valide depuis `npm run dev` écrit **dans la table de prod** et déclenche l'email de notification. Nommer le lead « TEST … (à supprimer) », puis le supprimer.
- Pour tester l'interface sans écrire, intercepter `/api/contact` dans le navigateur (Playwright `page.route`).

---

## 🛡️ Sécurité

- ✅ **Honeypot** : champ caché `website` dans le form, le serveur rejette silencieusement si rempli (anti-bot)
- ✅ **Validation côté serveur** : regex email, longueur des champs (mêmes limites que les `maxlength` du formulaire, `CONTACT_MAX_LENGTH`), champs requis, listes blanches des valeurs de listes (parcours pro), case de consentement obligatoire (parcours pro)
- ✅ **Consentement RGPD** : posé par l'API uniquement (Demande générale : mention visible ; Leasing pro : case obligatoire, qui mentionne la transmission aux partenaires)
- 🟡 **Rate limiting** : pas implémenté (Netlify Functions ont une protection basique)
- 🟡 **Cloudflare Turnstile** : pas implémenté (à ajouter si le spam passe le honeypot)
- ❌ **Field permissions API-only** : non dispo (requiert plan Business). Workaround possible via automation "lock" (voir roadmap item 8)

---

## 🌐 Workflows existants dans la base (référence cross-tables)

À garder en tête pour cohérence :

**`Réservations.Statut de réservation`** : `Disponible` → `En cours de location` → `Terminé` / `Annulée`

**`Dossiers de leasing`** (2 dimensions) :
- `Statut` (high-level) : `NOUVEAU` → `EN COURS` → `CONCLU`
- `Étape Kanban` (funnel détaillé) : `R1 - Premier contact` → `Dossier reçu` → `Dossier déposé` → `Acceptation` → `Livraison` → `Terminé`

→ **Aucun champ "devis" (Attachment PDF) n'existe pour l'instant** ailleurs dans la base.

---

## ⚠️ Limitations Free plan rencontrées

| Feature | Status | Workaround utilisé |
|---|---|---|
| Conditional visibility (Interface elements) | 💰 Business plan | Logique conditionnelle dans l'automation (gratuit) |
| Field permissions "API-only" | 💰 Business plan | Skip (acceptable au stade actuel) |
| `Run script` action (Automations) | 💰 Team plan | Helper formula field `_NextCount` pour l'incrément |
| Update record button dynamic value (Interface) | Static seulement | Bouton trigger une automation, qui elle accepte les valeurs dynamiques |
| `CHAR()` function | N/A en Airtable | Concaténation simple sans retour à la ligne |

---

## 🗺️ Roadmap (historique, table alors nommée « Demandes de contact »)

### ✅ Fait

- [x] Connexion form Nuxt → Airtable (POST /api/contact)
- [x] Honeypot anti-spam
- [x] UTM tracking (sessionStorage 1er touch)
- [x] Mention + checkbox RGPD/newsletter
- [x] Schéma complet de la table avec champs CRM
- [x] 4 automations (notif, auto-reply, init Statut→Contacté, +1 contact bouton)
- [x] Interface "Demandes de contact" avec bouton +1
- [x] Helper field `_NextCount` pour l'incrément

### 🟡 En cours / à faire prochainement

- [ ] **E. Créer les 5 vues Airtable** (À traiter, Relances aujourd'hui, Hot leads, Pipeline, Perdus — analyse)
- [ ] **F. Déploiement Netlify** : env vars + push develop → tester `develop.boracars.com/contact` → merger main
- [ ] **G. Ménage Airtable** : delete champs inutiles (`Assigné à`, `Sujet (formulaire)`, `Lien WhatsApp`, et selon décision : `Véhicule d'intérêt`, `Date début/fin souhaitée`, `Lieu de prise en charge`, `Pays`)

### 🟢 Optionnel — plus tard selon volume / besoin

#### Champs & formules supplémentaires sur `Demandes de contact`

- [ ] **Champ formule `⏱️ Temps de réaction (h)`** : `DATETIME_DIFF({Date dernier contact}, {Date de création}, 'hours')` → mesure le SLA temps de réponse, alimente le reporting
- [ ] **Réactiver/utiliser le champ `Véhicule d'intérêt`** : link vers `Véhicules`, alimenté manuellement par le commercial pour tracker quelles voitures sont les + sollicitées (puis rollup possible côté Véhicules)
- [ ] **Vue `🏡 Mises en gestion`** : filtre `Type de demande = Mise en gestion` → pipeline propriétaires si volume justifie

#### Boutons Interface supplémentaires (workflow commercial)

- [ ] **Bouton "Convertir en Réservation"** (Interface) : sur une demande `Type=Location` et `Statut=Confirmé`, crée auto un record dans `Réservations` avec les infos pré-remplies (Client = Nom complet) + lien auto entre les 2 records
- [ ] **Bouton "Convertir en Dossier de leasing"** : idem pour Type=Leasing → crée dans `Dossiers de leasing`
- [ ] **Bouton "Convertir en Propriétaire"** : idem pour Type=Mise en gestion → crée dans `Propriétaires`
- [ ] **Bouton "📧 Email avec template"** : ouvre le client mail avec `mailto:` + sujet et body pré-remplis selon le `Type de demande` (devis, refus, relance…) → le commercial relit/ajuste/envoie. Pas voué à être envoyé sans relecture, juste un gain de temps de rédaction

#### Automations cross-tables

- [ ] **Auto-update Statut quand conversion détectée** : trigger quand `Réservation liée`/`Dossier de leasing lié`/`Propriétaire lié` devient non-vide → passer `Statut = Confirmé` (puis `Traité` quand la réservation est terminée)
- [ ] **Notif "Demande convertie 🎉"** : quand une demande passe à `Traité` → email/Slack au commercial avec le montant CA généré (rollup) → motivation + reporting
- [ ] **H. SLA Alert Hot lead** : re-notif si `Probabilité=Hot` et pas traité >2h
- [ ] **I. Auto-archive leads inactifs >60j** : passer auto en `Perdu/No-show`
- [ ] **J. Digest matin quotidien** : email 9h avec compteurs (nouveaux / relances / hot)
- [ ] **K. Workflow conversion demande → Réservation/Leasing** (couvert par les boutons Convertir ci-dessus)
- [ ] **L. Webhook newsletter → Brevo/Mailchimp** : quand `Opt-in newsletter=true`
- [ ] **M. Détection doublons** : notif si même email déjà présent (= client récurrent VIP)
- [ ] **R. Lock RGPD via automation** : workaround Business plan (re-coche auto si décochée manuellement)

#### Vision globale du space Airtable

- [ ] **Dashboard Interface "Pipeline commercial"** : big numbers (nouveaux/mois, convertis/mois, taux conversion, CA pipeline), charts par source UTM, par Type de demande, par voiture sollicitée
- [ ] **Calendrier unifié cross-tables** : vue croisant relances commerciales + débuts/fins de réservations + interventions maintenance
- [ ] **Workflow "Réservation terminée → demande d'avis"** : trigger quand `Statut de réservation = Terminé` → email auto au client pour avis Google / NPS interne
- [ ] **Auto-création de tâches commerciales** : si `Probabilité=Hot` et pas contacté >2h → créer record dans une table `Tâches` à traiter

#### Sécurité & infra

- [ ] **N. Rate limiting `/api/contact`** : si abus constaté (nitro-rate-limiter)
- [ ] **O. Cloudflare Turnstile** : si honeypot ne suffit plus
- [ ] **P. Dashboard Airtable Interface (reporting)** : (cf. ci-dessus, vision globale)
- [ ] **Q. Sentry pour logs d'erreurs serveur**

### ❌ Écarté

- ❌ Pré-remplir `Véhicule d'intérêt` depuis fiche voiture : N/A, le form de contact n'existe que sur `/contact` (les fiches voiture ont un lien WhatsApp direct)
- ❌ `Devis envoyé` (Attachment PDF) : le `Statut=Devis envoyé` suffit
- ❌ `Montant estimé (€)` : pas d'utilité claire
- ❌ Champs supplémentaires formulaire (dates, lieu, budget) : décidé de ne pas surcharger
- ❌ Champ `📱 Lien WhatsApp` (formule wa.me) : abandonné, le commercial fait ce qu'il veut avec le téléphone visible

---

## 📚 Références

- Doc officielle MCP Airtable : https://support.airtable.com/docs/using-the-airtable-mcp-server
- Création de PAT : https://airtable.com/create/tokens
- API REST Airtable : https://airtable.com/developers/web/api/introduction
- Button Field (grid view) : https://support.airtable.com/docs/button-field
- Run automation depuis un bouton : https://support.airtable.com/docs/when-a-button-is-clicked
- Update record action : https://support.airtable.com/docs/update-record-action
- RGPD CNIL — formulaires de contact : https://www.cnil.fr/fr/conformite-rgpd-les-formulaires-de-contact
