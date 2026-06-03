# Airtable — Intégration & roadmap

Documentation de l'intégration Airtable du site `bora-cars.com` avec le CRM du client.

---

## 🔌 Setup actuel

### Base & table cibles

| Élément | Valeur |
|---|---|
| Base | `BORA CARS - CRM Parc Automobile` (`appzqdmWjxE1FkAer`) |
| Table | `Demandes de contact` (`tblRVnNijTcEInX7L`) |
| Endpoint | `POST /api/contact` (Nitro server route) |
| Interface | `Demandes de contact` (Record review, avec bouton +1 contact) |

### Authentification

- **Personal Access Token (PAT)** scopé `data.records:write` (+ optionnel `data.records:read`) sur la base CRM uniquement
- Stocké dans `runtimeConfig.airtableToken` (privé, jamais côté client)
- Env vars : `NUXT_AIRTABLE_TOKEN`, `NUXT_AIRTABLE_BASE_ID`, `NUXT_AIRTABLE_TABLE_ID`
- En prod (Netlify) : variables à set dans le dashboard Netlify avec **"Contains secret values"** activé pour le TOKEN

### Mode de déploiement Nitro

```ts
nitro.preset = NUXT_PUBLIC_IS_PROD === 'true'
  ? 'netlify_static'  // main → SSG hybride (static + Netlify Functions pour /api/*)
  : 'netlify'         // develop → SSR sur Netlify
```

→ Même endpoint `/api/contact` fonctionne dans les deux cas.

---

## 📋 Schéma de la table `Demandes de contact`

### Champs alimentés par le formulaire

| Field | Type | Source | Notes |
|---|---|---|---|
| `Nom complet` | singleLineText (primary) | `firstName + lastName` concaténés | |
| `Email` | email | form | |
| `Téléphone` | phoneNumber | form | |
| `Type de demande` | singleSelect (typecast) | Label Sanity du subject | Source de vérité = Sanity, Airtable crée les options à la volée |
| `Message` | multilineText | form | |
| `Langue` | singleSelect | `useI18n().locale` | `FR` ou `EN` |
| `Source` | singleSelect | auto = `Site web` | |
| `Statut` | singleSelect | auto = `Nouveau` à la création | Voir workflow ci-dessous |
| `Page d'origine` | url | `useRequestURL().href` | URL au moment de la soumission |
| `Consentement RGPD` | checkbox | auto = `true` | Mention RGPD visible quand l'utilisateur a soumis (art. 12-14) |
| `Opt-in newsletter` | checkbox | form (decoché par défaut) | Consentement explicite marketing (art. 7) |
| `UTM source` | singleLineText | sessionStorage (1er touch) | Si présent dans l'URL au 1er visit |
| `UTM medium` | singleLineText | idem | |
| `UTM campaign` | singleLineText | idem | |
| `Date de création` | createdTime | auto Airtable | |
| `Dernière modif` | lastModifiedTime | auto Airtable | |

### Champs de suivi commercial

| Field | Type | Usage |
|---|---|---|
| `Date dernier contact` | date | Date du dernier contact effectif. Mise à jour auto par le bouton +1 contact ou par l'automation quand Statut→Contacté |
| `Date prochaine relance` | **formula** | `IF({Date dernier contact}, DATEADD({Date dernier contact}, 3, 'days'))` — toujours = dernier contact +3j, recalcul auto |
| `Nombre de relances` | **rating ⭐** (max 10) | Compteur de relances. Incrémenté par le bouton +1 contact via le helper `_NextCount` |
| `Canal utilisé` | singleSelect | `Téléphone`, `Email`, `WhatsApp`, `Visio`, `SMS`, `Rendez-vous physique` |
| `Probabilité` | singleSelect | `Hot 🔥`, `Warm`, `Cold` — pour prioriser |
| `Raison du refus` | singleSelect | `Prix`, `Délai`, `Véhicule indisponible`, `Concurrent choisi`, `No-show`, `Hors zone`, `Spam`, `Autre` — à remplir si Statut=Perdu |
| `Notes internes` | multilineText | Notes libres (relances, objections, contexte) |
| `Réservation liée` | multipleRecordLinks → `Réservations` | À remplir manuellement quand la demande devient une location |
| `Dossier de leasing lié` | multipleRecordLinks → `Dossiers de leasing` | Idem pour un leasing |
| `Propriétaire lié` | multipleRecordLinks → `Propriétaires` | Pour les demandes `Type=Mise en gestion`, link vers le Propriétaire créé quand ça se concrétise |

