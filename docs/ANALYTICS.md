# Analytics — Bora Cars

Référence complète de la stack analytics (GTM + GA4 + Consent Mode v2) — état actuel, architecture code, setup history, et roadmap (Meta Pixel / Google Ads / LinkedIn).

## État actuel ✅

- ✅ GTM container `GTM-K23JSRNH` publié (v1)
- ✅ GA4 property `G-REHMWCEEEM` créée + flux Web configuré
- ✅ Code site câblé end-to-end (banner consent, Consent Mode v2, useAnalytics, auto-tracking BaseLink, events manuels)
- ✅ Events visibles dans GA4 Realtime
- ✅ 4 Custom Dimensions GA4 créées (Car Brand, Car Model, CTA Source, Page Path)
- ⏳ **À faire dans 24-48h** : marquer `whatsapp_click` + `contact_form_submit` comme événements clés (cf. §7) — les events doivent d'abord apparaître dans "Événements récents", ce qui prend jusqu'à 24h après les premières réceptions
- ⏳ **À faire (quand t'as 5-10 min)** : créer le **Funnel Exploration "Lead — Bora Cars"** dans GA4 Explorations (cf. §7ter) — vue entonnoir Site visit → Catalogue → Car → Config rental → Lead
- ✅ **Events HIGH priority instrumentés** : Hero CTA `source`, `catalogue_car_click`, `faq_toggle`, `back_to_top_click` (cf. §9bis)
- ⏳ **À faire dans GTM** : ajouter ces 3 nouveaux events à la regex du trigger `Custom - Bora Events` + créer les DLVs pour les nouveaux params (cf. §9bis "Action GTM requise")
- ⏳ **À instrumenter côté code (reste)** : events MEDIUM (infinite scroll, testimonial nav, car detail back, etc.) — cf. §9bis
- 🔜 **Plus tard** : ajouter Meta Pixel / Google Ads / LinkedIn Insight Tag (cf. §8)

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

- `nuxt.config.ts > scripts.registry.googleTagManager` — `debug` + `defaultConsent: { all denied + wait_for_update: 500 }` (posé AVANT le chargement de `gtm.js`). **L'ID GTM n'est PAS dans la registry** — il vient du runtime via `runtimeConfig.public.scripts.googleTagManager.id`.
- `nuxt.config.ts > $development.scripts.registry.googleTagManager = 'mock'` — mock GTM uniquement en local dev (`npm run dev`). Sur develop/prod deploys, GTM est actif normalement.
- `nuxt.config.ts > runtimeConfig.public.scripts.googleTagManager.id = ''` — défault vide, l'ID est injecté au runtime via env var.
- **Convention env var** : `NUXT_PUBLIC_SCRIPTS_GOOGLE_TAG_MANAGER_ID=GTM-K23JSRNH`. Pattern `@nuxt/scripts` officiel — quand l'ID vient du runtime config, le `gtm.js` se charge **directement depuis `googletagmanager.com`** au lieu d'être bundled en first-party (sinon le bundle est un shim incomplet qui ne fait pas les requests vers GA4).
- `.env` et `.env.prod` (local dev / build local) : `NUXT_PUBLIC_SCRIPTS_GOOGLE_TAG_MANAGER_ID=GTM-K23JSRNH`.
- **Netlify** (deploys) : env var `NUXT_PUBLIC_SCRIPTS_GOOGLE_TAG_MANAGER_ID=GTM-K23JSRNH` configurée dans le dashboard Netlify (Site configuration → Environment variables), scope `All scopes`, type Plaintext (pas Secret — un GTM container ID est public par nature).

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

## 7. Marquer les conversions GA4 (= "événements clés" dans la nouvelle UI 2026)

**À faire 24-48h après la première réception d'events.** Cette section est à exécuter une seule fois.

### Contexte sur le délai

- En **Realtime** GA4 → tes events apparaissent instantanément (validation que le pipeline marche)
- Dans le tableau **"Événements récents"** (Admin > Property > Affichage des données > Événements) → délai d'agrégation jusqu'à 24h. C'est NORMAL, ce n'est pas un bug.
- Tant que le tableau "Événements récents" n'est pas peuplé, tu ne peux pas marquer les events comme clés (l'UI ne propose pas l'étoile).

### Procédure (revenir le lendemain)

1. GA4 → **Admin** (engrenage bas-gauche) → colonne **Property** → section **Affichage des données** → **Événements**
2. Clique l'onglet **"Événements récents"** (à côté de "Événements clés")
3. Tu dois voir maintenant tes events listés : `page_view`, `consent_granted`, `vehicle_view`, `whatsapp_click`, `contact_form_submit`, `language_switch`, `car_gallery_browse`, etc.
4. Trouve `whatsapp_click` → clique l'**⭐ étoile vide** à gauche → elle se remplit → c'est marqué comme événement clé ✅
5. Idem pour `contact_form_submit`
6. (Optionnel) Refais pour d'autres events si tu veux les tracker comme conversion (`car_gallery_browse` par exemple si tu vois beaucoup d'engagement sur les galleries)

