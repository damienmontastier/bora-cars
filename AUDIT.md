# Audit technique — boracars.com (`web/`)

**Date :** 16/09/2026 — **mise à jour le 16/09/2026** après les étapes 1 et 2 de corrections.
**Périmètre :** SEO, i18n, analytics, performance, accessibilité, qualité.
**Audit initial réalisé en lecture seule.** Les corrections faites ensuite sont listées dans « Suivi des corrections » et signalées par un statut sur chaque point. Elles sont sur `develop`, **non commitées et non déployées**.

## Méthode et limites

- **Code audité :** branche `develop` (`efe6e71`, branche courante).
- **Site en prod :** https://boracars.com tourne sur `main` (`818ac47`, 30/07), soit **2 commits de retard** sur `develop`. Ces 2 commits touchent 35 fichiers de `web/` : page bio, devise CHF, balises OG/Twitter, API contact, montée Nuxt 4.5 / Vite 8.
- **Sources croisées :**
  - relecture du code ;
  - crawl HTTP des 50 URLs du sitemap et des liens internes/externes ;
  - Chrome headless : console, requêtes, `dataLayer`, captures ;
  - lecture de Sanity (`production`) ;
  - analyse du conteneur GTM publié ;
  - `eslint` sans `--fix`.
- **Limites :**
  - Pas de `nuxt build` local ni de Lighthouse : les poids de bundle sont mesurés sur la prod.
  - Pendant l'audit, Google a renvoyé des 429 à l'IP d'audit : le **chargement effectif de `gtm.js` et l'envoi des hits GA4 n'ont pas pu être observés** dans le navigateur. À confirmer avec Tag Assistant (voir I-A4).

**Légende des étiquettes :**

| Étiquette | Signification |
|---|---|
| `[prod+develop]` | Présent en prod et toujours dans `develop` |
| `[develop]` | Régression introduite dans `develop`, visible au prochain déploiement |
| `[prod]` | Présent en prod, déjà corrigé dans `develop` (il suffit de déployer) |
| `[Sanity]` | Correction de contenu dans le Studio, sans déploiement |

**Légende des statuts :**

| Statut | Signification |
|---|---|
| ✅ | Corrigé (code local sur `develop`, vérifié sur un build de production, pas encore déployé) ou vérifié sans action |
| ➖ | Accepté en l'état (décision) |
| 🟡 | Partiellement corrigé |
| ⬜ | À faire |

---

## Synthèse

| Sévérité | Total | ✅ Corrigés | 🟡 Partiels | ➖ Acceptés | ⬜ Restants |
|---|---|---|---|---|---|
| 🔴 Bloquant | 6 | 6 | 0 | 0 | 0 |
| 🟠 Important | 34 | 9 | 4 | 1 | 20 |
| 🟡 Mineur | ~46 | 0 | 0 | 0 | ~46 |

## Suivi des corrections

### Étape 1 — régressions de `develop` (à corriger avant le merge)

| Point | Correction | Vérification |
|---|---|---|
| ✅ B1 | `:where(...)` sur les styles racine des 10 composants `svg/*.vue` : une classe du parent l'emporte quel que soit l'ordre du CSS | Build de prod local : les 81 écarts de styles avec la prod passent à 0 pour le menu (7 pages × desktop/mobile) |
| ✅ B3 | `fillWhatsappTemplate` retire un `€` collé à `{prix}` ; aperçu du Studio et aide des champs alignés (`WhatsappTemplatesInput.tsx`, `carPage.ts`) | develop.boracars.com : « 900 €€/par jour » ; build corrigé : « 900 €/par jour » |
| ✅ I-C4 | Le formulaire envoie `subjectKey` ; le serveur envoie toujours le libellé **FR** à Airtable (repli : libellé dans une autre langue, puis « Autre ») | Testé sur les vraies options Sanity ; API testée avec de faux identifiants Airtable (aucun enregistrement créé) |

### Étape 2 — correctifs de code

| Point | Correction | Vérification |
|---|---|---|
| ✅ B2 | URL du message WhatsApp = `siteUrl` + `route.path` (`useCarContact.ts`) | Message généré : URL du site, plus de `localhost` ni d'hôte de requête |
| ✅ B5 | Lien « Gérer les cookies » dans `Footer.vue` et `FooterMini.vue`, qui appelle `useCookies().openSettings()`. Nouvelle clé du glossaire `footer.manageCookies` (FR « Gérer les cookies », EN « Manage cookies »), **publiée dans Sanity** | Clic → fenêtre `app-cookies--settings` ouverte |
| ✅ B6 | Nouvelles props `ratio` / `mobileRatio` / `mobileSizes` sur `ElementsMedia` : `<picture>` webp **q90** recadré par le CDN, une source mobile (portrait 414/680) et une desktop (paysage 1920/950), un preload par media | Porsche 911 : desktop 768 → 192 Ko, retina 3,8 Mo → 559 Ko, mobile 3x 393 → 375 Ko (au bon format) |
| ✅ I-S1 | `tag="h1"` sur `contact.vue` et `Hero2` ; `tag="p"` sur les noms du marquee | Exactement 1 `<h1>` sur les 8 pages testées |
| ✅ I-S2 | `useOgImageUrl()` : og:image 1200×630 **JPEG** q90 recadrée (hotspot + crop), `ogImageSize()` lit `w`/`h` | Porsche 3,4 Mo → 149 Ko ; RS6 8,1 Mo → 260 Ko ; dimensions JPEG réelles 1200×630 |
| ✅ I-P1 | Imports dynamiques dans `03.pane.client.js` + hook `build:manifest` (sinon Nuxt ajoutait un `<link rel="prefetch">` vers le chunk) | En runtime prod : chunk jamais demandé, panneau absent ; hors prod : panneau présent |
| ✅ I-X1 | `:focus-visible { outline: 2px solid currentColor }` dans `main.scss` + `:focus-within` sur la recherche du catalogue | Tab au clavier : contour de 2 px visible |
| 🟡 I-Q1 | Limites de taille vérifiées avant la regex (email ≤ 254, message ≤ 10 000…), métadonnées tronquées, regex d'email linéaire | Email piégé de 200 000 caractères : 422 en 4 ms (l'ancienne regex prenait 231 ms pour 20 000). **Reste : limitation de débit** |

### Contenu Sanity — pages légales

| Point | Correction | Vérification |
|---|---|---|
| ✅ B4 | Politique de confidentialité et CGL converties du Markdown brut en Portable Text (FR + EN), **publiées** : `##` → `h3`, `###` → paragraphe en gras, listes `-`/`1.` → puces, `**gras**` → gras, emails et URLs → liens, tableaux → une puce par ligne (« **Finalité** — Base légale : … »). Supprimés : titre `#` (doublon du titre de page), en-tête « BORA CARS » avec la date écrite à la main, séparateurs `---`. Le brouillon en attente de la confidentialité (qui retirait déjà cette date) est inclus | Contrôle automatique : aucun mot du texte juridique perdu, hors intitulés de 1ʳᵉ colonne des tableaux et numéros « 1. 2. 3. ». develop.boracars.com (FR + EN) : 0 Markdown visible, 10 et 15 `h3`. **La prod (prérendue) affichera le nouveau contenu au prochain build** (outil « Publier » du Studio) |

### Constaté pendant les corrections
- **I-C3 corrigé côté contenu :** le téléphone du footer est maintenant un vrai lien `tel:` (champ renseigné dans Sanity). Le garde-fou de code reste à faire.
- **Recette visuelle :** comparaison des styles calculés entre le build corrigé et la prod sur 7 pages × 2 formats. Seuls écarts : la colonne « Légal » du footer (nouveau lien cookies), le lien téléphone (contenu Sanity) et un état invisible du bouton replié du menu sur l'accueil (déjà présent avant correction).
- **Modification étrangère à l'audit** dans `web/app/components/app/Cookies.vue` (transition du bandeau avec flou progressif) : elle n'a pas été faite dans le cadre de ces corrections, à vérifier avant de commiter.
- **Décision qualité d'image :** la qualité globale reste à **90** en webp. Les gains de poids passent par le recadrage et des `sizes` justes, pas par une baisse de qualité (recommandations I-P3 et I-P5 ajustées en conséquence).

**Ordre de traitement conseillé pour la suite :**
1. Commiter et déployer (les étapes 1 et 2 corrigent 5 bloquants ; B4 est déjà publié dans Sanity et partira avec le prochain build).
2. Contenu Sanity : points `[Sanity]` restants (I-C7 à valider avec le client).
3. Réglages GTM / GA4 et décisions client.
4. Perf restante, puis accessibilité.

---

## 🔴 Bloquant

### ✅ B1 — Logo du menu affiché à 300×300 px sur develop `[develop]`
- **Fichiers :**
  - `web/app/components/app/Menu.vue:304` (`<SvgLogoMinimal class="app-menu__logo">`) ;
  - `web/app/components/svg/LogoMinimal.vue` (`.svg-logo-minimal { width:100%; height:100% }`).