### Champs calculés (formules / rollups)

| Field | Type | Calcul |
|---|---|---|
| `✅ Convertie ?` | formula | `IF(OR({Réservation liée}, {Dossier de leasing lié}, {Propriétaire lié}), "✅ Oui", "")` — visualisation rapide des leads convertis |
| `💰 CA généré` | rollup (à créer manuellement) | SUM de `Montant total` depuis les `Réservation liée` — montre le CA généré par chaque demande |

### Champs helpers (techniques, à masquer pour le commercial)

| Field | Type | Rôle |
|---|---|---|
| `_NextCount` | formula | `{Nombre de relances} + 1` — utilisé par l'automation +1 contact pour incrémenter (workaround sans script) |

### Workflow `Statut`

```
Nouveau → En cours → Contacté → Devis envoyé → Confirmé → Traité
                                                       ↘ Perdu
```

---

## 🖥️ Interface Airtable

**Nom** : `Demandes de contact` (type Record review)

**Layout** :
- Liste filtrable à gauche
- Panneau détail à droite avec tous les champs essentiels (Nom, Email, Téléphone, Type, Message, Statut, Probabilité, Date dernier contact, Date prochaine relance, Nombre de relances, Canal utilisé, Notes internes, Raison du refus, Réservation/Dossier liés)
- Champs admin/marketing masqués (Source, Page d'origine, UTM, Consentement RGPD, Opt-in newsletter, Dernière modif)

**Bouton `📞 +1 contact`** (en haut à droite du panneau détail) :
- Action : `Run automation` → déclenche l'automation `📞 +1 contact (bouton)`
- L'automation gère la logique conditionnelle (premier contact vs relance)

---

## 🤖 Automations actives

### 1. 🔔 Notif commercial sur nouveau lead

- **Trigger** : `When record is created` sur `Demandes de contact`
- **Action** : Send email aux commerciaux (`tech@bora-cars.com`)
- **Body** : infos du record (Nom, Email, Téléphone, Type, Message, Langue, Page d'origine, lien Airtable)
- **But** : ne pas louper un lead, réagir vite (luxe = engagement de rappel <24h)

### 2. 📩 Auto-reply email au client

- **Trigger** : `When record is created` sur `Demandes de contact`
- **Action** : Send email à `{{Email}}` du record
- **From name** : "BORA CARS", **Reply-to** : `contact@bora-cars.com`
- **Body** : confirmation de réception + délai de réponse 24h
- **But** : UX premium, le client sait que sa demande a été reçue

### 3. 🔄 Auto-init Statut→Contacté (manuel via grid)

- **Trigger** : `When record matches conditions` → `Statut = Contacté` AND `Date dernier contact = empty`
- **Action** : Update record → `Date dernier contact = Dernière modif`, `Nombre de relances = 1`
- **But** : filet de sécurité si le commercial change le statut manuellement dans le Grid (sans utiliser le bouton Interface)

### 4. 📞 +1 contact (bouton Interface)

- **Trigger** : `When a button is clicked` (bouton `+1 contact` dans l'interface)
- **Logique conditionnelle** :
  - **Branche A — Premier contact** : si `Statut = Nouveau`
    - Update : `Statut = Contacté`, `Nombre de relances = 1`, `Date dernier contact = Maintenant`
  - **Branche B — Sinon** (relance)
    - Update : `Nombre de relances = {{_NextCount}}` (incrémenté via helper), `Date dernier contact = Maintenant`
- **But** : 1 clic du commercial = +1 relance + maj date. `Date prochaine relance` (formule) se recalcule auto

---

## 🛡️ Sécurité

- ✅ **Honeypot** : champ caché `website` dans le form, le serveur rejette silencieusement si rempli (anti-bot)
- ✅ **Validation Zod-like** côté serveur (regex email, longueur téléphone, champs requis)
- ✅ **Token RGPD** : `Consentement RGPD` auto-set par l'API uniquement
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

## 🗺️ Roadmap

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