### ⚠️ Ce qu'il NE FAUT PAS faire

- **NE PAS** utiliser "+ Créer un événement" avec le même nom (`whatsapp_click` → `whatsapp_click`) → ça créerait un event dérivé qui firerait en plus de l'original → **double comptage** dans tes rapports.
- "+ Créer un événement" sert uniquement à créer un NOUVEAU event dérivé avec un nom différent (ex : `viewed_pricing_page` quand `page_view` matche `page_path` contains `/pricing`).

### Cleanup des templates par défaut (optionnel)

GA4 crée 3 events templates par défaut quand tu crées une propriété : `close_convert_lead`, `purchase`, `qualify_lead`. Si tu veux nettoyer ta liste :
- 3 points ⋮ sur chaque ligne → Supprimer (ou laisse — ça ne pose pas problème, juste du visual noise)

### Vérification après marquage

- Admin → Property → Affichage des données → Événements → onglet **"Événements clés"** → tu dois voir tes 2 events avec étoile pleine
- Rapports → Conversions (ou "Engagement → Évenements clés") → apparait 24h après le toggle

---

## 7bis. Custom Dimensions GA4 ✅ FAIT

**Dimensions créées** (Admin → Property → Affichage des données → Définitions personnalisées → Dimensions personnalisées) :

| Dimension name | Scope | Event parameter |
|---|---|---|
| `Car Brand` | Event | `car_brand` |
| `Car Model` | Event | `car_model` |
| `CTA Source` | Event | `source` |
| `Page Path` | Event | `page_path` |

**Notes utiles à se rappeler** :
- ⚠️ Les Custom Dimensions ne s'appliquent qu'aux events **futurs** — les events reçus AVANT leur création restent vides
- Limite GA4 : 50 dimensions event-scoped par propriété (large marge)
- Délai d'apparition dans les Standard Reports : ~24h. Immédiat en **Explore** (rapport custom)
- Permettent des rapports type "events `whatsapp_click` par `car_brand`" → savoir quelles voitures génèrent le plus de leads

### Dimensions optionnelles à ajouter plus tard si besoin

Si plus tard tu veux plus de granularité, tu retournes dans le même menu et tu crées :

| Nom | Scope | Param | Pour quoi faire |
|---|---|---|---|
| `Car Category` | Event | `car_category` | Split SUV / Sportive / Berline |
| `Car Price/Day` | Event | `car_price_per_day` | Range de prix qui convertit |
| `Rental Duration` | Event | `duration` | Quelle durée demandent les leads |
| `Rental When` | Event | `when` | Quand voyagent les leads |
| `Locale` | Event | `locale` | Répartition FR vs EN des soumissions |

---

## 7ter. Rapport Funnel Exploration (à créer dans Explorations)

Un funnel = vue entonnoir qui montre combien d'users passent de l'étape A → B → C, et **où ils décrochent**. C'est l'outil #1 pour optimiser ton parcours de conversion.

### Principe du funnel Bora Cars

```
[1] Site visit  →  [2] Browse catalogue  →  [3] View a vehicle  →  [4] Configure rental  →  [5] Lead generated
   100% users           ~ X%                    ~ Y%                    ~ Z%                    ~ W% ← ton TC final
```

L'idée : tu vois où les gens drop-off entre chaque étape, et tu sais quoi optimiser. Si beaucoup de visiteurs voient une voiture mais peu cliquent WhatsApp, c'est que la fiche voiture / le widget pricing peut être amélioré.

### Création pas-à-pas

GA4 → menu gauche **Explorations** → en haut "**Démarrer une nouvelle exploration**" → choisis le template **"Exploration de l'entonnoir"** (icône entonnoir) — **PAS** "Format libre".

Une fois sur l'exploration, tu vois 3 colonnes : **Variables** (gauche) | **Paramètres** (milieu) | **Visualisation** (droite).