- **Constat :**
  - Mesuré en headless : `.app-menu__logo-wrap` fait **300×300 px** sur develop.boracars.com, contre **57×57 px** en prod. Même écart en mobile.
  - Les deux règles ont la même spécificité (0,1,0), donc la dernière déclarée gagne.
  - En prod, `.svg-logo-minimal` est déclarée avant `.app-menu__logo` (octets 8 088 puis 9 341 du `<head>`). Sur develop, l'ordre est inversé (23 498 après 13 229) : le `width:100%` de l'enfant l'emporte et le SVG prend sa taille par défaut.
  - C'est la montée Nuxt 4.4.8 → 4.5.2 (Vite 8 : Rolldown + Lightning CSS) qui a changé l'ordre des styles inlinés.
  - En local, `nuxt dev` injecte les styles dans l'ordre d'import des modules, donc le bug n'apparaît pas.
- **Même risque ailleurs** (parent qui surcharge la classe racine d'un composant SVG) :
  - `Footer.vue:44` (`.app-footer__logo`) ;
  - `FooterMini.vue:51` ;
  - `Hero1.vue:281` ;
  - `Testimonials.vue:217-220` ;
  - `MenuCTA.vue:34` ;
  - plus les nombreux `Texts*` qui reçoivent une classe.
- **Fix :**
  - **Correctif de fond :** passer la spécificité des styles racine des composants « atomiques » à zéro, pour que toute classe parente gagne quel que soit l'ordre. Par exemple `:where(.svg-logo-minimal) { display:block; width:100%; height:100%; }`, idem pour `svg/*.vue` et `texts/*.vue`.
  - **Correctif rapide :** `.app-menu .app-menu__logo { … }` dans `Menu.vue`.
  - Dans les deux cas, faire une recette visuelle develop vs prod (menu, footer, hero, témoignages).

### ✅ B2 — Messages WhatsApp des fiches voiture : lien `http://localhost/...` `[prod+develop]`
- **Fichier :** `web/app/composables/useCarContact.ts:40,112` (`url: requestUrl.href` avec `useRequestURL()`).
- **Constat :**
  - Les fiches sont prérendues. Pendant le prerender, `useRequestURL()` vaut `http://localhost/...`, et cette valeur est figée dans l'attribut `href`.
  - Vue ne corrige pas les attributs à l'hydratation, et le computed ne change pas tant que l'utilisateur ne touche ni la durée ni la date.
  - Vérifié sur les 32 fiches FR et EN. Exemple sur `/fr/voiture/porsche-911` : `…à partir de ce week-end… http://localhost/fr/voiture/porsche-911`.
  - Chaque lead WhatsApp reçu depuis une fiche contient donc un lien mort.
- **Statut :** ✅ corrigé (voir « Suivi des corrections »). `ContactForm.vue:32` (`pageUrl`) garde `useRequestURL()`, sans effet visible car recalculé côté client.
- **Fix :** construire l'URL comme `bio/Story.vue:63` le fait déjà : `` url: `${useSiteConfig().url}${useRoute().path}` `` (identique au serveur et au client).
  - Même principe pour `ContactForm.vue:32` (`pageUrl`) : aujourd'hui sans effet visible car recalculé côté client, mais fragile.

### ✅ B3 — « 650 €€/par jour » dans le message WhatsApp `[develop]` + `[Sanity]`
- **Fichiers :**
  - `web/app/composables/useCarContact.ts:58-61,108` (`formatPrice` en `style: 'currency'`) ;
  - Sanity `carPage.whatsapp.{withPrice,simpleWithPrice}[fr|en]`.
- **Constat :**
  - Les modèles Sanity contiennent `{prix}€/{periode}`.
  - En prod (`main`), `{prix}` est un nombre sans symbole, donc « 900€/par jour » (correct).
  - Sur `develop`, `{prix}` contient déjà « 900 € », donc « **900 €€/par jour** » (EN : « €650€/per day »). La régression arrive avec le déploiement.
  - Autre point de formulation : « à partir de {quand} » donne « à partir de aujourd'hui ».
- **Fix :**
  - Au moment du déploiement (pas avant, sinon la prod perd son €), passer les modèles à `à {prix} {periode}` / `at {prix} {periode}`.
  - Ou, sans dépendre du timing : retirer côté code un `€` qui suit immédiatement `{prix}` dans `fillWhatsappTemplate`.
  - Reformuler « pour {quand} ».
- **Statut :** ✅ corrigé côté code (option « sans dépendre du timing »). Après déploiement, le nettoyage `{prix}€` → `{prix}` dans Sanity est optionnel. La reformulation « à partir de {quand} » reste à faire dans le contenu.

### ✅ B4 — Politique de confidentialité et CGL affichées en Markdown brut `[Sanity]`
- **Emplacement :**
  - Sanity `ebccf41a-741b-4ab9-ba66-5adf2df8b44e` (confidentialité) et `9c057ba9-b200-4763-b25c-fec30ebacf39` (CGL), champ `content` ;
  - rendu par `web/app/pages/legal/[slug].vue` et `web/app/utils/portableText.ts`.
- **Constat :**
  - Le texte est collé en Markdown dans des blocs `normal`.
  - Le HTML en ligne affiche littéralement `# Politique de Confidentialité`, `**BORA CARS**`, `| Finalité | Base légale |`, `|---|---|`.
  - Les tableaux RGPD (bases légales, durées, cookies) sont illisibles, alors que c'est la page citée comme base du consentement dans le formulaire de contact.
- **Fix :**
  - Ré-importer ces deux documents en Portable Text (titres `h2`/`h3`, listes, marks `strong`). Les mentions légales (`67d64f9e…`) sont propres et peuvent servir de modèle.
  - Pour les tableaux : ajouter un type `table` (`@sanity/table`) et son rendu dans `portableText.ts`, ou les convertir en listes.
- **Statut :** ✅ corrigé et publié (tableaux convertis en listes, compatibles avec le code déjà en prod). Voir « Suivi des corrections ».

### ✅ B5 — Impossible de modifier ou retirer son consentement cookies `[prod+develop]`
- **Fichiers :**
  - `web/app/composables/useCookies.ts:104` (`openSettings`) ;
  - `web/app/components/app/Cookies.vue:109` (seul appelant) ;
  - `web/app/components/app/Footer.vue`, `FooterMini.vue`.
- **Constat :**
  - Une fois le bandeau fermé, aucun lien « Gérer les cookies » n'existe (aucun autre appel à `openSettings`/`showBanner`).
  - Le cookie de consentement vit 12 mois.
  - Le RGPD (art. 7.3) et la CNIL exigent qu'on puisse retirer son consentement aussi facilement qu'on l'a donné.
- **Fix :** ajouter dans le footer (et `FooterMini`) un bouton « Gérer les cookies » qui appelle `useCookies().openSettings()`, avec un libellé dans le glossaire. Le mentionner dans la politique de confidentialité.

### ✅ B6 — Fiche voiture : image LCP non recadrée, 1,85 à 7,9 Mo pour le hero `[prod+develop]`
- **Fichiers :**
  - `web/app/components/page/car/Hero.vue:91-103` ;
  - `web/app/components/elements/Media.vue:169-183`.
- **Constat :**
  - Les sources sont en portrait (ex. 4000×6000) pour un cadre en paysage (`49.48vw`). Seule la largeur est demandée, donc le candidat `w=1920` fait 1920×2880 et CSS en rogne la moitié.
  - Les 3 slides sont en `:lazy="false"`, en q=90.
  - Mesuré sur `/fr/voiture/porsche-911` :

    | Écran | Poids total |
    |---|---|
    | 1920 px, densité 1 | **1,85 Mo** |
    | Retina ≥ 1440 px | **7,9 Mo** |
    | Même visuel recadré 1920×950 (webp) | ≈ 90 Ko en q=75, 192 Ko en q=90 |

  - Ce sont les pages d'atterrissage Google et Instagram.
- **Fix :**
  - Recadrer côté CDN au format du cadre, avec une source mobile distincte (le cadre mobile est en portrait).
- **Statut :** ✅ corrigé via les props `ratio` / `mobileRatio` de `ElementsMedia` (webp q90), voir « Suivi des corrections ». Les slides restent en `eager` + `fetchpriority=low` pour éviter un chargement visible au glisser.

---

## 🟠 Important

### SEO

#### ✅ I-S1 — H1 absent ou multiple `[prod+develop]`
- **Fichiers :**
  - `web/app/pages/contact.vue:23` (`<TextsH2>` sans `tag`) ;
  - `web/app/components/elements/Hero2.vue:120` (heading en h2) ;
  - `web/app/components/elements/FullscreenMarquee.vue:106,128` (`<TextsH1>` pour chaque voiture).
- **Constat :**
  - Aucun `<h1>` sur `/fr/contact`, `/en/contact`, `/fr/proprietaire`, `/en/owner`.
  - **13 `<h1>`** sur `/fr/professionnel` et `/en/business` (hero + 12 noms de voitures du marquee, dont les copies dupliquées), avec en plus un `<h1>` dans un `<a>`.
- **Fix :**
  - `tag="h1"` sur le titre de `contact.vue` et sur le heading de `Hero2` ;
  - `tag="span"` (ou `p`) sur les items de `FullscreenMarquee` ;
  - au passage, `tag="span"` sur le clone de survol des questions FAQ (`Faq.vue:242`, double `<h3>`) et sur les numéros d'étape.

#### ✅ I-S2 — `og:image` des fiches voiture : originaux de 3 à 8 Mo en portrait `[prod+develop]`
- **Fichiers :**
  - `web/app/queries/car.ts:81` (`"ogImageUrl": image.asset->url`) ;
  - `web/app/queries/fragments.ts:81` (`seo.image.asset->url`) ;
  - `web/app/utils/index.ts:171` (`ogImageSize`).
- **Constat :**
  - Exemples : `audi-rs6` PNG 8,1 Mo, `audi-rs5-2026` 7,6 Mo, `classe-a-200d` 6 Mo, `porsche-911` 3,4 Mo en 4000×6000.
  - WhatsApp et LinkedIn abandonnent l'aperçu au-delà de ~300 Ko ; le portrait est mal recadré en 1,91:1.
  - `ogImageSize()` renverra en plus les dimensions de l'original.
- **Fix :**
  - Projeter `image.asset->url + "?w=1200&h=630&fit=crop&crop=focalpoint&fm=jpg&q=80"` (ou via `@sanity/image-url`, en tenant compte du hotspot) ;
  - faire renvoyer 1200×630 à `ogImageSize()` quand `w`/`h` sont présents.

#### ⬜ I-S3 — Cartes de service de l'accueil : URL FR absolue en nouvel onglet, même sur `/en` `[Sanity]` + `[prod+develop]`
- **Fichiers :**
  - Sanity `homepage` (module `serviceCards`, liens de type `external`) ;
  - `web/app/components/utils/BaseLink.vue:39-47,91-99`.
- **Constat :**
  - Sur `/en`, les 5 cartes pointent vers `https://boracars.com/fr/catalogue` (etc.) avec `target="_blank"`.
  - Conséquences : le visiteur EN bascule en FR, un nouvel onglet s'ouvre, le clic est compté en `external_link_click`, et le maillage interne EN perd ces liens.
- **Fix :**
  - Repasser ces liens en type `internal` dans Sanity.
  - En garde-fou dans `BaseLink`, traiter une URL `https://boracars.com/...` comme interne : retirer le préfixe de locale et passer par `NuxtLinkLocale`, sans `_blank`.

#### ✅ I-S4 — Sélecteur de langue du menu sur les pages légales : mauvais slug + pages meta-refresh prérendues `[prod+develop]`
- **Fichiers :**
  - `web/app/components/app/MenuLangSwitcher.vue:120` (`switchLocalePath`) ;
  - `web/app/pages/legal/[slug].vue:53` (`useSetI18nParams`) ;
  - `web/nuxt.config.ts` (`nitro.prerender`).
- **Constat :**
  - Le menu est rendu dans `app.vue` avant que la page ne pose les slugs traduits. Il pointe donc vers `/en/legal/mentions-legales` au lieu de `/en/legal/legal-notice` (et inversement). Le footer, rendu après, est correct.
  - `crawlLinks` a matérialisé **6 pages `200` en meta-refresh**, sans canonical ni noindex.
- **Fix :**
  - Calculer le `href` du switcher après hydratation, ou y lire directement `slugEn`/`slugFr`.
  - Ajouter ces chemins à `nitro.prerender.ignore`.
- **Statut :** ✅ corrigé (non déployé).
  - `MenuLangSwitcher.vue` utilise `<SwitchLocalePathLink>` : `@nuxtjs/i18n` corrige le `href` côté serveur une fois la page rendue.
  - Au clic, le chemin est recalculé en phase capture (comme avant).
  - Les liens sont remontés à chaque `page:finish`, car les paramètres i18n vivent dans un `route.meta` non réactif.
  - Vérifié sur build de prod : `href` correct en SSR sur 10 types de pages (menu et footer), et correct après navigation interne (test sur une origine autorisée par le CORS Sanity).
  - Plus aucun lien ne mène aux 6 pages meta-refresh : le prochain prerender ne les générera plus. Dans GSC, « Valider la correction » sur « Page avec redirection » après déploiement.
  - **Bug trouvé grâce au test manuel, déjà présent en prod** : sur une page légale, le switch de langue revenait immédiatement dans la langue de départ. `legal/[slug].vue` choisissait le slug canonique d'après `locale`, qui vaut encore l'ancienne langue pendant la navigation client (`skipSettingLocaleOnNavigate`), et redirigeait donc vers l'ancienne langue. Corrigé en utilisant la locale de la route (`useSanityLang()`), aussi passée à `localePath`.
  - Avertissement d'hydratation du lien supprimé avec `data-allow-mismatch="attribute"` : le `href` serveur est le bon.
  - Vérifié avec de vrais clics souris dans les deux sens : FR → EN et EN → FR sur les pages légales, accueil, fiche voiture. Bonne URL et bonne langue d'arrivée, un seul `language_switch`, aucune erreur ni avertissement d'hydratation (serveur dev).

#### ⬜ I-S5 — `Product.offers.availability` en dur à `InStock` `[prod+develop]` + `[Sanity]`
- **Fichier :** `web/app/pages/car/[uid].vue:118`.
- **Constat :** `bmw-m220i` (« ⚠ Disponible le 1er Octobre 2026 ⚠ ») et `audi-rs5-2026` (« Bientôt disponible ») sont déclarées `InStock` : données structurées trompeuses.
- **Fix :** ajouter un champ Sanity `disponibleLe` (date), puis mapper vers `PreOrder` + `availabilityStarts` tant que la date est future. Retirer les mentions de disponibilité des champs `modele` et `description`.

#### ⬜ I-S6 — Champs `marque` / `modele` pollués : titles, `brand` JSON-LD, messages `[Sanity]`
- **Emplacement :**
  - `9d838a44` : `marque` « Audi RS 5 Avant 2026 », `modele` « (Bientôt disponible) » ;
  - `4d8de0ab` : `marque` « Porsche 911 » ;
  - `adbe4690` : `marque` « Porsche Cayenne » ;
  - espaces finaux sur `e9e9a11b`, `ffc8c912`, `1656235a` ;
  - « Mercedes-Benz » et « Mercedes » coexistent.
- **Constat :**
  - Titles en ligne : `Volkswagen  T-ROC — BORA CARS` (double espace), `Audi RS 5 Avant 2026 (Bientôt disponible)  —`.
  - `brand.name` vaut « Porsche 911 » ; la facette « marque » du catalogue est faussée ; la mention FR apparaît sur les pages EN.
- **Fix :**
  - Marque seule, modèle seul, mention de disponibilité dans un champ dédié (voir I-S5).
  - Validation Studio qui refuse les espaces en bord de chaîne.
  - Côté code, `.replace(/\s+/g, ' ').trim()` sur `` `${marque} ${modele}` `` (`[uid].vue:52,105,137`).

#### ⬜ I-S7 — Contenus qui contredisent la page ou ne sont pas traduits `[Sanity]`
- **Meta descriptions :**
  - `professionnel.seo.description` : « Réponse sous 72h » (la page dit 48 h) ; EN « France only » (la page dit Paris et Genève).
  - `catalogueProfessionnel.seo.description` cite « Peugeot, Mini », qui ne sont qu'en brouillon.
- **Intro du catalogue** (`catalogue.description`, `catalogueProfessionnel.description`) : EN vide, donc le texte FR s'affiche sur `/en/catalog` et `/en/business-catalog` (repli silencieux de `queries/i18n.ts`).
- **Fix :** réécrire et traduire. En option, logger en dev quand le repli FR est utilisé sur `$lang == "en"`.

#### ⬜ I-S8 — VW T-ROC dans le sitemap mais dans aucun catalogue `[Sanity]` + `[prod+develop]`
- **Emplacement :** `ffc8c912` publié avec `clientType: []` (brouillon `["professionnel"]` en attente depuis le 02/07) ; `web/app/queries/catalogue.ts:127-131`.
- **Constat :** un tableau vide n'est ni « particulier » ni « professionnel », donc la page est orpheline (aucun lien interne) alors qu'elle est indexée.
- **Fix :** publier le brouillon ; côté code, traiter `count(clientType) == 0` comme non défini, ou rendre `clientType` obligatoire (`min(1)`).

### i18n et contenu

#### ⬜ I-C1 — Assurance : « Incluse » affiché par défaut, FR sur les pages EN `[Sanity]` + `[prod+develop]`
- **Fichiers :** `web/app/components/page/car/RentalInfo.vue:35-36`, glossaire (valeur de repli), `web/app/queries/i18n.ts`.
- **Constat :**
  - 10 voitures sans valeur affichent « Assurance : Incluse » via le repli du glossaire, alors que d'autres fiches précisent « Non incluse ». C'est une affirmation **contractuelle** jamais saisie.
  - EN vide sur 5 voitures : « Non incluse » s'affiche sur `/en/car/bmw-m220i`.
- **Fix :** faire valider par le client, remplir FR et EN pour chaque voiture, rendre le champ obligatoire dans les deux langues et supprimer le repli « Incluse ».

#### ⬜ I-C2 — Kilométrage et prix au km incohérents `[Sanity]` + `[prod+develop]`
- **Fichier :** `web/app/components/page/car/RentalInfo.vue:61-62,67`.
- **Constat :**
  - `kmJourInclus` = 2500 ou 3000 sur les offres mensuelles (`adbe4690`, `bc4b8f64`, `9d838a44`) : « Km/jour inclus 2500 km » s'affiche en ligne. `kmMoisInclus` est vide partout.
  - Le prix du km supplémentaire est masqué sans message sur 9 fiches (`prixKmSupplementaire.km` absent).
  - G63 : `{km:4, prix:4}`, soit 1 €/km contre 8 €/km pour l'Urus.
- **Fix :**
  - Déplacer les valeurs vers `kmMoisInclus`.
  - Considérer `km` absent comme `1` (code) et `initialValue: 1` (Studio).
  - Validation : avertir si `prixMensuel` est renseigné avec `kmJourInclus > 1000`.

#### 🟡 I-C3 — Numéro de téléphone du footer rendu en `<button>` inerte `[Sanity]` + `[prod+develop]`
- **Emplacement :** `footer.contactLinks[0]` (`type: "phone"`, champ `phone` vide) ; `web/app/components/utils/BaseLink.vue:37-38`.
- **Constat :** « +41 77 289 93 58 » n'est pas cliquable sur mobile.
- **Statut :** 🟡 le champ `phone` est désormais renseigné dans Sanity (lien `tel:` rendu). Restent : la validation Studio et le garde-fou de code.
- **Fix :**
  - Renseigner `phone = "+41772899358"` et rendre `phone` obligatoire quand `type == "phone"`.
  - Côté code, rendre un `<span>` plutôt qu'un `<button>` quand un lien Sanity ne se résout pas.

#### ✅ I-C4 — Airtable : « Type de demande » éclaté en options FR et EN `[develop]`
- **Fichiers :** `web/app/components/elements/ContactForm.vue:149-150`, `web/server/api/contact.post.ts:38-50,99,133`.
- **Constat :** le formulaire envoie le libellé de la langue du visiteur ; `resolveSubject` accepte toutes les langues, et `typecast: true` crée une option EN dans le CRM. Les filtres par type ratent donc les leads EN. Le libellé FR « Je veux louer un véhicule » a aussi un espace final.
- **Fix :** envoyer le `_key` de l'option et le résoudre côté serveur vers le libellé **FR** (la langue est déjà dans `Langue`).
- **Statut :** ✅ corrigé. Vérifié dans Airtable le 16/09 : aucune option EN n'a été créée, rien à fusionner.

#### ⬜ I-C5 — Page `/bio` : 404 en prod, message WhatsApp et SEO vides `[prod]` + `[Sanity]`
- **Fichiers :** `web/app/pages/bio.vue`, `web/app/components/page/bio/Story.vue:53-64` ; Sanity `bio.whatsappMessage`, `bio.seo`.
- **Constat :**
  - `/bio`, `/fr/bio` et `/en/bio` renvoient 404 en prod : la page n'existe que sur `develop`.
  - Côté Sanity, modèle WhatsApp et titre/description vides : les contacts venus d'Instagram arrivent sans la voiture ni la source.
- **Fix :**
  - Ne pas mettre le lien dans la bio Instagram avant le déploiement, puis vérifier que `/bio` renvoie bien une **301 serveur**.
  - Remplir le modèle (sans `€` en dur, voir B3) et le SEO.

#### ⬜ I-C7 — Politique de confidentialité : traceurs déclarés ≠ traceurs réels `[Sanity]`
- **Emplacement :** Sanity `ebccf41a-741b-4ab9-ba66-5adf2df8b44e`, articles 3, 5 et 7.
- **Constat :**
  - La politique déclare un **Meta Pixel** (mesure d'audience publicitaire, cookies publicitaires de 13 mois, transfert à Meta Platforms). Or le conteneur GTM publié ne contient que GA4 : pas de Meta Pixel ni de Google Ads.
  - Le tableau des cookies ne cite pas les cookies réellement déposés : `bora-cookies-consent` (choix de consentement, 12 mois), `i18n_redirected` (langue), `bora-currency` (devise), cookies GA4 `_ga` / `_ga_*`.
  - Le bandeau propose 4 catégories (nécessaires, mesure d'audience, marketing, fonctionnels) quand la politique en décrit 3.
- **Fix :** faire valider par le client. Soit retirer les mentions Meta si aucun pixel n'est prévu, soit installer le pixel derrière le consentement « marketing ». Lister les cookies réels avec leur nom et leur durée, et aligner les catégories avec le bandeau.

#### ✅ I-C8 — Formulaire de contact : l'API écrit l'ancien schéma du CRM Airtable `[prod+develop]`
- **Fichier :** `web/server/api/contact.post.ts` (objet `fields`).
- **Constat (base « CRM », table Leads, vérifié le 16/09) :**
  - L'API écrit `Source: "Site web"` et `Statut: "Nouveau"`. Le CRM a été restructuré autour de **`Canal`** (dont la description indique : « Remplace l'ancien champ Source (à supprimer après migration) »), **`Étape`** et **`Type de lead`**, que l'API ne remplit pas. Aucune automatisation ne les complète : les 3 leads du site existants ont été complétés à la main.
  - Conséquence 1 : un nouveau lead du site arrive sans `Type de lead`. La formule `🔥 Priorité` le classe donc « 🔵 Froid » et `🔔 Notifier` reste vide, **y compris pour « Je veux louer un véhicule »** (LCD, présentée comme 90 % du CA). L'automatisation « Lead urgent → notification iPhone », en préparation, ne se déclenchera pas pour les leads du site.
  - Conséquence 2 : **si le champ `Source` est supprimé** comme prévu, Airtable refusera toute création (`UNKNOWN_FIELD_NAME`) : l'API répondra 502 et **chaque demande du formulaire sera perdue**.
- **Fix :** écrire `Canal: "Site web"`, `Étape: "Nouveau"` et `Type de lead` déduit du sujet (Je veux louer → « LCD — Location courte durée », LLD → « LLD PRO — Leasing société », Propriétaire → « Propriétaire FLOW » ou « FLEX », Autre → « Autre »), idéalement via un champ sur chaque option de `contact.subjectOptions` dans Sanity. Retirer `Source` et `Statut` de l'API **avant** de supprimer ces champs dans Airtable.
- **Statut :** ✅ corrigé (non déployé).
  - L'API écrit `Canal: "Site web"`, `Étape: "Nouveau"` et `Type de lead` selon le `_key` du sujet (`LEAD_TYPE_BY_SUBJECT_KEY`) : LCD, LLD PRO, Autre. Le sujet « propriétaire » est laissé vide exprès, car FLOW ou FLEX se décide avec le propriétaire.
  - `Source` et `Statut` restent écrits (`Statut` est lu par l'automatisation « Auto-fill Date 1er contact »).
  - Nouveau `server/utils/airtable.ts` : si Airtable renvoie `UNKNOWN_FIELD_NAME`, le champ est retiré et la création relancée. Supprimer `Source` dans Airtable ne fait donc plus perdre de lead.
  - Vérifié : 4 scénarios unitaires, build de prod, API (422 en validation ; champs envoyés : `Type de lead`, `Canal`, `Étape`).
  - **À faire après déploiement :** envoyer un vrai formulaire « Je veux louer un véhicule » et contrôler la fiche Airtable (Type de lead = LCD, 🔔 Notifier = OUI).
  - **Nouvelle option de sujet dans Sanity :** l'ajouter à `LEAD_TYPE_BY_SUBJECT_KEY`, sinon son Type de lead reste vide.

#### ⬜ I-C6 — Pages légales : deux dates de mise à jour différentes `[prod+develop]` + `[Sanity]`
- **Fichier :** `web/app/pages/legal/[slug].vue:67-76` (`_updatedAt`).
- **Constat :**
  - La page de confidentialité affiche « Dernière mise à jour : 3 juin 2026 » (automatique) **et** « 27 mai 2026 » (dans le texte).
  - `_updatedAt` change à chaque correction de faute : ce n'est pas une date de révision juridique.
  - Un brouillon est en attente depuis le 04/06.
- **Fix :** champ `revisionDate` sur `legalPage` utilisé à la place de `_updatedAt`, suppression des dates dans le texte, publication du brouillon.

### Analytics

#### 🟡 I-A1 — `catalogue_filter` n'est branché sur aucun tag GTM `[prod+develop]`
- **Fichiers :** `web/app/composables/useCatalogueListing.ts:162` ; conteneur `GTM-K23JSRNH` v5 (déclencheur regex du tag GA4 Event).
- **Constat :** la regex liste 20 events mais pas `catalogue_filter`, qui n'arrive donc jamais dans GA4. La regex n'est pas ancrée.
- **Statut :** 🟡 regex du déclencheur modifiée dans GTM (`catalogue_filter` ajouté, ancrage `^…$`), paramètres `filter_type`/`filter_value` déjà présents dans la balise. Reste : test en Aperçu puis publication du conteneur.
- **Fix :** ajouter `catalogue_filter` et ancrer la regex `^(…)$`. Par la suite, déclarer tout nouvel event côté GTM en même temps que le code.

#### ✅ I-A2 — Risque de `page_view` en double sur la navigation SPA (à vérifier dans GA4) `[prod+develop]`
- **Fichier :** `web/app/plugins/05.gtm.client.ts:20-28`.
- **Constat :**
  - Le Google tag `G-REHMWCEEEM` a `send_page_view=false`, et les `page_view` viennent uniquement du `dataLayer` (vérifié : 1 seul `page_view` par chargement). Pas de doublon côté conteneur.
  - En revanche, si la mesure améliorée GA4 « Changements de page basés sur l'historique » est active (c'est le défaut), chaque navigation client produit un second `page_view`.
- **Fix :** GA4 > Flux de données > Mesure améliorée > désactiver « historique du navigateur ». Contrôler ensuite dans DebugView.
- **Statut :** ✅ vérifié dans GA4 le 16/09 : les mesures améliorées sont **désactivées** sur le flux « Bora Cars Web », donc pas de doublon. Rien à changer.

#### ⬜ I-A3 — Consent Mode en mode « avancé » : pings envoyés avant consentement `[prod+develop]`
- **Fichiers :** `web/nuxt.config.ts` (`scripts.registry.googleTagManager`, `trigger: 'onNuxtReady'`, `defaultConsent`) ; conteneur GTM (aucune vérification de consentement supplémentaire sur les tags).
- **Constat :**
  - Le `consent default` à `denied` est bien poussé avant `gtm.js` (vérifié dans le `dataLayer`).
  - Mais le conteneur se charge pour tous les visiteurs et GA4 envoie des pings sans cookie avant tout choix (IP et user-agent transmis à Google).
  - La CNIL n'a pas validé ce mode comme exempté de consentement.
- **Fix :** décision à prendre avec le client.
  - Soit rester en mode avancé en l'assumant dans la politique de confidentialité.
  - Soit passer en mode « basique » : charger GTM seulement après consentement analytics, via `useScriptTriggerConsent({ consent: useCookies().triggers.analytics })` au lieu de `onNuxtReady`.

#### ➖ I-A5 — develop.boracars.com envoie ses hits dans la propriété GA4 de production `[develop]`
- **Constat :** test Tag Assistant du 16/09 sur `https://develop.boracars.com/fr/catalogue` : le conteneur `GTM-K23JSRNH` et la balise GA4 `G-REHMWCEEEM` se déclenchent. Chaque visite de recette (client, développeurs) est donc comptée dans les statistiques de boracars.com.
- **Fix (au choix) :**
  - dans Netlify, ne pas définir `NUXT_PUBLIC_SCRIPTS_GOOGLE_TAG_MANAGER_ID` pour le contexte `develop` (GTM ne se charge plus en recette) ;
  - ou, dans GTM, ajouter une exception « Page Hostname contient `develop.` » aux déclencheurs des deux balises GA4.
- **Statut :** ➖ accepté le 16/09 : trafic de recette négligeable. Si besoin, filtrer les rapports GA4 sur la dimension « Nom d'hôte » = `boracars.com`.

#### ✅ I-A4 — Chargement effectif de GTM et GA4 non vérifié `[prod]`
- **Constat :** pendant l'audit, `googletagmanager.com` a répondu 429 à l'IP d'audit (tous conteneurs confondus). Chrome signalait donc `gtm.js` « bloqué par CORS » (réponse d'erreur sans en-tête CORS). Le script est injecté avec `crossorigin="anonymous"`, ce qui est normalement accepté par Google. Le conteneur publié a bien été récupéré lors d'une passe antérieure.
- **Fix :** contrôler depuis un poste normal avec Tag Assistant et GA4 DebugView (chargement du conteneur, mise à jour du consentement après « Accepter », `page_view` et `whatsapp_click`).
- **Statut :** ✅ vérifié le 16/09 dans Tag Assistant : consentement par défaut **Refusé** sur les 4 signaux, passé à **Accordé** après « Tout autoriser » ; l'événement `consent_granted` déclenche la balise GA4 ; GA4 indique une collecte active sur les 48 dernières heures.

### Performance

#### ✅ I-P1 — Tweakpane (debug) livré en prod : ~300 Ko bruts dans le chunk d'entrée `[prod+develop]`
- **Fichier :** `web/app/plugins/03.pane.client.js:1-2`.
- **Constat :**
  - Les imports sont statiques ; le `return` sur `IS_PROD` arrive trop tard pour le tree-shaking.
  - Entrée `/_nuxt/CEucZv71.js` : 1,196 Mo bruts / 372 Ko gzip, dont ≈ 301 Ko bruts (63 Ko gzip) de Tweakpane et plugin-essentials.
  - Le panneau est aussi visible sur develop.boracars.com (normal vu `IS_PROD=false`, mais visible par le client en recette).
- **Fix :** imports dynamiques après la garde (`const { Pane } = await import('tweakpane')`), ou `if (!import.meta.dev) return`.

#### ⬜ I-P2 — `@nuxt/ui` + Tailwind embarqués pour un seul `<UApp>` `[prod+develop]`
- **Fichiers :** `web/nuxt.config.ts:56`, `web/app/assets/css/main.css:1-2`, `web/app/app.vue:280`.
- **Constat :**
  - `entry.css` fait **211 Ko bruts (30 Ko gzip), bloquant le rendu**, dont 156 Ko d'utilitaires générés pour les composants Nuxt UI (jusqu'à ProseMirror).
  - Chaque page porte aussi 6 Ko de `nuxt-ui-colors` et un script inline `nuxt-color-mode`, alors que le site impose `color-scheme: light`.
  - Côté JS : reka-ui et tailwind-variants, ≈ 25-30 Ko gzip.
