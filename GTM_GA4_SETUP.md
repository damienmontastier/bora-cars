# GTM + GA4 — Setup Bora Cars

Guide complet pour configurer Google Tag Manager + Google Analytics 4 sur Bora Cars.

## Contexte projet

- **Production** : `https://boracars.com` (waiting page pour le moment)
- **Staging** : `https://develop.boracars.com` (site complet, 2 utilisateurs internes)
- **GTM Container ID** : `GTM-K23JSRNH`
- **GA4 Measurement ID** : `G-REHMWCEEEM`
- **Stratégie** : 1 propriété GA4, 1 data stream, 2 hostnames trackés (le staging est OK à polluer car 2 users internes)

---

## 1. Architecture côté code (déjà en place)

### Composables

- `app/composables/useCookies.ts` — gestion du banner consent (RGPD) + persistence cookie (1 an, SSR-safe via `useCookie`) + push `consent.update()` typé GCMv2 via `@nuxt/scripts`.
- `app/composables/useAnalytics.ts` — helpers typés pour pousser des events business sur le dataLayer (vehicle_view, contact_form_submit, etc.). Safe no-op si GTM pas registered.

### Plugin

- `app/plugins/05.gtm.client.ts` — push automatique d'un event `page_view` (avec `page_title` / `page_location` / `page_path`) à chaque change de route, via `useScriptEventPage`.

### Config