**Si tu as démarré en "Format libre" par erreur** : dans la colonne Paramètres → dropdown **TECHNIQUE** → change pour `Exploration de l'entonnoir`. Le panneau se reconfigure automatiquement.

### Configuration de l'exploration

**Colonne Variables (gauche)** :
- **NOM DE L'EXPLORATION** : `Funnel Lead — Bora Cars`
- **PLAGE DE DATES** : `Les 28 derniers jours` (ou 7 derniers jours au début, quand peu de data)
- **DIMENSIONS** : drag `Event name`, `Page path`, `Car Brand` (custom dim) → elles deviennent dispo dans Paramètres
- **MÉTRIQUES** : drag `Active users`, `Event count`

**Colonne Paramètres (milieu)** :
- **TECHNIQUE** : `Exploration de l'entonnoir`
- **TYPE D'ENTONNOIR** : `Entonnoir standard`
- **VISUALISATION** : `Standard`
- **OUVRIR L'ENTONNOIR** : `Désactivé` (= un user doit passer par toutes les étapes dans l'ordre — plus strict, plus représentatif)
- **AFFICHER LE TEMPS ÉCOULÉ** : `Activé` (= durée moyenne entre chaque étape)
- **DIMENSION DE L'ACTION SUIVANTE** : drag `Event name` ici (= permet de voir ce que font les drop-offs après être sortis du funnel)
- **DÉTAIL** : (optionnel) drag `Car Brand` ici → tu auras un breakdown par marque pour chaque étape

### Définir les 5 étapes du funnel

Dans la section **ÉTAPES** de la colonne Paramètres → clique **"+ Ajouter une étape"** 5 fois :

**Étape 1 — Site visit**
- Nom : `Site visit`
- Condition : `Event name` `equals` `page_view`

**Étape 2 — Browse catalogue**
- Nom : `Browse catalogue`
- Conditions (en AND) :
  - `Event name` `equals` `page_view`
  - **+ Ajouter une condition** (Et) : `Page path` `contains` `/catalogue`

**Étape 3 — View a vehicle**
- Nom : `View a vehicle`
- Condition : `Event name` `equals` `vehicle_view`

**Étape 4 — Configure rental** (intent fort)
- Nom : `Configure rental`
- Condition : `Event name` `equals` `rental_config_change`

**Étape 5 — Lead generated** (conversion finale)
- Nom : `Lead generated`
- Condition : `Event name` `equals` `whatsapp_click`
- **+ Ajouter une condition** mais en **Ou** (OR — change le `Et` en `Ou`) : `Event name` `equals` `contact_form_submit`

### Sauvegarder

Les Explorations Save automatiquement. Tu retrouveras `Funnel Lead — Bora Cars` dans **Explorations** (menu gauche) la prochaine fois que tu reviens.

### Comment lire le funnel

| Métrique | Signification |
|---|---|
| **Conversion rate** entre étape N et N+1 | % des users de l'étape N qui passent à N+1. Si tu vois 60% catalogue→car, 5% car→config, 30% config→lead → la friction est entre "voir une voiture" et "configurer la location" |
| **Abandons** (en rouge) | Nombre absolu de drop-offs entre étapes |
| **Temps écoulé** | Durée moyenne entre 2 étapes. Si très long, c'est qu'ils hésitent |
| **Next action** | Ce que font les drop-offs après être sortis. Si beaucoup font `page_view /catalogue` après abandon `car`, c'est qu'ils continuent de chercher |

### Breakdown utile pour Bora Cars

Une fois le funnel créé, drag la dim `Car Brand` dans **DÉTAIL** → tu verras le funnel décomposé par marque. Ça te dit quelles marques convertissent mieux. Idem avec `CTA Source` pour voir d'où viennent les conversions.

### ⏱️ Quand le funnel se remplit

- Les premiers chiffres apparaissent rapidement avec les events reçus
- Pour avoir des chiffres significatifs : besoin de ~100 sessions / étape minimum → quelques jours/semaines selon ton trafic
- Si "Aucune donnée disponible" : vérifie ta plage de dates et que tu as bien des events reçus dans la période

### Autres funnels utiles à créer plus tard

- **Funnel par locale** : split FR vs EN (filtrer sur `Locale` event param)
- **Funnel home → contact direct** : `home page_view` → `menu CTA click` (avec `source = menu`) → `contact_form_submit`
- **Funnel mobile vs desktop** : breakdown par `Device category` (built-in GA4)

---

## 8. Plus tard — ajouter Meta / Google Ads / LinkedIn