- **Fix :** retirer le module et les `@import`, remplacer `<UApp>` par un simple wrapper, désinstaller `@nuxt/ui` et `tailwindcss`. Recette visuelle ensuite (le preflight Tailwind disparaît ; `_reset.scss` le couvre).

#### 🟡 I-P3 — Qualité d'image : toujours 90, et agrandissements au-delà de la source `[prod+develop]`
- **Fichiers :** `web/nuxt.config.ts` (`image.quality: 90`), `Media.vue:101-105`, `ServiceCard.vue:103`, `CatalogueCard.vue:57`, `car/Hero.vue:101`.
- **Constat :**
  - `@nuxt/image` écrase `modifiers.quality`/`fit` par la prop et la config globale : les `{ quality: 80 }` du code sont sans effet.
  - Hero de l'accueil : 571 Ko en q=90 contre 324 Ko en q=75.
  - ServiceCard : candidat `4250w` pour une source de 1392 px (336 Ko contre 82 Ko).
- **Fix :** garder `image.quality: 90` (décision : qualité prioritaire). Supprimer les `modifiers.quality` sans effet, éviter l'agrandissement (`fit="outside"` → Sanity `fit=max`) et recadrer au format du cadre avec `ratio`/`mobileRatio` là où la photo et le cadre n'ont pas le même format (heroes, ServiceCard, BrandsSection).
- **Statut :** 🟡 hero de la fiche voiture corrigé (B6) ; reste le hero de l'accueil, ServiceCard, CatalogueCard, BrandsSection, Testimonials.

