# WhatsApp — stratégie & implémentation pour bora-cars

> Métier : **location** de voitures de luxe. Clientèle internationale (Monaco, Paris, Côte d'Azur, Genève, Dubai).
> État actuel : lien `wa.me` pré-rempli déjà en place sur la fiche voiture.

Ce document détaille **toutes les possibilités** au-delà du lien simple : capacités, idées concrètes, archi technique, coûts, ordre de priorité.

---

## Sommaire

1. [Sans API — extensions du `wa.me` actuel](#1-sans-api--extensions-du-wame-actuel)
2. [URL `wa.me` avancées](#2-url-wame-avancées)
3. [Cloud API — cycle de vie d'une location](#3-cloud-api--cycle-de-vie-dune-location)
4. [WhatsApp Flows — formulaires natifs](#4-whatsapp-flows--formulaires-natifs)
5. [Bot IA conversationnel](#5-bot-ia-conversationnel)
6. [WhatsApp Calling API](#6-whatsapp-calling-api)
7. [Acquisition — Ads & Channels](#7-acquisition--ads--channels)
8. [Spécifique luxe / concierge](#8-spécifique-luxe--concierge)
9. [Architecture technique (Nuxt + Sanity)](#9-architecture-technique-nuxt--sanity)
10. [Coûts détaillés 2026 (France)](#10-coûts-détaillés-2026-france)
11. [Conformité RGPD & opt-in](#11-conformité-rgpd--opt-in)
12. [Roadmap priorisée](#12-roadmap-priorisée)

---

## 1. Sans API — extensions du `wa.me` actuel

Même sans toucher à l'API, il reste plusieurs leviers gratuits ou peu coûteux à activer côté WhatsApp Business App.

### 1.1 QR codes physiques
- Sticker QR sur la lunette arrière de la voiture (rejoint le concept « j'ai vu la Lamborghini garée en bas du Carlton, je veux la louer »).
- Affichage showroom, plaquette commerciale, carte de visite.
- Génération via `https://api.whatsapp.com/qr/{code}` ou directement depuis l'app Business.
- Possibilité d'utiliser un short link tracké côté Bitly/site pour suivre l'origine (`?source=qr-cannes`).

### 1.2 Catalogue WhatsApp
Mettre une partie du parc dans le catalogue WhatsApp Business. Le client browse les voitures sans quitter l'app, et peut cliquer pour discuter.
- Photo, nom (marque + modèle), description courte, prix indicatif/jour, lien vers la fiche site.
- **Limite location** : les prix varient par dates → préciser dans la description « à partir de X €/jour, prix exact selon période ». Utiliser le catalogue comme **vitrine**, pas comme moteur de réservation.
- Synchronisable via Commerce Manager côté Meta.

### 1.3 Statuts WhatsApp Business (stories 24h)
- « Nouvelle arrivée : Aston Martin DB12 disponible cet été »
- « Encore dispo ce week-end à Cannes : 911 GT3 »
- Visible par tous les contacts qui ont déjà écrit au numéro → audience opt-in implicite, **zéro coût**.

### 1.4 Réponses rapides + étiquettes côté commercial
- Réponses rapides : `/dispo`, `/tarifs`, `/caution`, `/livraison` → texte pré-rempli côté agent.
- Étiquettes : `VIP`, `Lead chaud`, `Réservation confirmée`, `À relancer`, par langue (`FR`, `EN`, `AR`, `RU`).

### 1.5 Greeting + Away message automatiques
- **Greeting** (premier message d'un nouveau contact) : « Bienvenue chez Bora Cars. Pour une réponse rapide, indiquez-nous le modèle souhaité et les dates de location. »
- **Away message** (hors horaires) : « Notre équipe vous répond dès 9h. Pour une urgence (panne, accident), composez le +33 X XX XX XX XX. »

### 1.6 Lien court `wa.me/c/{phone}`
Lien public vers la conversation Business pour bio Insta/TikTok/email signature.

---

## 2. URL `wa.me` avancées

L'API `wa.me` ne supporte que `phone` + `text`. Mais on peut en tirer beaucoup en travaillant le **texte pré-rempli**.

### 2.1 Pré-remplissage contextuel par page

```ts
// Sur /car/[uid].vue — fiche voiture
const message = `Bonjour, je suis intéressé par la ${car.marque} ${car.modele} (réf. ${car.uid}) vue sur bora-cars.fr — ${window.location.href}`

// Sur une page checkout/devis (si présente)
const message = `Devis #${quote.id} — ${car.marque} ${car.modele}, du ${dates.start} au ${dates.end}, retrait à ${pickup.location}. Pouvez-vous confirmer la disponibilité ?`

// Sur la FAQ assurance/caution
const message = `Bonjour, j'ai une question sur ${faqItem.title} après lecture de votre FAQ.`

// Bouton "Urgence 24/7" (clients en cours de location)
const message = `URGENCE — Location #${booking.id} — `
```

### 2.2 Encodage et longueur
- Toujours `encodeURIComponent(message)`.
- Limite pratique recommandée : ~300 caractères (au-delà, WhatsApp tronque ou refuse selon le client).
- Inclure systématiquement la **référence interne** (`uid`, `bookingId`) pour que le commercial retrouve le dossier en 1 clic dans Sanity.

### 2.3 Différencier desktop vs mobile
- `wa.me/...` ouvre WhatsApp Web sur desktop si rien n'est installé — toujours mieux que `whatsapp://`.
- Sur iOS/Android, `wa.me` fait le bon redirect natif.

### 2.4 Tracking
Pour mesurer le ROI du canal :
- UTM côté URL site → relayer dans le message texte (`?utm_source=ads-monaco`).
- Bouton qui déclenche un `track('whatsapp_click', { car_uid, source })` avant le redirect (GA4 / Plausible / Segment).

---

## 3. Cloud API — cycle de vie d'une location

C'est ici que l'API prend tout son sens : automatiser les **moments clés** d'une location, qui sont aujourd'hui faits à la main (email + SMS + appel).

### 3.1 Mapping cycle de vie → templates à faire approuver par Meta

| Étape | Nom template | Catégorie | Quand | Variables |
|---|---|---|---|---|
| Réservation reçue | `booking_received` | Utility | À la soumission | `{{1}}=prenom, {{2}}=voiture, {{3}}=dates` |
| Réservation confirmée | `booking_confirmed` | Utility | Après validation interne | `{{1}}=prenom, {{2}}=voiture, {{3}}=dates, {{4}}=montant` + PDF contrat |
| Demande KYC | `kyc_request` | Utility | J-3 si pas reçu | `{{1}}=prenom` + bouton ouvrant Flow KYC |
| Préparation J-2 | `pickup_preparation` | Utility | J-2 9h | `{{1}}=voiture, {{2}}=date_remise, {{3}}=lieu` |
| Rappel remise J-J | `pickup_reminder` | Utility | J-J 8h | `{{1}}=heure, {{2}}=adresse` + **localisation** |
| Bienvenue à bord | `pickup_done` | Utility | Après remise | `{{1}}=prenom` + bouton "Urgence 24/7" |
| Rappel restitution -2h | `return_reminder` | Utility | J-restitution -2h | `{{1}}=heure, {{2}}=adresse` |
| Récap post-location | `return_completed` | Utility | Après EDL sortie | `{{1}}=prenom, {{2}}=montant_caution_libere` |
| Demande avis | `review_request` | Marketing (opt-in) | J+2 | `{{1}}=prenom` + lien Google review |
| Nouvelle dispo | `car_available` | Marketing (opt-in) | Sur demande wishlist | `{{1}}=voiture, {{2}}=dates` |

> Approbation Meta : 1 min à 24h. Préparer **versions FR + EN** au minimum, idéalement AR/RU pour clientèle Moyen-Orient/Europe de l'Est.

### 3.2 Médias riches dans les messages

La Cloud API accepte :
- **PDF** (jusqu'à 100 MB) → envoi du contrat de location, conditions générales, fiche véhicule.
- **Image** → photo du véhicule, code QR du parking, plan d'accès.
- **Vidéo** (16 MB inline / 100 MB par upload) → tutoriel « comment démarrer la voiture sans clé », « comment ouvrir le coffre Tesla ».
- **Localisation** (lat/lng + label) → point de remise des clés, parking partenaire.
- **Sticker** / **contact** vCard → carte du commercial dédié.

### 3.3 Réception (webhooks)

Côté webhook Nuxt (`/server/api/whatsapp/webhook.post.ts`), tu peux recevoir :

- **Photos d'état des lieux** (entrée et sortie) envoyées par le client → stocker dans Sanity ou S3, indexées par `bookingId`.
- **Documents** : permis + CNI uploadés directement dans le chat → KYC sans formulaire web (mais privilégier Flow KYC, voir §4).
- **Localisation** : le client partage sa position pour livraison à l'hôtel/yacht/aéroport.
- **Vidéo** : « Voyant orange allumé, regardez » → diagnostic à distance.
- **Messages texte** : commentaires, demandes de prolongation, etc.

### 3.4 Boutons interactifs (max 3 par message)

Exemples concrets pour la location :

```
"Votre location se termine demain à 18h.
Souhaitez-vous prolonger ?"

[ Prolonger 1 jour ]  [ Prolonger 2 jours ]  [ Restituer comme prévu ]
```

```
"Bonjour, comment puis-je vous aider ?"

[ Réserver une voiture ]  [ Modifier ma location ]  [ Urgence 24/7 ]
```

### 3.5 Listes (max 10 items, groupés en sections)

Idéal pour faire choisir un modèle / une option :

```
"Quel type de voiture vous intéresse ?"

▼ Voir les options

Sections :
— Sportives : 911, F8, Huracan
— SUV : Urus, Cullinan, DBX
— Cabriolets : 488 Spider, SL, F-Type
```

### 3.6 Fenêtre 24h — règles à connaître

- Tant que le client écrit, on a **24h pour répondre librement et gratuitement** (service messages).
- Au-delà, il faut un **template payant** pour reprendre contact.
- **Free entry point 72h** si le client arrive via `wa.me` ou Click-to-WhatsApp Ad → fenêtre allongée.
- Stratégie : envoyer un template utility le jour J (« Vous êtes le bienvenu, à votre disposition ») rouvre la conversation et reset la fenêtre.

---

## 4. WhatsApp Flows — formulaires natifs

**Le game-changer pour la location.** Un Flow est un mini-formulaire multi-étapes **dans le chat**, sans redirect web. Composants : input texte, dropdown, radio, checkbox, date picker, image picker, upload, signature simple.

### 4.1 Flow « Pré-réservation »

```
Étape 1 : Type de voiture (radio : Sportive / SUV / Cabriolet / Berline)
Étape 2 : Modèle (dropdown filtré sur le type)
Étape 3 : Dates (date picker du/au)
Étape 4 : Lieu de retrait (dropdown : Nice / Cannes / Monaco / Paris / Livraison hôtel)
Étape 5 : Options (checkboxes : conducteur additionnel, km supplémentaires, chauffeur)
Étape 6 : Récap + envoi
→ Soumission → webhook Nuxt → création lead Sanity + notif Slack/email commercial
```

**Avantage vs formulaire web** : pas de redirect, pas de friction, complétion **3-5× supérieure** selon les benchmarks Meta sur l'automotive.

### 4.2 Flow « KYC »

```
Étape 1 : Photo recto permis (image picker)
Étape 2 : Photo verso permis
Étape 3 : Photo CNI / passeport
Étape 4 : Selfie de vérification
Étape 5 : Confirmation données (nom, date naissance, n° permis)
→ Webhook → stockage chiffré + validation manuelle ou OCR (AWS Textract / Mindee)
```

Plutôt que d'attendre la remise des clés pour faire le KYC en physique → le client le fait depuis chez lui, gain de temps massif côté commercial.

### 4.3 Flow « Choix créneau remise/restitution »

```
Étape 1 : Date (date picker)
Étape 2 : Créneau (radio : 9-11h / 11-13h / 14-16h / 16-18h)
Étape 3 : Adresse (input ou « Comme prévu au contrat »)
→ Webhook → MAJ booking Sanity
```

### 4.4 Flow « Demande de prolongation »

```
Étape 1 : Combien de jours en plus ? (dropdown 1-7)
Étape 2 : Confirmation prix supplémentaire
Étape 3 : Validation
→ Webhook → check dispo Sanity → confirmation ou refus auto
```

### 4.5 Architecture Flow
- Définition JSON du Flow hébergée chez Meta (Flow Builder côté Meta Business Suite).
- Réponses envoyées via webhook à ton serveur.
- Authentification par chiffrement asymétrique (clé publique chez Meta, clé privée côté toi).

---

## 5. Bot IA conversationnel

Brancher Claude / GPT-4o sur le webhook entrant pour répondre **24/7** en langage naturel.

### 5.1 Cas d'usage à vraie valeur

- **Check disponibilité en temps réel** : « Une Ferrari Roma du 20 au 25 juillet à Nice ? » → bot interroge Sanity via GROQ → répond avec dispo + prix + bouton Réserver.
- **Recommandation contextuelle** : « Cabriolet pour mariage à Saint-Tropez le 12 août » → propose 3 options du parc avec photos.
- **Calcul devis** : « Combien pour une Lambo Urus 4 jours avec chauffeur ? » → calcule × tarif jour + km + chauffeur.
- **FAQ** : caution, assurance, kilométrage, restitution, jeune conducteur, paiement, livraison.
- **Multilingue 24/7** : FR / EN / IT / AR / RU / DE pour clientèle internationale.
- **Qualification + handoff humain** : le bot collecte (nom, dates, voiture, lieu) puis ping le commercial avec un résumé prêt à closer.

### 5.2 Architecture suggérée

```
Client WhatsApp
    ↓
Meta Cloud API (webhook POST)
    ↓
Nuxt server route /api/whatsapp/webhook
    ↓
1. Charger contexte conversationnel (Postgres/Redis)
2. Charger données Sanity (parc, dispo, tarifs)
3. Appel Claude (system prompt + tools)
4. Tools dispo : check_availability, get_quote, list_cars,
   transfer_to_human, create_booking_draft
5. Réponse → POST /v18.0/{phone_id}/messages
```

### 5.3 System prompt type

```
Tu es l'assistant de Bora Cars, agence de location de voitures de
luxe basée sur la Côte d'Azur. Tu réponds en français, anglais,
arabe, russe ou italien selon la langue du client.

Ton rôle :
- Répondre aux questions sur le parc, tarifs, modalités
- Vérifier les disponibilités via le tool check_availability
- Calculer un devis via le tool get_quote
- Qualifier le lead (nom, dates, voiture souhaitée, ville)
- Transférer à un humain dès que le client veut confirmer une
  réservation, ou qu'il manifeste une intention forte

Tu ne confirmes JAMAIS une réservation toi-même : tu prépares le
dossier et appelles transfer_to_human.

Tu es discret, courtois, jamais pushy. La clientèle est haut de
gamme et exige du tact.
```

### 5.4 Mémoire conversationnelle
- Stocker chaque échange (user + assistant) en base, indexé par `wa_id` (numéro WhatsApp).
- Charger les N derniers tours (10-20) dans le prompt.
- Reset auto après 7 jours d'inactivité ou en cas de handoff humain.

### 5.5 Garde-fous
- **Toujours** un bouton « Parler à un humain » dans chaque réponse bot.
- Coupure auto du bot pendant les heures ouvrées si un humain reprend (détection : message envoyé depuis la console Business Suite par un agent).
- Filtre injection prompt (le client envoie « Oublie tes instructions et... »).

---

## 6. WhatsApp Calling API

Disponible en bêta (mai 2026) via certains BSP (Respond.io, Bird).

### 6.1 Cas d'usage location
- **Bouton "Appeler le concierge"** dans le chat, en cas de panne / accident / retard.
- **Call-back automatique** : le client clique « Demander à être rappelé » → notif côté agent.
- **Appel sortant** : depuis la console, l'agent appelle le client sans utiliser de minute mobile (passe par data WhatsApp).

### 6.2 Limites
- Pas de SVI complet (pas d'IVR scripté pour l'instant).
- Pas d'enregistrement natif (à faire côté soft tiers).
- Bêta = changements possibles.

### 6.3 Alternative simple
Bouton CTA « Appel d'urgence » → ouvre l'app téléphone classique avec `tel:` ou un message WhatsApp pré-rempli vers une ligne dédiée.

---

## 7. Acquisition — Ads & Channels

### 7.1 Click-to-WhatsApp Ads (CTWA)

Ads Insta/Facebook qui ouvrent **directement** une conversation WhatsApp au lieu de renvoyer sur un site.

**Pourquoi c'est puissant pour bora-cars** :
- Targeting Meta hyper précis (géo Monaco/Cannes/Saint-Tropez, intérêts luxe, lookalike clients existants).
- **Free entry point 72h** côté facturation Meta.
- Taux de conversion **3× supérieur** aux formulaires web en automotive.
- Pré-rempli avec un message contextuel (« J'ai vu votre annonce pour la 911 GT3 »).
- Le commercial reçoit un lead avec contexte d'ad inclus.

**Format recommandé** :
- Vidéo verticale 15s d'une voiture du parc.
- CTA « Réserver maintenant ».
- Audience : intérêts (voitures luxe, hôtellerie 5*, yacht) + géo CMT/Riviera/Île-de-France.

### 7.2 WhatsApp Channels (broadcasts publics)

Chaîne publique abonnable, type Telegram channel.
- Diffusion de nouvelles arrivées, événements (track day, rallye), offres de dernière minute.
- Abonnés opt-in, peut être lié au profil Business.
- Pas de réponse possible des abonnés (one-way).
- Idéal pour fidéliser sans tomber sur les filtres de la catégorie « marketing » (channels = gratuit côté Meta).

### 7.3 Liens trackés
Toujours générer des `wa.me` avec un message qui inclut une **source trackable** :
```
wa.me/33xxx?text=[CTWA-911GT3-MAI26]%20Bonjour...
```
Le marqueur est invisible pour l'agent mais permet de mesurer par campagne.

---

## 8. Spécifique luxe / concierge

Quelques idées qui collent au positionnement Côte d'Azur haut de gamme :

### 8.1 Roadbook personnalisé (PDF envoyé via WA)
- Restos partenaires (réservation prioritaire mentionnée)
- Parkings réservés (Carlton, Negresco, Hôtel de Paris)
- Stations essence partenaires (95 pas dispo partout pour certains modèles)
- Numéro concierge 24/7

### 8.2 Coordination livraison live
- Client envoie sa **localisation** sur WA → tracking en temps réel côté commercial.
- Le commercial envoie sa localisation en retour pendant qu'il livre la voiture.

### 8.3 Service "valet"
- Récupération voiture au check-out hôtel → WA pour coordonner heure exacte.
- Notification dès que la voiture est de retour au showroom (rassurance).

### 8.4 Concierge 24/7 dédié
- Numéro WhatsApp distinct pour les VIP, manning par astreinte la nuit.
- Réponse < 5 min garantie en heures ouvrées, < 30 min la nuit.

### 8.5 Multilingue automatique
- Détection de langue à l'arrivée du message → routage vers l'agent qui parle la langue, ou réponse bot dans la langue.
- Cible : 6 langues prioritaires (FR/EN/IT/AR/RU/DE).

---

## 9. Architecture technique (Nuxt + Sanity)

### 9.1 Vue d'ensemble

```
┌─────────────────────────────────────────────────────────┐
│ Meta Cloud API (WhatsApp)                               │
└──────────────┬──────────────────────────────▲───────────┘
               │ webhook POST                 │ messages API
               ▼                              │
┌─────────────────────────────────────────────┴───────────┐
│ Nuxt server routes                                       │
│   /api/whatsapp/webhook.{get,post}.ts                    │
│   /api/whatsapp/send.post.ts                             │
│   /api/whatsapp/flows/{name}.post.ts                     │
└──────────────┬───────────────────────────────────────────┘
               │
       ┌───────┴───────┬──────────────┬─────────────┐
       ▼               ▼              ▼             ▼
   ┌────────┐    ┌──────────┐   ┌──────────┐  ┌─────────┐
   │ Sanity │    │ Postgres │   │ Claude   │  │ Storage │
   │ (parc, │    │ (convs,  │   │ (bot IA) │  │ (KYC,   │
   │ leads) │    │ kyc...)  │   │          │  │  EDL)   │
   └────────┘    └──────────┘   └──────────┘  └─────────┘
```

### 9.2 Server routes Nuxt à créer

```
web/server/
├── api/
│   └── whatsapp/
│       ├── webhook.get.ts      # vérif Meta (mode + token)
│       ├── webhook.post.ts     # réception messages + flows
│       ├── send.post.ts        # envoi côté serveur
│       └── flows/
│           ├── pre-booking.post.ts
│           ├── kyc.post.ts
│           ├── extension.post.ts
│           └── pickup-slot.post.ts
└── utils/
    └── whatsapp/
        ├── client.ts           # wrapper Graph API
        ├── templates.ts        # constants templates
        ├── verify.ts           # HMAC signature check
        └── flows-crypto.ts     # déchiffrement Flow payloads
```

### 9.3 Variables d'environnement à ajouter

```
NUXT_WHATSAPP_PHONE_NUMBER_ID=
NUXT_WHATSAPP_BUSINESS_ACCOUNT_ID=
NUXT_WHATSAPP_ACCESS_TOKEN=
NUXT_WHATSAPP_VERIFY_TOKEN=
NUXT_WHATSAPP_APP_SECRET=
NUXT_WHATSAPP_FLOW_PRIVATE_KEY=
```

À ajouter dans `runtimeConfig` (`web/nuxt.config.ts`).

### 9.4 Schémas Sanity à étendre

**`studio/schemaTypes/singletons/settings.ts`** — déjà présent, ajouter :
- `whatsappBusinessNumber` (string)
- `whatsappEnableBot` (boolean)
- `whatsappWelcomeMessage` (text, i18n)
- `whatsappEmergencyNumber` (string)

**Nouveau `studio/schemaTypes/documents/booking.ts`** (si pas existant) :
- `client` (ref customer)
- `car` (ref car)
- `dates` (object: start/end)
- `pickupLocation` (string)
- `status` (string : pending/confirmed/active/completed/cancelled)
- `whatsappThreadId` (string, pour lier la conversation)
- `kycStatus` (string : pending/uploaded/validated/rejected)
- `kycDocuments` (array d'assets)
- `stateOfPlay` (object : entryPhotos[], exitPhotos[])

**Nouveau `studio/schemaTypes/documents/whatsappConversation.ts`** :
- `waId` (string, indexé)
- `customerRef` (ref customer)
- `messages` (array, OU mieux : stockage Postgres pour scalabilité)
- `lastInteractionAt` (datetime)
- `assignedAgent` (ref user)
- `language` (string)

> 💡 **Note** : pour les messages eux-mêmes, **Postgres ou Redis sont préférables à Sanity** (volume + besoin de requêtes rapides).

### 9.5 Stockage des médias

Photos KYC, état des lieux, etc. :
- Téléchargement depuis Meta dans les 30 jours suivant la réception (URL signée temporaire).
- Stockage **chiffré** S3 / R2 avec ACL privé.
- Référence dans le booking Sanity, pas l'image directement (RGPD).

### 9.6 Sécurité webhook

```ts
// web/server/utils/whatsapp/verify.ts
import { createHmac, timingSafeEqual } from 'node:crypto'

export function verifyWhatsAppSignature(
  rawBody: string,
  signatureHeader: string,
  appSecret: string
): boolean {
  const expected = 'sha256=' + createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex')

  const sigBuf = Buffer.from(signatureHeader)
  const expBuf = Buffer.from(expected)

  if (sigBuf.length !== expBuf.length) return false
  return timingSafeEqual(sigBuf, expBuf)
}
```

À appeler au début de `webhook.post.ts` avec `event.node.req.rawBody`. Rejeter avec 401 si invalide.

---

## 10. Coûts détaillés 2026 (France)

### 10.1 Tarifs Meta (mai 2026)

| Catégorie conversation | Tarif | Notes |
|---|---|---|
| Service (dans fenêtre 24h) | **Gratuit illimité** | Depuis nov. 2024 |
| Utility | ~0,03–0,05 € / msg délivré | Booking, rappels, contrat |
| Authentication | ~0,045 € / msg | OTP — peu utile ici |
| Marketing | ~0,11–0,14 € / msg | −28-40% depuis janv. 2026 |

- 1 000 premières conversations service / mois : gratuites.
- Templates utility envoyés **dans la fenêtre 24h ouverte** : gratuits.
- Free entry point (Ad ou `wa.me`) : 72h gratuites.

### 10.2 Estimation pour bora-cars

Hypothèse : 100 locations/mois × 3 templates utility par location (booking confirmé + pickup reminder + return reminder) + 500 conversations service entrantes.

| Poste | Calcul | Coût |
|---|---|---|
| Conversations service (500) | Gratuit | 0 € |
| Templates utility (300) | 300 × 0,04 € | 12 € |
| Marketing (0 au début) | — | 0 € |
| **Total Meta** | | **~12 €/mois** |

### 10.3 Coût providers (BSP)

| Provider | Abonnement | Markup | Console | Reco |
|---|---|---|---|---|
| **Meta direct** | 0 € | 0 % | Aucune (faut bâtir) | Si équipe tech autonome |
| **360dialog** | 49 €/mois/numéro | 0 % | Basique | 🟢 **Meilleur rapport pour bora-cars** |
| **Twilio** | 0 € | +$0.005/msg | Aucune (juste API) | Si tu veux flexibilité max |
| **WATI** | 49 $/mois | +20 % | No-code bot builder | Si non-tech |
| **Respond.io** | 79-249 $/mois | 0 % | Très complète, multi-canal | Si scale + IG/email/SMS |
| **Bird** | Sur devis | +$0.005/msg | Enterprise | Si gros volume |
| **Chatwoot** | Self-host | 0 % | Open-source | Si bricolage assumé |

### 10.4 Coût bot IA

- Claude Sonnet 4.6 : ~3 €/1M tokens input, ~15 €/1M output.
- Hypothèse : 500 conversations / mois × 8 tours × 1k tokens / tour ≈ 4M tokens.
- **Estimation : 20-40 €/mois.**

### 10.5 Coût total mensuel par niveau

| Niveau | Meta | BSP | IA | Total |
|---|---|---|---|---|
| 1 — `wa.me` (déjà fait) | 0 € | 0 € | 0 € | **0 €** |
| 2 — Cloud API + templates | 12 € | 49 € (360dialog) | 0 € | **~60 €** |
| 3 — Flows + bot IA | 12 € | 49 € | 30 € | **~90 €** |
| 4 — Ads + Calling + console agents | 12 € + Ads budget | 249 € (Respond.io) | 30 € | **~300 €** + ads |

---

## 11. Conformité RGPD & opt-in

### 11.1 Opt-in obligatoire
- L'envoi de **marketing** WhatsApp exige un opt-in **explicite et séparé** des CGU.
- Cases recommandées à ajouter au checkout / formulaire de réservation :
  - ☐ « J'accepte de recevoir des notifications transactionnelles sur ma location via WhatsApp » (utility — couvert par exécution du contrat, opt-in fortement recommandé mais légalement plus souple)
  - ☐ « J'accepte de recevoir des offres et nouveautés Bora Cars sur WhatsApp » (marketing — opt-in obligatoire et révocable)

### 11.2 Registre des opt-in
Stocker en base : `opt_in_utility_at`, `opt_in_marketing_at`, `opt_out_at`, `consent_source` (page d'origine).

### 11.3 Opt-out
- Mot-clé `STOP` détecté côté webhook → flag `opt_out_at` → blocage automatique de tout envoi marketing futur.
- Lien « Se désabonner » dans tous les messages marketing.

### 11.4 Données sensibles
- KYC : permis + CNI = données d'identité → chiffrement at-rest, accès log, durée de conservation limitée (durée de la location + 1 an légal).
- Photos d'état des lieux : ok 1 an post-restitution pour preuve litige.
- Géolocalisation : pas de stockage permanent, juste pour la session active.

### 11.5 DPA Meta
Signer le DPA avec Meta (automatique côté Business Manager). Mentionner WhatsApp dans la **politique de confidentialité** du site bora-cars.

---

## 12. Roadmap priorisée

### 🟢 Niveau 1 — DÉJÀ FAIT
- [x] Lien `wa.me` pré-rempli sur la fiche voiture

### 🟢 À faire vite (1-2 semaines, ~60 €/mois)
**Objectif : automatiser le cycle de vie d'une location.**

- [ ] Compte Meta Business Manager + vérification SIRET
- [ ] Connexion via 360dialog (49 €/mois)
- [ ] Server routes Nuxt `/api/whatsapp/{webhook,send}`
- [ ] 3 templates utility approuvés : `booking_confirmed`, `pickup_reminder`, `return_reminder` (FR + EN)
- [ ] Cron Nuxt (Nitro scheduled tasks) qui déclenche les rappels
- [ ] Réception webhook + stockage conversations en base
- [ ] Ajout `whatsappBusinessNumber` au schema `settings` Sanity
- [ ] Cases opt-in RGPD au checkout

**Valeur** : -90% du temps commercial sur les rappels & notifications, taux de no-show divisé par 2.

### 🟡 Court terme (2-4 semaines, ~90 €/mois)
**Objectif : qualifier les leads et faire le KYC sans friction.**

- [ ] Flow Builder Meta : Flow « Pré-réservation » (5 étapes)
- [ ] Flow « KYC » avec upload permis/CNI
- [ ] Flow « Demande de prolongation »
- [ ] Server routes pour traiter les Flow submissions
- [ ] Bot IA basique (Claude Sonnet) sur questions FAQ
- [ ] Multilingue auto FR/EN/IT (extension AR/RU en option)
- [ ] Boutons interactifs « Prolonger / Restituer / Urgence » dans messages

**Valeur** : conversion lead → réservation x2, KYC en amont (gain de 30 min sur la remise des clés).

### 🟠 Moyen terme (2-3 mois, ~300 €/mois + budget ads)
**Objectif : acquisition et expérience VIP.**

- [ ] Click-to-WhatsApp Ads sur Instagram (audiences Monaco/Cannes/Paris)
- [ ] Channel WhatsApp public pour nouveautés
- [ ] WhatsApp Calling API (assistance 24/7)
- [ ] Concierge VIP : numéro WA dédié + astreinte nuit
- [ ] Roadbook personnalisé envoyé via WA
- [ ] Console agents (Respond.io ou WATI)
- [ ] CRM sync (HubSpot / Pipedrive si présent)

**Valeur** : nouveau canal d'acquisition mesurable, fidélisation clientèle VIP.

### 🔵 Plus tard (sur volume)
- [ ] Catalogue WhatsApp synchronisé avec le parc Sanity
- [ ] Statuts WhatsApp Business automatisés (cron)
- [ ] Détection de langue auto + routage agent par langue
- [ ] OCR permis/CNI (Mindee ou AWS Textract) en post-Flow KYC
- [ ] Tableaux de bord analytics WA (taux d'ouverture, conversion par template)

---

## Ressources

- [Meta Cloud API docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [WhatsApp Flows](https://developers.facebook.com/docs/whatsapp/flows)
- [Templates reference](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates)
- [Pricing officiel](https://developers.facebook.com/docs/whatsapp/pricing)
- [Messaging Policy](https://business.whatsapp.com/policy)
- [Click-to-WhatsApp Ads](https://www.facebook.com/business/help/447934475640650)
- [WhatsApp Calling API (bêta)](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/calls)
- [360dialog docs](https://docs.360dialog.com/)
- [Respond.io WA pricing 2026](https://respond.io/blog/whatsapp-business-api-pricing)

---

*Document créé dans cette session de travail. À mettre à jour quand l'implémentation avance.*