Quand tu lances tes campagnes payantes, **tout se passe dans GTM** (zéro touche au code). Le workflow type :

### 8.1 Meta Pixel (Facebook / Instagram Ads)

**Prérequis** : créer le Pixel dans Meta Business Manager → tu récupères un Pixel ID (numérique).

#### Tag base (chargement du pixel)
- Tags → **New** → **Custom HTML**
- Colle le code Meta Pixel "base" :

```html
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>
```

- Trigger : `Initialization - All Pages` (charge tôt)
- **Consent Settings** : "Require additional consent for tag to fire on" → coche `ad_storage`
- Nom : `Meta Pixel - Base`
- Save

#### Tag conversion Lead (sur whatsapp_click + contact_form_submit)

D'abord créer un trigger dédié :
- Triggers → New → Custom Event
- Event name : `whatsapp_click|contact_form_submit`
- ✅ Use regex matching
- Nom : `Custom - Lead Events`

Puis le tag conversion :
- Tags → New → Custom HTML
- Code :

```html
<script>
fbq('track', 'Lead', {
  content_name: {{Event}},
  content_category: {{DLV - car_brand}},
  value: {{DLV - car_price_per_day}},
  currency: 'EUR'
});
</script>
```

- Trigger : `Custom - Lead Events`
- Consent : `ad_storage` required
- Nom : `Meta Pixel - Lead`
- Save

### 8.2 Google Ads Conversion Tracking

**Prérequis** : créer une conversion dans Google Ads (Tools → Conversions → New conversion action → Website). Tu récupères un **Conversion ID** (`AW-XXXXXXXXX`) et un **Conversion Label** (`abc123`).

#### Tag conversion
- Tags → New → **Google Ads Conversion Tracking**
- **Conversion ID** : `AW-XXXXXXXXX`
- **Conversion Label** : `abc123`
- **Conversion Value** : `{{DLV - car_price_per_day}}` (ou laisse vide)
- **Currency Code** : `EUR`
- Trigger : `Custom - Lead Events` (créé en §8.1) — ou un trigger dédié `whatsapp_click` selon ta stratégie
- Consent : `ad_storage` required
- Nom : `Google Ads - Lead Conversion`
- Save

#### Lier Google Ads à GA4

GA4 → **Admin** → colonne Property → section **Associations de produits** → **Associations à Google Ads** → **Link** → choisis ton compte Google Ads. Permet d'importer les conversions GA4 dans Google Ads pour optimisation des campagnes.

### 8.3 LinkedIn Insight Tag

**Prérequis** : créer le LinkedIn Insight Tag dans Campaign Manager → tu récupères un **Partner ID** (numérique).

- Tags → New → **LinkedIn Insight Tag**
- **Insight Tag ID** : `XXXXXXX`
- Trigger : `All Pages`
- Consent : `ad_storage` required
- Nom : `LinkedIn Insight - Base`
- Save

Pour tracker une conversion Lead spécifique, créer une **Conversion** dans LinkedIn Campaign Manager (avec un Conversion ID), puis :
- Tags → New → Custom HTML
- Code :
```html
<script type="text/javascript">
  window.lintrk('track', { conversion_id: XXXXXXX });
</script>
```
- Trigger : `Custom - Lead Events`
- Consent : `ad_storage` required

### 8.4 Workflow récap quand tu ajoutes une nouvelle plateforme

1. Récupère l'ID/Pixel/Tag chez l'annonceur (Meta, Google Ads, LinkedIn, TikTok…)
2. GTM → New Tag → choisis le type officiel si disponible (templates Google Ads, LinkedIn Insight) OU Custom HTML
3. Trigger : selon le besoin
   - Tracking permanent → `All Pages` ou `Initialization - All Pages`
   - Conversion lead → `Custom - Lead Events` (whatsapp_click + contact_form_submit)
   - Event spécifique → trigger Custom Event dédié
4. Consent Settings : **toujours** `ad_storage` required (pour respect RGPD)
5. Preview → test → Submit → Publish

Ces étapes s'enchainent pour TikTok Pixel, Bing UET, Snapchat Pixel, Reddit Pixel, etc. Le pattern est identique.

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
| `catalogue_car_click` | Clic sur une car card dans /catalogue | `car_id`, `car_slug`, `car_brand`, `car_model`, `position`, `source: 'catalogue'` |
| `faq_toggle` | Open/close d'une question FAQ | `question_index`, `question_text`, `expanded_state` (bool) |
| `back_to_top_click` | Clic sur "Retour en haut" du footer | `page`, `scroll_depth_percent` |
| `catalogue_filter` | (futur) Application d'un filtre | `filter_type`, `filter_value` |
| `consent_granted` | Cookie accepted (analytics OR marketing OR functional) | — |
| `consent_denied` | Cookie refused (tous off) | — |