#### ⬜ I-P4 — Preloader : page masquée ≈ 4,7 s après l'hydratation, à chaque chargement complet `[prod+develop]`
- **Fichiers :** `web/app/components/app/Preloader.vue:6-10,63-104`, `web/app/composables/useFontsReady.ts:4`, `web/app/components/app/Lenis.vue:27`.
- **Constat :**
  - La timeline attend `document.fonts.ready` (repli à 2,5 s), puis enchaîne ≈ 2,8 s de progression artificielle et ≈ 1,4 s de sortie.
  - Le scroll est bloqué pendant tout ce temps.
  - Ça concerne chaque atterrissage depuis Google ou Instagram, donc le temps perçu et le rebond.
- **Fix :** une fois par session (drapeau `sessionStorage`), suppression des délais `'+=…'`, pas d'attente des polices (`font-display: swap` est déjà là).

#### ⬜ I-P5 — Images chargées d'emblée sous la ligne de flottaison `[prod+develop]`
- **Fichiers :** `web/app/components/elements/BrandsSection.vue:145,165`, `web/app/components/elements/Testimonials.vue:194`.
- **Constat :**
  - BrandsSection : 9 visuels de survol en `eager`, **1,9 Mo** sur l'accueil. `sizes` annonce 35vw pour un curseur de ≈ 18vw.
  - Testimonials : fonds plein écran en `:lazy="false"`, **1,1 à 2,7 Mo** sur `/fr/proprietaire`.