- `nuxt.config.ts > scripts.registry.googleTagManager` — `defaultConsent: { all denied + wait_for_update: 500 }`, posé AVANT le chargement de `gtm.js`. Conditionnel sur `NUXT_PUBLIC_GTM_ID`.
- `.env` et `.env.prod` — `NUXT_PUBLIC_SCRIPTS_GOOGLE_TAG_MANAGER_ID=GTM-K23JSRNH` (convention `@nuxt/scripts` — l'ID est lu au runtime via `runtimeConfig.public.scripts.googleTagManager.id`, ce qui évite le bundling first-party).

### Composants auto-tracking

`app/components/utils/BaseLink.vue` détecte le type d'URL au clic et push automatiquement :

| URL détectée | Event |
|---|---|
| `mailto:...` | `email_click` |
| `tel:...` | `phone_click` |
| `wa.me` / `whatsapp.com` | `whatsapp_click` |
| autre externe | `external_link_click` |

Prop `:tracking-extra="{...}"` pour enrichir avec contexte (ex : `{ source: 'menu', car_id, duration }`).

### Composants — events manuels

- `pages/car/[uid].vue` — `vehicle_view` au mount
- `components/page/car/Hero.vue` — `car_gallery_browse` au clic dot
- `components/page/car/Pricing.vue` — `rental_config_change` (duration/when watchers) + `:tracking-extra` sur la CTA WhatsApp
- `components/app/Menu.vue` — `:tracking-extra="{ source: 'menu' }"` sur la CTA contact
- `components/app/MenuLangSwitcher.vue` — `language_switch` dans `selectLocale`
- `components/elements/ContactForm.vue` — `contact_form_submit` + `contact_form_error`

---

## 2. Setup GA4 (compte + propriété + flux)

### 2.1 Créer le compte Analytics (si pas déjà fait)

1. https://analytics.google.com → bouton **Commencer la mesure**
2. **Account name** : `Bora Cars` (ou ton nom de société)
3. Account data sharing : laisse les checks par défaut
4. Suivant

### 2.2 Créer la propriété

1. **Property name** : `Bora Cars`
2. **Fuseau horaire** : `(GMT+01:00) Paris`
3. **Devise** : Euro (€)
4. Suivant

### 2.3 Renseigner business

1. **Industry category** : Travel
2. **Business size** : Small
3. **Business objectives** : coche `Generate leads` et `Examine user behavior`
4. Suivant

### 2.4 Créer le data stream Web

1. Plate-forme : **Web**
2. URL : `https://boracars.com`
3. Nom du flux : `Bora Cars Web`
4. **Enhanced measurement** : DÉSACTIVE le toggle (on track tout via GTM, sinon doublons SPA)
5. Crée

Tu récupères ton **Measurement ID** `G-XXXXXXXXXX` (ici `G-REHMWCEEEM`).

### 2.5 Wizard "comment installer" — IGNORE

GA4 te propose ensuite plusieurs options d'installation (`gtag.js` direct, CMS, "balise existante"). **Ferme ce wizard** sans choisir — tu installes via GTM, qui se gère ailleurs.

### 2.6 Configurer les domaines (cross-domain)

Sur le flux web → **Configure tag settings** → **Configure your domains** → **Add condition** :
- Match type : `contains`
- Domain : `boracars.com`

Ça couvre `boracars.com` ET `develop.boracars.com`. Une session qui passe de l'un à l'autre n'est pas cassée.

---

## 3. Setup GTM (variables + triggers + tags)

Va sur https://tagmanager.google.com → container `GTM-K23JSRNH`.

### 3.1 Activer la variable built-in `Event`

GTM → **Variables** (menu gauche) → en haut "Variables intégrées" → **Configurer** → coche `Event` (sous "Utilities").

C'est la variable qui capture dynamiquement le nom de l'event courant. Elle est le cœur du pattern "1 tag = tous les events".

### 3.2 Créer les variables DLV

GTM → **Variables** → section "Variables définies par l'utilisateur" → **Nouvelle**.

Pour chaque ligne : Type = `Variable de couche de données`, Variable Name = colonne droite, Nom du variable = colonne gauche.

| Nom GTM | Data Layer Variable Name |
|---|---|
| `DLV - page_title` | `page_title` |
| `DLV - page_location` | `page_location` |
| `DLV - page_path` | `page_path` |
| `DLV - car_id` | `car_id` |
| `DLV - car_brand` | `car_brand` |
| `DLV - car_model` | `car_model` |
| `DLV - car_price_per_day` | `car_price_per_day` |
| `DLV - car_category` | `car_category` |
| `DLV - source` | `source` |
| `DLV - duration` | `duration` |
| `DLV - when` | `when` |
| `DLV - url` | `url` |
| `DLV - subject` | `subject` |
| `DLV - from` | `from` |
| `DLV - to` | `to` |
| `DLV - image_index` | `image_index` |
| `DLV - total` | `total` |
| `DLV - field` | `field` |
| `DLV - locale` | `locale` |
| `DLV - price_text` | `price_text` |
| `DLV - fields` | `fields` |
| `DLV - filter_type` | `filter_type` |
| `DLV - filter_value` | `filter_value` |

Laisse "Default Value" vide partout. Si la clé n'existe pas dans l'event, le param n'est pas envoyé à GA4.

### 3.3 Créer les triggers

**Trigger 1** — Triggers → New :
- Type : `Custom Event`
- Event name : `page_view`
- This trigger fires on : `All Custom Events`
- Nom : `Custom - Page View`

**Trigger 2** — Triggers → New :
- Type : `Custom Event`
- Event name : `page_view|vehicle_view|whatsapp_click|email_click|phone_click|external_link_click|contact_form_submit|contact_form_error|rental_config_change|language_switch|car_gallery_browse|catalogue_filter|consent_granted|consent_denied`
- **Use regex matching** : coche
- This trigger fires on : `All Custom Events`
- Nom : `Custom - Bora Events`

Pour ajouter un event plus tard : tu rajoutes `|new_event_name` à la regex de ce trigger.

### 3.4 Créer le tag "Balise Google" (= GA4 Config)

Tags → New :
- Type : `Balise Google` (icône Google bleu/jaune/vert/rouge, PAS l'orange GA)
- **Tag ID** : `G-REHMWCEEEM`
- **Paramètres de configuration** :
  - Paramètre : `send_page_view` → Valeur : `false`
- **Déclencheurs** : `Custom - Page View`
- **Paramètres avancés → Consent Settings → Additional consent checked for** : coche `analytics_storage`
- Nom : `Google Tag - GA4 Config`
- Enregistrer

### 3.5 Créer le tag générique GA4 Event

Tags → New :
- Type : `Google Analytics : Événement GA4`
- **Tag de configuration** : sélectionne `Google Tag - GA4 Config` (créé en 3.4)
- **Nom de l'événement** : `{{Event}}` (la variable built-in — tape `{{` pour autocomplete)
- **Paramètres de l'événement** : ajoute toutes ces lignes :

| Paramètre | Valeur |
|---|---|
| `page_title` | `{{DLV - page_title}}` |
| `page_location` | `{{DLV - page_location}}` |
| `page_path` | `{{DLV - page_path}}` |
| `car_id` | `{{DLV - car_id}}` |
| `car_brand` | `{{DLV - car_brand}}` |
| `car_model` | `{{DLV - car_model}}` |
| `car_price_per_day` | `{{DLV - car_price_per_day}}` |
| `car_category` | `{{DLV - car_category}}` |
| `source` | `{{DLV - source}}` |
| `duration` | `{{DLV - duration}}` |
| `when` | `{{DLV - when}}` |
| `url` | `{{DLV - url}}` |
| `subject` | `{{DLV - subject}}` |
| `from` | `{{DLV - from}}` |
| `to` | `{{DLV - to}}` |
| `image_index` | `{{DLV - image_index}}` |
| `total` | `{{DLV - total}}` |
| `field` | `{{DLV - field}}` |
| `locale` | `{{DLV - locale}}` |
| `price_text` | `{{DLV - price_text}}` |
| `filter_type` | `{{DLV - filter_type}}` |
| `filter_value` | `{{DLV - filter_value}}` |

- **Déclencheurs** : `Custom - Bora Events`
- **Paramètres avancés → Consent Settings** : check `analytics_storage`
- Nom : `GA4 Event - Bora Generic`
- Enregistrer

---

## 4. État final attendu de GTM

**Tags (2)**
- `Google Tag - GA4 Config` → trigger `Custom - Page View`
- `GA4 Event - Bora Generic` → trigger `Custom - Bora Events`

**Triggers (2)**
- `Custom - Page View` → event name = `page_view`
- `Custom - Bora Events` → regex sur tous les events business

**Variables DLV** (~23)

---

## 5. Test en Preview

1. GTM → bouton **Preview** (haut droite)
2. URL : `https://develop.boracars.com` → **Connect**
3. Tag Assistant s'ouvre dans une autre fenêtre
4. Sur le site :
   - Au load : événement `gtm.js` puis `Consent Default (all denied)` dans la timeline
   - **Refuse les cookies** → event `consent_denied`, aucun tag GA4 ne fire (consent_storage denied)
   - **Accepte les cookies** → event `Consent Update (analytics_storage: granted)` puis `consent_granted`. À partir d'ici les tags GA4 firent
   - Navigation → event `page_view` à chaque route → `Google Tag - GA4 Config` + `GA4 Event - Bora Generic` firent
   - Page voiture → event `vehicle_view` avec params (`car_id`, `car_brand`, ...)
   - Clic WhatsApp sur Pricing → event `whatsapp_click` avec tous les params car + durée/when
   - Switch langue → event `language_switch` avec `from`/`to`
   - Soumission contact → event `contact_form_submit` avec `subject`/`locale`
5. GA4 → **Reports → Realtime** → vérifie que tu vois ton trafic + les events listés dans "Event count by Event name"

---

## 6. Publish

Quand Preview est OK :

GTM → **Submit** (haut droite) → version name `v1 - GA4 generic setup` → **Publish**.

---

## 7. Marquer les conversions GA4 (lead chaud)

GA4 → **Admin** → **Events** (attendre que les events soient remontés, jusqu'à 24h après publish) :

- `whatsapp_click` → toggle **Mark as conversion** ON
- `contact_form_submit` → toggle **Mark as conversion** ON

Ces deux events deviennent ta métrique conversion principale.

---

## 8. Plus tard — ajouter Meta / Google Ads / LinkedIn

Tout se passe dans GTM (zéro code à toucher) :

**Meta Pixel**
- Tags → New → Custom HTML → colle le code Meta Pixel base
- Trigger : `All Pages` + Consent : `ad_storage` required
- New tag → Custom HTML → `fbq('track', 'Lead')` → trigger `Custom - Bora Events` filtré sur `whatsapp_click|contact_form_submit` (créer un trigger dédié)

**Google Ads Conversion**
- Tags → New → Google Ads Conversion Tracking → Conversion ID & label fournis par Google Ads
- Trigger : event `whatsapp_click` ou `contact_form_submit`

**LinkedIn Insight Tag**
- Tags → New → LinkedIn Insight Tag → Partner ID
- Trigger : `All Pages` + Consent : `ad_storage` required

---

## 9. Tous les events trackés — référence rapide

| Event | Quand | Paramètres |
|---|---|---|
| `page_view` | À chaque route SPA | `page_title`, `page_location`, `page_path` |
| `vehicle_view` | Mount page car | `car_id`, `car_slug`, `car_brand`, `car_model`, `car_price_per_day`, `car_category` |
| `whatsapp_click` | Clic lien WhatsApp (auto-detect BaseLink) | `url`, + `source` + tracking extra (car_id, duration, when, price_text, etc.) |
| `email_click` | Clic lien `mailto:` (auto-detect BaseLink) | `url`, + tracking extra |
| `phone_click` | Clic lien `tel:` (auto-detect BaseLink) | `url`, + tracking extra |
| `external_link_click` | Clic lien externe non-whatsapp/email/phone (auto-detect BaseLink) | `url`, + tracking extra |
| `contact_form_submit` | Submit form contact valide | `subject`, `locale` |
| `contact_form_error` | Submit form contact invalide | `fields` (array), `summary` |
| `rental_config_change` | Change duration ou when dans Pricing widget | `car_id`, `car_brand`, `car_model`, `field`, `duration`, `when` |
| `language_switch` | Toggle FR/EN | `from`, `to` |
| `car_gallery_browse` | Clic dot dans gallery car detail | `car_id`, `car_brand`, `car_model`, `image_index`, `total` |
| `catalogue_filter` | (futur) Application d'un filtre | `filter_type`, `filter_value` |
| `consent_granted` | Cookie accepted (analytics OR marketing OR functional) | — |
| `consent_denied` | Cookie refused (tous off) | — |

---

## 10. Gotchas / troubleshooting

- **Pageviews doublés en GA4** : tu as oublié de désactiver Enhanced Measurement dans GA4 (étape 2.4) OU `send_page_view: false` n'est pas dans la Balise Google (étape 3.4).
- **Realtime montre 0 events** alors que Tag Assistant les voit : Measurement ID faux dans `Google Tag - GA4 Config`, ou Consent Settings mal configuré.
- **Tags ne firent pas après accept consent** : vérifie `analytics_storage` dans Consent Settings des deux tags.
- **Reset du banner pour re-tester** : DevTools → Application → Cookies → delete `bora-cookies-consent`.
- **Conversion freshly toggled** : prend jusqu'à 24h pour apparaître dans les rapports Conversion.

---

## 11. Architecture du code — référence

### Flow consent au load

1. `nuxt.config.ts > scripts.registry.googleTagManager.defaultConsent` pose `['consent', 'default', { all denied + wait_for_update: 500 }]` dans `dataLayer` **avant** le chargement de `gtm.js`.
2. `gtm.js` charge avec tous les signaux denied.
3. Côté composant `AppCookies` :
   - First-time visitor : banner affiché. Au choix → `consent.update()` push les signaux granted/denied côté GTM.
   - Returning visitor : `useCookies.init()` lit le cookie persistant et re-push `consent.update()` automatiquement.
4. Les tags GTM gatés par `analytics_storage required` (ou `ad_storage required`) firent ou non selon l'état du consent.

### Pourquoi 1 tag générique vs N tags par event ?

- **1 tag générique** (notre choix) : ajouter un event = ajouter une entrée à la regex du trigger. Zero code GTM. Scale infiniment.
- **N tags par event** : explicit, granular, debug facile par event. Mais 10x plus de maintenance.

Pour Bora Cars (<20 events), 1 tag générique gagne sur tous les axes.

### Variables GA4 utiles à créer plus tard (custom dimensions)

GA4 → Admin → Custom definitions → Custom dimensions :

- `car_brand` (event-scoped) — pour breakdowns par marque
- `car_category` (event-scoped) — SUV vs Sportive vs ...
- `source` (event-scoped) — comparaison emplacements CTA
- `locale` (user-scoped) — répartition FR vs EN

Avec ces custom dimensions, les rapports GA4 te permettent de voir "quels événements `whatsapp_click` par marque de voiture" par exemple.