---

## 9bis. Gaps de tracking identifiés (audit site)

Audit du repo Bora Cars — interactions existantes qui ne sont **PAS** trackées et qui auraient de la valeur. Classé par priorité business.

### 🔴 HIGH PRIORITY (signaux directs revenue/lead)

| Interaction | Fichier | Event | Params | Statut |
|---|---|---|---|---|
| **Click sur une car card du catalogue** | `components/elements/CatalogueCard.vue` | `catalogue_car_click` | `car_id`, `car_slug`, `car_brand`, `car_model`, `position`, `source: 'catalogue'` | ✅ Câblé en code |
| **Hero CTA** sur home/proprietaire/professionnel | `components/elements/Hero1.vue`, `Hero2.vue`, `Hero3.vue` | Capté en `whatsapp_click`/`external_link_click` via `BaseLink` + enrichi `source` | `source` = `home_hero` / `proprietaire_hero` / `professionnel_hero` (calculé depuis `useRoute().path`) | ✅ Câblé en code |
| **FAQ toggle** | `components/elements/Faq.vue` (fonction `toggle`) | `faq_toggle` | `question_index`, `question_text`, `expanded_state` (bool — la nouvelle valeur) | ✅ Câblé en code |
| **Back-to-top click** | `components/app/Footer.vue` (fonction `scrollToTop`) | `back_to_top_click` | `page` (= route.path), `scroll_depth_percent` (0-100 selon position scroll au moment du click) | ✅ Câblé en code |
| **Service card click** | `components/elements/ServiceCard.vue` | `service_card_click` | `card_type`, `card_label`, `page`, `position` | ⏳ Pas encore câblé |

### 🚨 Action GTM requise après ce code update

Pour que les 3 NOUVEAUX events (`catalogue_car_click`, `faq_toggle`, `back_to_top_click`) arrivent dans GA4, il faut :

**1. Étendre la regex du trigger `Custom - Bora Events`** dans GTM :

```
page_view|vehicle_view|whatsapp_click|email_click|phone_click|external_link_click|contact_form_submit|contact_form_error|rental_config_change|language_switch|car_gallery_browse|consent_granted|consent_denied|catalogue_car_click|faq_toggle|back_to_top_click
```

(Just ajouté à la fin : `|catalogue_car_click|faq_toggle|back_to_top_click`)

**2. (Optionnel) Créer les DLVs pour les nouveaux params** si tu veux les voir dans GA4 :

| Nom GTM | Data Layer Variable Name | Utilisé par |
|---|---|---|
| `DLV - position` | `position` | `catalogue_car_click` |
| `DLV - question_index` | `question_index` | `faq_toggle` |
| `DLV - question_text` | `question_text` | `faq_toggle` |
| `DLV - expanded_state` | `expanded_state` | `faq_toggle` |
| `DLV - scroll_depth_percent` | `scroll_depth_percent` | `back_to_top_click` |
| `DLV - page` | `page` | `back_to_top_click` |