- **Fix :** `lazy` ; `sizes="sm:56vw md:19vw lg:19vw xl:19vw"` + recadrage carré (`:ratio="1"`) pour BrandsSection, en conservant la qualité 90.

### Accessibilité

#### ✅ I-X1 — Focus clavier invisible sur tout le site `[prod+develop]`
- **Fichiers :** `web/app/assets/scss/_reset.scss:11-14` (`all: unset`), `web/app/components/elements/CatalogueListing.vue:262-264` (`outline: none`).
- **Constat :** le reset retire le contour natif, et seuls 4 composants en redéfinissent un (FieldCheckbox, FieldSelect, Select, bouton du formulaire). Liens, CTA, burger, bandeau cookies et footer n'ont aucun indicateur de focus (WCAG 2.4.7).
- **Fix :** dans `main.scss`, après le reset : `:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }`. Supprimer le `outline: none` de la recherche.

#### ⬜ I-X2 — Bandeau cookies modal sans gestion du focus `[prod+develop]`
- **Fichier :** `web/app/components/app/Cookies.vue:52-55,81-90`.
- **Constat :** `role="dialog" aria-modal="true"`, overlay et scroll bloqué, mais le focus n'est ni déplacé dans le dialogue, ni piégé, ni rendu. Au clavier, il faut traverser toute la page masquée pour atteindre « Accepter » ou « Refuser ».
- **Fix :** focus sur le premier bouton à l'ouverture, piège à focus (`useFocusTrap` ou `inert` sur `#__nuxt`), `aria-labelledby` vers le `h2`, restitution du focus à la fermeture.

#### ⬜ I-X3 — Contrastes de la charte orange/beige insuffisants `[prod+develop]`
- **Fichiers :** `web/app/assets/scss/_colors.scss` et :
  - `atoms/CTA.vue:35,248` ;
  - `app/Cookies.vue` ;
  - `app/Footer.vue:153,289-290` ;
  - `elements/Pitch.vue` ;
  - `elements/ProcessSteps.vue:148-158` ;
  - `atoms/FieldText.vue:76,81,142`.
- **Constat** (seuil 4,5:1 pour le texte, 3:1 pour les composants) :

  | Couleurs | Ratio | Où |
  |---|---|---|
  | beige/orange | **2,44:1** | CTA orange, bandeau cookies, footer |
  | beige-70/orange | **1,82:1** | titres de colonnes du footer |
  | black-40/beige | **2,60:1** | labels flottants, placeholder |
  | red/beige | **3,06:1** | messages d'erreur du formulaire |
  | black-20/beige | **1,55:1** | bordures des champs |

- **Fix :** texte noir sur orange (6,44:1) ; token `--c-orange-text: #B24227` pour de l'orange en texte (4,55:1) ; labels en `black-70` ; rouge d'erreur ≈ `#C0141C` ; bordures en `black-60`. **Arbitrage de charte à valider avec le design.**

#### ⬜ I-X4 — Tailles de police 100 % en `vw` : le zoom navigateur n'agrandit pas le texte `[prod+develop]`
- **Fichiers :** `web/app/assets/scss/_functions.scss:4-14`, `_font-style-classes.scss`.
- **Constat :** à 1280 px de large, `LABEL-TEXT` et la mention de consentement du formulaire font 8 px, `P2` 12 px. Le zoom à 200 % ne grossit pas le texte (échec WCAG 1.4.4).
- **Fix :** `clamp(<rem mini>, <vw>, <rem maxi>)` : faire évoluer `font-vw()`, avec un plancher de 12 px pour les labels et 14 px pour le corps de texte.

#### ⬜ I-X5 — FAQ inutilisable au clavier `[prod+develop]`
- **Fichier :** `web/app/components/elements/Faq.vue:214-228`.
- **Constat :** ouverture par `@click` sur un `<li>`, sans `<button>`, `tabindex` ni `aria-expanded` (WCAG 2.1.1, niveau A).
- **Fix :** `<h3><button type="button" :aria-expanded :aria-controls @click="toggle(…)">…</button></h3>` et retirer le `@click` du `<li>`.

#### ⬜ I-X6 — Menu : burger sans nom en mobile, liens cachés mais focusables `[prod+develop]`
- **Fichiers :** `web/app/components/app/MenuCTA.vue:32,117-124`, `web/app/components/app/MenuPanel.vue:80-125`, `web/app/components/app/Menu.vue:300`.
- **Constat :**
  - Le burger n'a ni `aria-expanded` ni `aria-controls`, et aucun nom accessible en mobile (libellé en `display:none`).
  - Menu fermé, ≈ 9 liens restent dans l'ordre de tabulation, avant le contenu.
  - Pas de `<nav>`, pas de lien d'évitement, pas de focus déplacé ni restitué.
- **Fix :** `:aria-expanded="menuOpen"`, `aria-controls` et `aria-label` sur le burger ; `:inert="!menuOpen"` sur le panneau ; `<nav>` ; lien « Aller au contenu » dans `app.vue`.

#### ⬜ I-X7 — Marquees et vidéos en mouvement continu, sans pause, dupliqués pour les lecteurs d'écran `[prod+develop]`
- **Fichiers :** `web/app/components/elements/Marquee.vue`, `FullscreenMarquee.vue:95-136`, `Partners.vue:24-48`, `Video.vue:26-37`.
- **Constat :** animation infinie sans contrôle ni `prefers-reduced-motion` (WCAG 2.2.2). Les copies du slot ne sont pas `aria-hidden` : 4 liens et 4 `<h1>` par voiture, logos lus 3 fois.
- **Fix :** copies 2 à N en `aria-hidden="true"` + `inert` ; `gsap.matchMedia('(prefers-reduced-motion: no-preference)')` ; pause au survol ou au focus.

### Qualité et sécurité

#### 🟡 I-Q1 — API contact : regex vulnérable au ReDoS, aucune limite de taille ni de débit `[prod+develop]`
- **Fichier :** `web/server/api/contact.post.ts:20,60-81`.
- **Constat :**
  - `EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/` est à backtracking polynomial (signalé par ESLint `regexp/no-super-linear-backtracking`). Une chaîne longue de points bloque la fonction Netlify jusqu'au timeout.
  - Aucune longueur maximale sur `message`, `lastName`, `pageUrl` ou les `utm`, qui partent dans Airtable.
  - Pas de rate limiting ; seul le honeypot filtre, et il répond `ok: true`.
- **Fix :**
  - Refuser au-delà de longueurs raisonnables **avant** la regex (ex. email ≤ 254, message ≤ 5 000, noms ≤ 100, `utm` ≤ 200).
  - Regex non ambiguë, par exemple `/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/`.
  - Limitation par IP : Netlify Rate Limiting, ou un compteur dans Netlify Blobs.
- **Statut :** 🟡 limites de taille (email ≤ 254, message ≤ 10 000, noms ≤ 100, métadonnées tronquées) et regex linéaire en place. Reste la limitation de débit.

---

## 🟡 Mineur

### SEO
- **Meta descriptions de plus de 160 caractères** `[Sanity]` : `/fr/proprietaire` (185), `/fr` (168), confidentialité (165), mentions légales (163), `/fr/contact` (161). Fix : ≤ 155 caractères et `Rule.max(160).warning()` sur `seo.description`.
- **Titles génériques** `[Sanity]` : « Catalogue », « Fleet », « Contactez-nous ». ✅ Fiches voiture corrigées (voir G5).
- **`'Puissance'` en dur dans le JSON-LD, y compris en EN** `[prod+develop]` : `web/app/pages/car/[uid].vue:92`. Fix : `t('car.specs.labels.puissance')`.
- **`image:loc` du sitemap doublement échappés** `[prod]` : 98 `&amp;amp;` dans `/__sitemap__/fr-FR.xml`, donc paramètres de recadrage ignorés. Cause : découverte automatique d'images de `@nuxtjs/sitemap`. Fix : `sitemap: { discoverImages: false }`, ou images fournies par `server/api/__sitemap__/urls.ts`. À revérifier après la montée de version.
- **404 SSR avec `x-robots-tag: index, follow`** alors que le HTML dit `noindex` `[prod+develop]`. Fix : ne pas émettre cet en-tête sur les réponses d'erreur (routeRules / `robots`).
- **Chaîne de redirections `http://www.boracars.com` → `/fr` en 4 sauts** (Netlify) ; `/sitemap.xml` en **302**. Fix : redirection domaine directe vers `https://boracars.com/fr` ; 301 pour le sitemap.
- **Détails JSON-LD** `[prod+develop]` (`web/app/app.vue:126-226`) :
  - `currenciesAccepted: 'EUR'` en dur, y compris pour l'agence de Genève ;
  - `sameAs` des agences en liens courts `share.google/…` (302) au lieu d'URL Maps ou kgmid stables ;
  - les 2 agences ont la même `description` et `url` = accueil ;
  - `WebPage.primaryImageOfPage` = logo, même sur les fiches voiture ;
  - `settings.areaServed` contient « Genève » et « Geneva ».
- **Slug `range-rover-autobiograpy`** (coquille, déjà indexé) `[Sanity]`. Si corrigé : 301 FR et EN dans `routeRules`.
- **`canonicalQueryWhitelist` par défaut** (inclut `q`, `page`, `sort`…) : `/fr/catalogue?q=…` garde sa query dans la canonical. Fix : `seo: { canonicalQueryWhitelist: [] }`.
- **Alts bourrés de mots-clés** `[Sanity]` : « Location voiture Genève Location voiture Paris », « cle 53 amg gestion » ; les 7 images d'une galerie ont le même alt.