Puis ajouter chacune dans le tag `GA4 Event - Bora Generic` (section Paramètres de l'événement).

**3. (Optionnel) Custom Dimensions GA4** pour les params que tu veux breakdownner dans les rapports :
- `Position in catalogue` (Event scope, param `position`) — pour analyser quelles positions de catalogue convertissent
- `FAQ Question` (Event scope, param `question_text`) — top des objections

Note : les params `car_id`, `car_brand`, `car_model`, `source` utilisés par les nouveaux events ont déjà leurs DLVs créées (étape 3.2 du setup initial). Donc seuls les nouveaux params (`position`, `question_*`, `expanded_state`, `scroll_depth_percent`, `page`) nécessitent de nouvelles DLVs.

### 🟡 MEDIUM PRIORITY (signaux optim/engagement)

| Interaction | Fichier | Event recommandé | Params | Pourquoi |
|---|---|---|---|---|
| **Infinite scroll catalogue** | `pages/catalogue.vue` (`useInfiniteScroll`) | `catalogue_scroll_more` | `loaded_car_count`, `total_cars`, `page_number` | Mesure profondeur de scroll catalogue + perf de chargement. |
| **Retour catalogue depuis fiche car** | `components/page/car/Hero.vue` (bouton back) | `car_detail_back_click` | `car_id`, `session_duration` | Indicateur de bounce sur fiche voiture. |
| **Testimonial carousel prev/next** | `components/elements/Testimonials.vue` | `testimonial_nav` | `direction` (prev/next), `testimonial_index`, `page` | Engagement avec social proof. |
| **Process steps interaction** | `components/elements/ProcessSteps.vue` (si clickable) | `process_step_click` | `step_index`, `step_name`, `page` | Engagement avec explication du parcours. |

### 🟢 LOW PRIORITY (nice-to-have)

| Interaction | Fichier | Event recommandé | Params | Pourquoi |
|---|---|---|---|---|
| **Vue page légale** | `pages/legal/[slug].vue` | `legal_page_view` | `page_slug`, `referrer` | Signal trust/compliance, faible intent. |
| **Mobile menu open/close** | `components/app/Menu.vue` (watch `menuOpen`) | `mobile_menu_toggle` | `state`, `device`, `page` | UX metric — identifie friction nav mobile. |
| **Brand hover** | `components/elements/BrandsSection.vue` | `brand_hover` | `brand_name`, `page` | Très optionnel — utile uniquement si les brands deviennent clickables. |

### 🚨 Gaps critiques

1. **Hero CTAs sans contexte source** — les Hero1/2/3 firent en `whatsapp_click`/`external_link_click` via BaseLink mais sans `source`. **Fix rapide** : ajouter `:tracking-extra="{ source: 'home_hero' }"` (ou `proprietaire_hero`, etc.) sur les `<AtomsCTA>` des hero components. Pattern identique à `Pricing.vue` qui le fait déjà avec `source: 'car_pricing'`.

2. **Catalogue card clicks pas trackés** — actuellement on sait qu'un user arrive sur `/car/[uid]` (via `vehicle_view`) mais on ne sait pas D'OÙ il vient (catalogue vs lien direct vs recherche). Ajouter `catalogue_car_click` permet de mesurer le funnel catalogue → vehicle_view.

3. **FAQ — angle mort total** — la FAQ est typiquement remplie de questions qui révèlent les objections clients. Sans tracking, on ne sait pas quelles sont les top objections.

4. **Infinite scroll non instrumenté** — combien d'users vont au-delà des 12 premières voitures ? Pour un catalogue payant ça serait crucial.

### Plan d'instrumentation suggéré (par ordre d'effort/impact)

| Step | Effort | Impact | Quoi |
|---|---|---|---|
| 1 | 5 min | 🔥 HIGH | Ajouter `:tracking-extra="{ source: 'home_hero' }"` (etc.) sur les Hero CTAs. Pattern Pricing.vue à reproduire. |
| 2 | 10 min | 🔥 HIGH | Ajouter helper `trackCatalogueCarClick` dans `useAnalytics.ts` + wire dans `CatalogueCard.vue`. |
| 3 | 10 min | 🔥 HIGH | Ajouter `trackFaqToggle` dans `useAnalytics.ts` + wire dans `Faq.vue` (`toggle()` function). |
| 4 | 5 min | 🟡 MED | `trackBackToTop` dans Footer + scroll_depth_percent via `window.scrollY` au moment du click. |
| 5 | 10 min | 🟡 MED | `trackCatalogueScroll` dans catalogue page (sur le `useInfiniteScroll` trigger). |
| 6 | 15 min | 🟡 MED | Reste des MED : testimonials, process steps, car detail back. |

**Total** : ~1h de dev pour combler tous les gaps HIGH + MED. À planifier sur un sprint analytics dédié.

### Note importante — quand t'ajoutes un event

Le pattern complet pour ajouter un nouvel event :

1. **Code** : ajouter un helper `trackXxx()` dans `app/composables/useAnalytics.ts` (suivre le pattern existant).
2. **Code** : appeler le helper dans le composant (`useAnalytics().trackXxx(...)`).
3. **GTM** : ajouter le nom de l'event à la regex du trigger `Custom - Bora Events` (`page_view|...|new_event_name`).
4. **GTM (si nouveaux params)** : créer les DLVs correspondantes + les ajouter au tag `GA4 Event - Bora Generic` (paramètres de l'événement).
5. **GTM** : publier la nouvelle version (Submit).
6. **GA4** (optionnel) : si tu veux breakdown par ce param, créer une Custom Dimension.
7. **GA4** (optionnel) : si c'est une conversion → marquer comme "événement clé" (après 24h d'agrégation).

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