### i18n
- **Clés orphelines du glossaire :** `car.rental.type.professionnel`, `media.noImage`, `underConstruction.*` (composant `AppUnderConstruction` mort, FR « Coming Soon »). Fix : supprimer les clés et `web/app/components/app/UnderConstruction.vue`. Les clés de filtres désactivés (`catalogue.filters.{marque,prix}`) peuvent être gardées, à documenter.
- **Anglais britannique et américain mélangés** (locale `en-GB`) : « sedans » / « saloons », « Catalogue » (fil d'Ariane) / `/catalog` / « Pro Catalog ». Fix : choisir en-GB et harmoniser.
- **Chemin en dur** `web/app/components/app/Menu.vue:303` (`to="/"`) : utiliser `{ name: 'index' }`.
- **Slug de la politique de confidentialité dans le glossaire** (`legal.privacySlug`, `ContactForm.vue:298`) : 404 silencieuse si le slug change. Fix : référence `legalPage` dans la query `contact`.
- **`carPage.seo` requêté mais jamais utilisé** (`web/app/queries/car.ts:135`) : champ Studio sans effet, à retirer ou exploiter.
- **Traductions incomplètes** `[Sanity]` :
  - `catalogue.contentPreFooter.eyebrow[en]` vide ;
  - `9d838a44.equipements[en]` vide ;
  - listes d'équipements FR/EN de longueurs différentes (RS6, Classe A) ;
  - description EN de `vw-t-roc` sans la mention « réservé aux sociétés ».
- **Coquilles et faux-sens** `[Sanity]` :
  - « Bonjour suis intéressé » ;
  - « interested by renting / more informations » ;
  - « Professionnal » ;
  - « You provide the parts » (pour « pièces justificatives ») ;
  - « front lift » ;
  - « sec » (préférer « s ») ;
  - « Découvrir » traduit par « Find us » ;
  - « 24h » contre « 48h » sur `proprietaire` ;
  - libellé « CGV » pour un document intitulé « CGL » ;
  - espaces finaux sur de nombreux libellés.
- **Glossaire = point de défaillance unique** : `i18n/locales/*.json` sont vides. Une erreur Sanity au rendu SSR (develop, ou page non prérendue) affiche les clés brutes. `escapeHtml: false` + `strictMessage: false` compilent le contenu du CMS (`@`, `{`, `|` saisis par un rédacteur cassent le message). Fix : repli minimal committé pour les clés critiques (erreur, formulaire) et validation Studio des caractères spéciaux.

### Contenu `[Sanity]`
- **911 Carrera 4S :** `nombrePortes: 5` au lieu de 2.
- **G63 :** puissance 580 contre « 585 chevaux » dans la description ; carburant « Hybride rechargeable » à vérifier (idem T-ROC à 150 ch).
- **Range Rover Sport :** `gamme: sportive` au lieu de `suv` ; alt « 2023 » pour un modèle 2025.
- **`dureeMinimum` sans unité** (`67769f85` 90, `9d838a44` 180, `bc4b8f64` 365), affiché « 365 jours ».
- **Brouillons en attente :**
  - 3 voitures publiées ont des modifications non publiées ;
  - 10 voitures n'existent qu'en brouillon, dont `drafts.1820ac1d` (Peugeot 208 GT) à **700 €/jour** et `drafts.f50c31a4` (BMW X3, slug « bmw », sans prix).
  - À trier avant le prochain « Publier » global.
- **Numéro WhatsApp :** `+41` (Genève) utilisé pour toutes les fiches, y compris les voitures de Paris ; le numéro Paris (`+33686898093`) ne sert que dans le JSON-LD. À valider avec le client.
- **Agence de Genève** déclarée ouverte 24h/24 et 7j/7 ; `location.description` vides.
- **Trois sources divergentes pour la description du site :** `settings.seo.description`, glossaire `seo.description`, `i18n/locales/*.json`.
- **Liens internes du menu et du footer** avec un résidu `url: "https://google.fr/"` (ignoré, à nettoyer).

### Analytics
- **`trackContactCtaClick` jamais appelé** (`web/app/composables/useAnalytics.ts:57`). Les CTA de contact sont bien suivis, mais en `whatsapp_click` avec `source` (via `BaseLink`). Fix : supprimer le helper ou l'utiliser pour les CTA non-WhatsApp.
- **Recherche du catalogue : un `catalogue_filter` par pause de frappe.** Constaté dans Tag Assistant : taper « porsche » envoie `filter_value: "por"` puis la valeur complète (`useCatalogueListing.ts:162`, déclenché par le debounce de `CatalogueListing.vue:48`). Les rapports GA4 mélangent recherches partielles et complètes. Fix : pour `filter_type === 'q'`, n'envoyer l'événement qu'au blur/Entrée, ou avec un debounce plus long dédié au tracking.
- **`vehicle_view` poussé avant `page_view`** (`[uid].vue:153` `onMounted` contre `page:finish`). En navigation SPA, l'event peut hériter du titre de la page précédente. Fix : pousser `vehicle_view` dans `useScriptEventPage`, ou après `page:finish`.
- **Honeypot déclenché = `contact_form_success` côté client.** Fix : le serveur peut renvoyer `{ ok: true, spam: true }` et le client ne pas tracker.
- **Pas de données personnelles dans le `dataLayer`** : vérifié, aucun nom, email ni téléphone. `page_location` est l'URL complète (sans risque aujourd'hui, aucun formulaire en GET).

### Performance
- **Glossaire FR+EN sérialisé dans chaque `_payload.json`** (27 Ko sur 40, re-téléchargés à chaque navigation) : `web/app/plugins/i18n-sanity.ts:15`. Fix : chargement par locale via `defineI18nLocale`, ou ne requêter que la locale courante.
- **`sizes` sans préfixe, donc candidats `1w`/`2w` parasites et aucun candidat mobile** : `CatalogueCard.vue:59`, `BrandsSection.vue:145,165`, `ServiceCard.vue:72`, `bio/Story.vue:104`. La grille du catalogue annonce 50vw pour ≈ 33vw. Fix : `sm:96vw md:33vw lg:33vw xl:33vw`.
- **Première rangée du catalogue en `lazy`, sans preload, sans `preconnect` vers `cdn.sanity.io`** (`CatalogueCard.vue:50-60`). Fix : `:lazy="position >= 3"`, preload de la première carte, `preconnect`.
- **Parallaxe FAQ :** lecture et écriture du DOM à chaque frame, même hors écran (`Faq.vue:38-52`). Fix : boucle active seulement quand la section est visible, lectures regroupées.
- **`backdrop-filter` plein écran permanent à `opacity: 0`** (`web/app/components/app/Overlay.vue:21-34`). Fix : seulement dans `.is-active`.
- **Preloader jamais démonté**, animation infinie (`Preloader.vue:190-193`). Fix : `v-if` après le fondu.
- **Polices :**
  - pas de `preload` ;
  - `/fonts/*` servies en `max-age=0` ;
  - famille `Lora` déclarée mais inutilisée ;
  - fichiers orphelins déployés : `HaasGrotDispRegular.otf` (147 Ko), `public/img/placeholder/` (3,3 Mo), `c3e433934bb47d4db44d0d087be4e16c.jpg`.
  - Fix : preload Medium et Regular ; `[[headers]] for="/fonts/*"` avec `Cache-Control = "public, max-age=31536000, immutable"` dans `netlify.toml` ; suppression des fichiers orphelins.
- **Écouteurs `mousemove` jamais retirés dans BrandsSection** (`BrandsSection.vue:86-91`, `return` placé dans le `forEach`). Fix : retourner les nettoyages depuis `mm.add`.
- **Divers :**
  - `DrawSVGPlugin` enregistré mais inutilisé (`02.gsap.client.js:5,12`) ;
  - logos partenaires de 64 px agrandis à 384 px (`Partners.vue:42`) ;
  - `og-bora-cars.jpg` à 396 Ko (viser < 150 Ko) ;
  - `ElementsVideo` en `preload="auto"` sans `poster`.

### Accessibilité
- **`prefers-reduced-motion` partiellement respecté** : Lenis, transition de page, preloader, ProcessSteps, BrandsSection et MediaOverlay l'ignorent (SplitText et Parallax le respectent).
- **Structure :**
  - `<AppFooter>` placé dans `<main>` (pas de landmark `contentinfo`) ;
  - numéros « 01 » et noms de voitures en `h3` ;
  - colonnes du footer sans `<nav>`.
- **Formulaire :**
  - le libellé de « Sujet » disparaît après sélection (`FieldSelect.vue:156,175`) ;
  - `role="alert"` combiné à `aria-live="polite"` (`ContactForm.vue:277-284`) ;
  - astérisque non expliqué.
- **Filtres du catalogue :** nom du combobox = valeur sélectionnée ; nombre de résultats non annoncé (`CatalogueListing.vue:88-129`).
- **Alts redondants dans les cartes-liens** (`CatalogueCard.vue:53`, `ServiceCard.vue:99`) : utiliser `alt=""` quand le lien porte déjà le texte.
- **Sélecteur de langue** annoncé « FR » sans contexte, sans `lang`/`hreflang` sur les liens (`MenuLangSwitcher.vue:113-145`).
- **Galerie de la fiche voiture :** pas d'`aria-current` ; contenu « Lire la suite » en `aria-hidden` mais focusable (`car/Hero.vue:113-123`, `car/Description.vue:31-36`).
- **Liens :**
  - nouvel onglet non signalé ;
  - animation du CTA au survol seulement, pas au focus (`CTA.vue:212-213`) ;
  - liens du texte riche non soulignés hors pages légales.
- **SVG décoratifs** (logos du hero, footer, preloader, écran de veille) sans `aria-hidden`.

### Qualité
- **`:deep()` dans un `<style>` non scopé** (`web/app/components/elements/Media.vue:211-218`) : le sélecteur reste littéral, le navigateur ignore ces règles (Lightning CSS le signale au build). Sans effet visible aujourd'hui car la règle globale `img { width/height: 100%; object-fit: cover }` de `main.scss` couvre le cas. Fix : supprimer ces règles mortes, ou écrire `.app-elements-media__image img`.
- **ESLint : 57 erreurs** (42 corrigeables avec `--fix`), dont des variables inutilisées (`app.vue:81` `IS_PROD`, `Hero3.vue:19`), des `no-use-before-define` (`Menu.vue:28`, `Hero1.vue:40-61`) et du formatage (`netlify.toml`).
- **`console.log('[Fonts] Fonts are ready')` en prod** (`useFontsReady.ts:33`).
- **`statusMessage` de `createError` avec accents** (`[uid].vue:25`, `legal/[slug].vue:19`) : h3 retire les caractères non ASCII de la ligne de statut HTTP. Préférer `message`.
- **Code et fichiers morts :**
  - `app/composables/useViewport.ts` (vide) ;
  - `AppUnderConstruction` et `AppMenuDev` (commentés) ;
  - `NUXT_PUBLIC_IS_FTP` et script `generate:ftp` obsolètes ;
  - `Tempus.patch()` commenté (`01.tempus.client.js:4`) alors que `CLAUDE.md` le décrit comme actif.
- **Année du copyright** `new Date().getFullYear()` figée au prerender (`Footer.vue:24`, `FooterMini.vue:29`) : prévoir un rebuild en janvier, ou `runtimeConfig.public.buildYear`.

---

## 📈 Search Console (exports du 16/09/2026, 28 derniers jours)

**Chiffres :** 169 clics (−9 %), 14,1 k impressions (+2 %), CTR 1,2 %. **52 pages indexées, 18 non indexées** (contre 9 indexées fin juin). « Détectée, actuellement non indexée » : 0.

| # | Constat | Preuve | Action |
|---|---|---|---|
| G1 | **Google sert encore l'ancienne racine `/`**, qui redirige en 301 vers `/fr` depuis début septembre | `https://boracars.com/` : 133 clics sur 169, position 4,6. `/fr` : 27 clics, position 39 | Transfert normal, 2 à 6 semaines. Garder la 301 ; inspecter `/fr` dans GSC et demander l'indexation. La baisse de −9 % (et −80 % sur « location voiture de luxe ») coïncide avec la bascule |
| G2 ✅ | **E-mail « Page avec redirection » (7 sept., 6 pages)** : très probablement les **6 pages légales en meta-refresh** générées par le sélecteur de langue du menu (I-S4) | Vérifié en direct : `/en/legal/mentions-legales`, `/fr/legal/legal-notice`, etc. répondent 200 + `meta refresh` (prerender du 07/09) | Corriger I-S4 (code), puis « Valider la correction » dans GSC. À confirmer avec l'export des URLs |
| G3 | **Genève : bonnes positions, CTR très faible** | 186 requêtes, 4 946 impressions, position moyenne 4,4 (Suisse : 3,4), CTR 0,9 %. « location voiture genève » : position 1,5, 487 impressions, CTR 0,6 %. « car rental geneva » : position 3,8, 777 impressions, CTR 0,4 % | Le résultat affiché est l'accueil FR (« Paris et Genève »), y compris pour les recherches en anglais (232 requêtes, CTR 0,3 %). Créer des pages dédiées Genève FR/EN (« Location de voitures de luxe à Genève » / « Luxury car rental in Geneva ») |
| G4 | **Paris faible** | 35 requêtes, 777 impressions, position 12,3, 1 clic. Levallois-Perret / Neuilly en positions 6 à 20 | Page dédiée Paris / Neuilly et avis sur la fiche Google de Paris |
| G5 🟡 | **Fiches voiture quasi invisibles** | Au plus 4 impressions par fiche. Requêtes existantes : « location porsche », « louer un range rover », « range rover rental geneva » | ✅ Titles faits (non déployés) : « Location {voiture} à {ville} — BORA CARS » / « {car} rental in {city} — BORA CARS », gabarits dans le glossaire Sanity (`car.seo.title`, `car.seo.titleNoCity`, publiés), espaces normalisés, `Product.name` inchangé. Reste : enrichir les descriptions |
| G6 | **Marque « bora cars » : position 3,8** | 53 impressions, CTR 43 %. Bruit « bora bora » (160 impressions) | Continuer fiches Google, avis, liens depuis Instagram |
| G7 | **404 connues de Google** (4 URLs) : au moins `/fr/voiture/renault-clio-6` et `/en/car/renault-clio-6`, voiture repassée en brouillon | Encore des impressions sur `/fr/voiture/renault-clio-6` | La republier, ou 301 vers le catalogue si elle ne revient pas |
| G8 | **1 page « bloquée par robots.txt »** alors que le `robots.txt` actuel ne bloque rien | `Disallow:` vide | Probablement un reliquat de l'ancien `robots.txt` ; à confirmer avec l'export des URLs |
| G9 | **6 pages « Google n'a pas choisi la même canonique »** (validation en cours) | — | Export des URLs nécessaire (probablement lié à G1) |
| G10 | **Changement le 5 septembre** (2ᵉ export, données jusqu'au 14/09) : 404 de 4 à **8**, « Détectée, actuellement non indexée » de 0 à **10**, indexées de 52 à **48** | Aucun changement d'URL dans le code à cette date (chemins EN traduits le 03/06). Anciennes URLs EN toujours en 404 : `/en/proprietaire`, `/en/professionnel`, `/en/catalogue-professionnel`, `/en/voiture/*` | Hypothèse : voitures dépubliées ou publiées dans Sanity vers le 05/09. À confirmer avec les listes d'URLs par motif |

---

## ✅ Vérifié OK

- **Canonical :** une seule par page, absolue, égale à l'URL, sans slash final, query retirée (50/50 pages).
- **hreflang :** fr, fr-FR, en, en-GB et x-default (→ FR), réciproques, cibles en 200 direct. `html lang` et `og:locale` corrects.
- **Sitemap :** 25 URLs FR + 25 EN (index par locale), `lastmod` réels, `xhtml:link` alternates, slugs légaux traduits, `/bio` exclu, aucune URL noindex ni redirigée. robots.txt autorise tout et pointe le sitemap en absolu.
- **Redirections et erreurs :**
  - `/` → 301 `/fr` ; `/fr/` → 301 `/fr` ; `/en/catalogue` → 301 `/en/catalog` ; `www` et `http` → 301 vers l'apex ;
  - vraies 404 (pas de soft-404) avec `noindex` et titre localisé.
- **Métadonnées :**
  - title et description uniques sur toutes les pages, présents FR et EN ;
  - `og:title`/`og:description`/`og:url` cohérents ;
  - aucune `<img>` sans `alt` ; alts des voitures remplis FR et EN.
- **JSON-LD :** Organization, AutoRental par agence, WebSite/WebPage i18n, Product + Offer `LeaseOut` + BreadcrumbList sur les fiches.
- **i18n :**
  - toutes les clés `t()` du code existent dans le glossaire, FR et EN, sans valeur vide, placeholders cohérents, clés dynamiques couvertes ;
  - `I18N_PAGES`, `SANITY_ROUTES`, `BaseLink` et le sitemap sont cohérents ;
  - 16 slugs voiture uniques ; `slugEn` rempli pour les 3 pages légales ;
  - une seule copie de `vue-router`.
- **Analytics :**
  - un seul conteneur GTM, chargé une fois (`onNuxtReady`, preload `fetchpriority=low`), sans gtag ni GA codé en dur ;
  - `consent default` à `denied` poussé avant `gtm.js` ;
  - conteneur limité à GA4 (pas d'Ads ni de Meta) ;
  - events CTA suivis avec `source` (menu, hero, footer, pricing, sticky, bio…) ;
  - aucune donnée personnelle dans le `dataLayer`.
- **Sécurité :**
  - aucune variable secrète exposée (`__NUXT__.config.public` ne contient que `IS_PROD`, l'ID GTM et la config Sanity publique, token vide) ;
  - `.env*` ignorés par git et jamais committés ;
  - `/.env`, `/_nuxt/`, `/package.json` en 404 ;
  - `GET /api/contact` en 404, `POST {}` en 422 sans fuite ;
  - pas de valeur personnelle dans les logs serveur.
- **Liens :** 56 liens internes en 200 ; liens externes vivants (Instagram, TikTok, LinkedIn, Google, `wa.me`) ; `rel="noopener noreferrer"` sur tous les `_blank`.
- **Perf :**
  - pages prérendues servies depuis l'edge (TTFB 80-400 ms) ;
  - `/_nuxt/*` en `immutable` ;
  - hero de l'accueil préchargé en `fetchpriority=high` ;
  - pas de vidéo en prod ;
  - nettoyage des ScrollTrigger / Tempus / Lenis présent dans la plupart des composants.
- **Accessibilité :**
  - formulaire correct (`label for`, `aria-invalid`, `aria-describedby`, `autocomplete`, focus sur le premier champ invalide) ;
  - combobox personnalisés complets au clavier ;
  - `Switch` en `role="switch"` ;
  - boutons précédent/suivant labellisés ;
  - titres animés doublés d'une copie `.sr-only` ;
  - « Refuser » aussi visible qu'« Accepter ».

---

## Écarts prod ↔ develop (pour le prochain merge `develop` → `main`)

| Déjà corrigé dans `develop` (déployer) | Régressions introduites par `develop` |
|---|---|
| Balises `twitter:*` génériques identiques sur les 50 pages (« Votre partenaire mobilité premium ») | ✅ **B1** logo du menu en 300×300 (ordre CSS avec Vite 8) — corrigé |
| `og:image:width` / `og:image:height` absents | ✅ **B3** « €€ » dans les messages WhatsApp — corrigé |
| Page `/bio` + 301 `/bio` (404 en prod aujourd'hui) | ✅ **I-C4** options Airtable FR/EN — corrigé |
| API contact durcie (`str()`, repli de sujet) | ✅ Recette visuelle faite (styles calculés identiques à la prod hors changements voulus) |

Plus aucune régression connue ne bloque le merge `develop` → `main`.
