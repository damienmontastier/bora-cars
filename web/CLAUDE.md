# CLAUDE.md — `web/` (Nuxt 4)

Site public boracars.com. Ce fichier ne couvre que `web/` — vue d'ensemble du monorepo, env, déploiement et contrats avec le Studio : `../CLAUDE.md`. Locales : `../shared/CLAUDE.md`.

## Commands (depuis `web/`)

```bash
npm run dev          # nuxt dev --host 0.0.0.0 --dotenv .env → :3000
npm run build        # nuxt build — c'est ce que lance Netlify
npm run lint         # eslint (@antfu/eslint-config + @nuxt/eslint, formatters + stylistic)
npm run lint:fix
npm run typecheck    # nuxt typecheck (vue-tsc)
```

`generate`, `generate:prod`, `generate:ftp` (`nuxt generate`) sont des reliquats de l'ancien hébergement FTP : **ne pas les utiliser**, le preset `netlify` a besoin de fonctions au runtime (cf. [Rendu & déploiement](#rendu--déploiement)).

## Structure

```
app/                  # tout le code de l'app (layout Nuxt 4)
  app.vue             # shell : menu, preloader, cookies, idle screen, transition de page, schema.org identité
  assets/css/main.css # tailwindcss + @nuxt/ui
  assets/scss/        # main.scss + partials (cf. SCSS system)
  components/  composables/  config/  directives/  pages/  plugins/  queries/  stores/  types/  utils/
i18n/                 # i18n.config.ts + locales/{fr,en}.json (nuxtSiteConfig UNIQUEMENT)
server/
  api/contact.post.ts           # formulaire de contact → Airtable (server/utils/airtable.ts, token serveur)
  api/__sitemap__/urls.ts       # source dynamique du sitemap (URLs localisées + lastmod)
  plugins/sitemap-i18n-legal.ts # retire du sitemap les URLs légales fantômes (slug d'une locale sous le préfixe de l'autre)
public/               # fonts/, favicons, manifest, og-bora-cars.jpg
netlify.toml
```

---

## Plugin boot order (client-only, strictly numbered)

0. `00.scroll-restoration.client.ts` — force `history.scrollRestoration = 'manual'` au boot **et après chaque navigation** (`afterEach`). Le plugin router de Nuxt le remet à `'auto'` et le réglage est stocké *par entrée d'historique* : sans ça, au back navigateur le navigateur re-scrolle l'ancienne page (encore visible) à la position mémorisée avant que l'overlay de transition ne la couvre. Ne pas supprimer.
1. `01.tempus.client.js` — patches `requestAnimationFrame` via **Tempus**, disconnects GSAP's internal ticker
2. `02.gsap.client.js` — registers GSAP plugins (ScrollTrigger, SplitText, Flip), hooks GSAP into Tempus via `gsap.updateRoot`
3. `03.pane.client.js` — creates **Tweakpane** debug UI (FPS graph) driven by Tempus, provides `$pane`
4. `04.directives.client.ts` — registers `v-menu-theme` directive (pendant SSR : `04.directives.server.ts`, stub `getSSRProps() → {}` — sans lui la directive est inconnue au rendu serveur)
5. `05.gtm.client.ts` — pousse un `page_view` GA4 dans le dataLayer à chaque navigation (`useScriptEventPage`, après la mise à jour du `<title>`) ; no-op sans GTM
5. `05.utm.client.ts` — `useUtm().captureFromUrl()`

Hors numérotation : `i18n-sanity.ts` (**universel**, pas client-only) — glossaire Sanity → vue-i18n, cf. [Routing & i18n](#routing--i18n).

**All animations must go through Tempus, never GSAP's own ticker.**

**API Tempus v1** (depuis `tempus@1.0.0`, ex-`1.0.0-dev.x`) — deux changements *breaking* :
- le callback reçoit **un objet d'état unique** `({ time, deltaTime, frame, budget })`, plus des arguments positionnels `(time, deltaTime)` → écrire `Tempus.add(({ time }) => …)` ;
- l'option `priority` s'appelle désormais **`order`** (même sémantique : le plus bas tourne en premier ; `priority` reste accepté comme alias déprécié).

Ordre d'exécution du projet : `lenis` (`order: -2`) → `gsap.updateRoot` (`order: -1`) → le reste (`order: 0`, ex. la parallaxe FAQ).
Chaque `Tempus.add()` passe aussi un `label` : il identifie le callback dans `Tempus.inspect()` et dans l'overlay `tempus/profiler` (`import { profiler } from 'tempus/profiler'`), qui affiche en direct comment chaque callback remplit le budget de frame. `state.budget()` (ms restantes dans la frame) permet de conditionner du travail optionnel.

## Global state — `app/stores/index.ts`

Single Pinia store `useAppStore()`:
```typescript
{
  fontsLoaded: boolean,
  preloaderDone: boolean,
  menuTheme: 'white' | 'orange' | 'black',
  menuThemePending: 'white' | 'orange' | 'black',  // buffered during page transition
  menuTransitioning: boolean,                        // true during leave → enter
  menuOpen: boolean,
  menuAnimating: boolean,
}
```
`app.vue` watches `useFontsReady()` and sets `fontsLoaded` when fonts are ready.

`menuThemePending` is the value set by `v-menu-theme` during scroll; it is only flushed to `menuTheme` when `menuTransitioning` is false (i.e. outside page transitions). During a page transition `app.vue` sets `menuTransitioning = true` on leave and restores + commits the pending theme on before-enter.

## Routing & i18n

Routes are locale-prefixed (`strategy: 'prefix'`). Default locale is `fr`. Always use `NuxtLinkLocale` for internal navigation (handled automatically by `BaseLink`). Sanity content is also localized FR/EN — see `app/queries/i18n.ts` and `app/composables/useSanityLang.ts`.

**Jamais de chemin d'URL en dur.** Tout est centralisé dans `app/config/I18N_CONFIG.ts` :
- `I18N_PAGES` — chemins traduits par locale, indexés par **nom de route** Nuxt (`car-uid`, `legal-slug`, `catalogue-professionnel`…), branchés via `customRoutes: 'config'` dans `nuxt.config.ts`. Traduire une URL = éditer une ligne ici.
- `SANITY_ROUTES` — `_type` Sanity → `{ name, param? }` ; c'est ce que `BaseLink` résout en `{ name, params }` pour un lien interne.

**The UI micro-copy lives in Sanity, fetched at runtime like all other content.** It's the `glossaire` singleton (Studio: « Glossaire (traductions) ») — one field-group tab per top-level i18n namespace, each a flat list of `glossaryEntry` items `{ key: 'dotted.path' (readOnly), value: internationalizedArrayText }`. The plugin `app/plugins/i18n-sanity.ts` runs a normal Sanity query (`GLOSSAIRE_I18N_QUERY`, `app/queries/glossaire.ts`), rebuilds the nested message tree from the dotted keys per locale, and `mergeLocaleMessage()`s it into vue-i18n (universal plugin → posed at SSR/prerender, serialized in the payload, re-applied on `i18n:localeSwitched` because lazy locale-loading reloads the file on switch). So `$t()` keys are unchanged; **to edit any UI text, edit Sanity — no rebuild of message files**. The `i18n/locales/{fr,en}.json` are therefore (deliberately) near-empty: they hold ONLY `nuxtSiteConfig` (site name/description), read at build by nuxt-site-config / schema.org **before** the runtime plugin runs, so it cannot come from the runtime glossaire. Do NOT move other copy back into these JSON. Sanity was bulk-seeded from the original JSON in a one-off migration (script since removed; the original strings remain in git history).

## Component conventions

Components are auto-imported with their folder path as namespace prefix (nested folders concatenate):

| Folder | Prefix | Example |
|--------|--------|---------|
| `app/components/texts/` | `Texts` | `<TextsH1>` |
| `app/components/atoms/` | `Atoms` | `<AtomsCTA>` |
| `app/components/elements/` | `Elements` | `<ElementsHero>` |
| `app/components/app/` | `App` | `<AppMenu>` |
| `app/components/page/` | `Page` | `<PageModules>`, `<PageCarHero>`, `<PageBioStory>` |
| `app/components/utils/` | `Utils` | `<UtilsBaseLink>` |
| `app/components/svg/` | `Svg` | `<SvgLogo>` |
| `app/components/debug/` | `Debug` | wrapped in `<DevOnly>` |

`page/` regroupe les blocs propres à une page (`car/`, `bio/`) et `Modules.vue`, qui rend le tableau `modules[]` d'une page Sanity.

**`BaseLink` (`app/components/utils/BaseLink.vue`)** — universal link: renders `<button>` (no `to`), `<a target="_blank">` (external/email/phone), or `<NuxtLinkLocale>` (internal). Always use instead of raw `<a>` or `<NuxtLink>`. Maps Sanity document types to routes via `SANITY_ROUTES` (`app/config/I18N_CONFIG.ts`). C'est aussi le point de passage unique des liens WhatsApp (injection du `?text=`, cf. `useWhatsappMessage.ts`).

**`AtomsCTA`** — animated button with GSAP Flip + word-split effect. Themes: `white`, `black`, `orange`.

## SCSS system

Four SCSS partials are auto-injected into every component via Vite's `additionalData` (no explicit imports needed): `_variables`, `_mixins`, `_functions`, `_layout`.

Key helpers:
- `desktop-vw(Npx)` / `mobile-vw(Npx)` — convert px to viewport-relative units (design base: 1920px desktop, 414px mobile)
- `@include mobile` / `@include desktop` — breakpoint at 800px
- `@include desktop-large` — breakpoint at 1440px
- `columns(N)` — CSS grid column span helper
- `@mixin disable-draggable()` — prevent text selection/drag

Colors are CSS custom properties defined in `_colors.scss`. Pattern: `--c-{name}` and `--c-{name}-{opacity}` (5% increments: `-5` to `-100`).
```scss
var(--c-orange)       // full opacity
var(--c-beige-100)    // 100% opacity variant
var(--c-black-40)     // 40% opacity
```

Available colors: `black`, `white`, `red`, `light-1`, `beige`, `orange`.

Grid system (CSS vars): `--layout-columns-count`, `--layout-columns-gap`, `--layout-margin`, `--layout-column-width`. Classes: `.block`, `.block-inner`, `.grid`, `.grid-inner`, `.grid-fullwidth`.

## Composables — `app/composables/`

| File | Purpose |
|------|---------|
| `useFontsReady.ts` | Waits for `document.fonts.ready`, 2.5s fallback timeout. Sets `fontsLoaded` in store |
| `useBreakpoint.js` | VueUse breakpoints: `isMobile` (0–799px), `isDesktop` (800px+), `isDesktopLarge` (1440px+) |
| `usePaneFolder.ts` | Creates Tweakpane debug folder, auto-disposes on unmount. Access root pane via `useNuxtApp().$pane` |
| `useSettings.ts` | Global settings via `useState`, fetched once in `app.vue` |
| `useSanityLang.ts` | Locale courante validée contre les locales i18n (fallback `defaultLocale`) — à passer en `$lang` aux requêtes Sanity |
| `useVideoReady.ts` | Waits for video element to reach ready state |
| `useMenuCtaSync.js` | Shared rect sync object between `AppMenu` and `ElementsHero` CTA (GSAP Flip morph) |
| `useMenuCtaSnap.ts` | Pages sans hero CTA (contact, catalogue, fiche voiture, légal, bio…) : ré-affiche le CTA du menu en place et émet `enter:snap` sur le bus `hero-cta` |
| `usePageSeo.ts` | Per-page SEO via `@nuxtjs/seo` — call with a `Ref<SeoData \| undefined>` from the Sanity query result. Sets `title`, `description`, `ogImage` (Sanity image cropped to **1200×630 JPEG q90** via `useOgImageUrl()`, hotspot/crop respected — JPEG because LinkedIn shows no preview for a WebP og:image) + `ogImageWidth`/`ogImageHeight` (lues dans l'URL via `ogImageSize`, cf. `utils/index.ts` — sans elles WhatsApp/LinkedIn sortent l'aperçu sans visuel au 1er partage). **Aucune balise `twitter:*`** : doublons stricts de l'Open Graph, dépréciées par unhead ; le `twitter:card` auto de nuxt-seo-utils est coupé par `seo.automaticTwitterTags: false` (nuxt.config) — la marque n'a pas de compte X. Global fallback description/image is set in `app.vue`. |
| `useSplitTextAnimation.ts` | GSAP SplitText scroll animation. Accepts a named preset from `TEXT_ANIMATION_CONFIG` plus override options for `split`, `from`, `to`, `scrollTrigger`. Initialises after `fontsLoaded` and on SPA mount. Exposes `{ init }` for manual re-runs. Dev-only Tweakpane pane when `debug: true` (`composables/pane/splitText.ts`). |
| `useIntersectionDebug.ts` | Dev-only IntersectionObserver visualiser — overlays a dashed border + badge on the target element, logs every intersection event. No-op in production. Options: `label`, `rootMargin`, `threshold`, `color`, `offColor`, `enabled`. |
| `useCatalogueListing.ts` | Listing du catalogue : état recherche + filtres ↔ query string ↔ paramètres GROQ, piloté par le registre `ENABLED_FILTERS` |
| `useCarContact.ts` | Contact depuis la fiche voiture : choix du template WhatsApp (`schedule × hasPrice`), remplissage, étiquette `source` pour le tracking du clic |
| `useCurrency.ts` | Devise d'**affichage** EUR/CHF de la fiche voiture. Sanity reste tarifé en EUR : le CHF est une conversion à l'affichage, le prix du JSON-LD `Offer` ne bouge pas. Sélecteur dormant tant que le taux CHF est vide dans Sanity |
| `useAnalytics.ts` | Helpers typés d'événements dataLayer (GA4, snake_case) via le proxy GTM de `@nuxt/scripts` ; no-op sans GTM (mock en dev) |
| `useCookies.ts` | Consentement cookies → `consent.update()` Google Consent Mode v2. Les *defaults* (tout `denied`, `wait_for_update: 500`) sont dans `nuxt.config.ts > scripts.registry` pour partir AVANT gtm.js |
| `useUtm.ts` | Capture des UTM en first-touch sur la session (appelé par `05.utm.client.ts`) |
| `useBouncingLogo.ts` | Logo rebondissant de `AppIdleScreen` |
| `useWhatsappMessage.ts` | Per-page WhatsApp prefill. A page calls `provideWhatsappMessage(computed(() => page.value?.whatsappMessage))`; `BaseLink` (the single link chokepoint) injects `?text=` into any `wa.me`/`whatsapp.com` URL it resolves via `withWhatsappText()`. Pages that don't provide a message (homepage, menu) keep a blank WhatsApp message. Sanity field `whatsappMessage` (tab "WhatsApp") lives on the `professionnel`, `proprietaire`, `catalogue` and `catalogueProfessionnel` singletons; it accepts one token, `{url}`, which `provideWhatsappMessage` fills with the page's absolute URL (`useSiteConfig().url + route.path`, message trimmed — **not** `useRequestURL()`, which is `http://localhost` at prerender and would be frozen into the href). The car page (`carPage`) instead uses an **object `whatsapp` with 4 editable subfield templates** (`withPrice` / `withoutPrice` / `simpleWithPrice` / `simpleWithoutPrice`), each `internationalizedArrayText`, with `{marque}`/`{modele}`/`{prix}`/`{periode}`/`{duree}`/`{quand}`/`{url}` tokens; the sticky-bar cases (`simple*`) have NO duration/`{quand}` selector on the site. The query projects `page.whatsapp { withPrice, … }` (`queries/car.ts`, `CarWhatsappTemplates`); `useCarContact` picks the case by `schedule × hasPrice` and fills via `fillWhatsappTemplate` + `whatsappContactTo` (exported by `useWhatsappMessage.ts`, also used by the `/bio` stories). An empty Sanity field → empty message → `withWhatsappText` returns a plain `wa.me` link (no i18n fallback). `Pricing.vue` + `StickyBar.vue` both pass `page.whatsapp`. Éditeur côté Studio : `../studio/CLAUDE.md`. |

`useViewport.ts` est un fichier vide.

## Directives — `app/directives/`

**`v-menu-theme`** — Changes `menuTheme` in store based on section scroll position (ScrollTrigger):
```html
v-menu-theme="'white'"
v-menu-theme="{ theme: 'white', start: 'top 80px' }"
```

## Queries — `app/queries/`

GROQ query strings alongside TypeScript interfaces, **écrites à la main** (pas de typegen Sanity : une modif de schéma dans `studio/` doit être répercutée ici). Convention:
- Query consts: `UPPERCASE_QUERY`
- Type interfaces: `*Data` suffix

Files: `bio.ts`, `car.ts`, `catalogue.ts`, `contact.ts`, `footer.ts`, `fragments.ts`, `glossaire.ts`, `home.ts`, `i18n.ts`, `legal.ts`, `locations.ts`, `menu.ts`, `modules.ts`, `professionnel.ts`, `proprietaire.ts`, `settings.ts`.

Key shared types in `fragments.ts`: `SanityImage`, `SanityLink` (type: external | email | phone | internal).

**`i18n.ts`** — helpers de projection localisée, à utiliser pour tout champ `internationalizedArray*` : `i18n(field, alias?)` / `i18nBlock(field, alias?)` → `coalesce(field[language == $lang][0].value, field[language == "fr"][0].value)` (fallback FR). La query doit donc recevoir `$lang` (cf. `useSanityLang`). `internalLinkSlug` résout le slug d'un lien interne par locale (seul `legalPage` a un `slugEn`).

**`modules.ts`** — centralises all page-module types and GROQ projections:
- `PageModule` union type covering all module `_type` variants: `hero`, `serviceCards`, `pitch`, `process`, `brandsSection`, `fullscreenMarquee`, `servicePitch`, `title`, `textBlock`, `faq`, `cardsColumn`, `testimonials`
- `MODULES_PROJECTION` — reusable GROQ fragment, include in any page query to get `modules[]` with all variants projected and localised
- `HERO_PROJECTION` / `CAR_LABEL_PROJECTION` — sub-fragments also exported for direct use
- `HeroData` supports `variant: 'variant-1' | 'variant-2' | 'variant-3'` (maps to `ElementsHero1/2/3`)

## Utils — `app/utils/index.ts`

Math: `lerp()`, `modulo()`, `truncate()`, `getRandomBetween()`
Validation: `isValidEmail()`, `isValidURL()`, `isValidPhoneNumber()`
String: `toKebabCase()`, `camelCase()`, `pascalCase()`
DOM: `offsetLeft()` (recursive offset)
Sanity: `sanityUrlToAssetId()` — convert CDN URL to asset ID for `@nuxt/image` ; `ogImageSize()` — lit width/height dans une URL d'image Sanity (pour `og:image:width/height`)

`app/utils/portableText.ts` — maps Sanity portable text block types to auto-imported text components.

## Config — `app/config/`

- `I18N_CONFIG.ts` — `I18N_PAGES` (URLs traduites) + `SANITY_ROUTES` (type Sanity → route), cf. [Routing & i18n](#routing--i18n)
- `CAMERA_CONFIG.ts` — Three.js/TresJS camera presets (`default`, `blank`)
- `SCENE_CONFIG.ts` — TresJS scene config (routeName, cameraType)
- `TEXT_ANIMATION_CONFIG.ts` — 27 named GSAP SplitText animation presets (`TextAnimationStyle`). Each preset defines `split` (SplitText type/mask), `from`/`to` tween vars, `scrollTrigger` defaults, optional `prepare` (e.g. set perspective), and optional full `animate` override. Used exclusively by `useSplitTextAnimation`. Available styles: `slide-x`, `slide-y`, `scatter-in`, `stretch-up`, `scale-y-top`, `converge`, `explode`, `flip-x`, `flip-side`, `scramble`, `scale-center`, `blur-in`, `slide-left-twist`, `flip-3d`, `word-fade`, `tumble-3d`, `depth-in`, `pivot-top`, `pivot-bottom`, `dive-in`, `helix`, `scale-fan`, `wave-drop`, `pin-scale-y`, `word-zoom`, `blur-scale`, `corner-scale`.

## Pages — `app/pages/`

Nom de route = chemin du fichier (segments joints par `-`) ; URL traduite dans `I18N_PAGES`.

- `index.vue` — Homepage (modules Sanity : Hero → ServiceCards → Pitch → ProcessSteps → BrandsSection…)
- `proprietaire.vue` — Owner page
- `professionnel.vue` — Professional/business page
- `catalogue.vue` / `catalogue-professionnel.vue` — listings (`useCatalogueListing`)
- `car/[uid].vue` — fiche voiture (`PageCar*`) + JSON-LD `Product` / `BreadcrumbList`
- `legal/[slug].vue` — pages légales (slug EN via `slugEn` + `useSetI18nParams`)
- `contact.vue` — Contact page (`ElementsContactForm` → `server/api/contact.post.ts` → Airtable)
- `bio.vue` — « link in bio » Instagram (`noindex`, Figma « piste C · Stories ») : one full-bleed story per car of the `bio` singleton (`PageBioListing` → `PageBioStory`, WhatsApp + fiche on each card), fixed copy in the glossaire `bio` namespace, `AppFooterMini` (© + `footer.legalLinks` + back to top, themes `beige`/`black`/`orange`) instead of `AppFooter`. It does NOT call `provideWhatsappMessage`: each story fills the `bio.whatsappMessage` template (`{marque}`/`{modele}`/`{prix}`/`{periode}`/`{url}`) with its own car via `fillWhatsappTemplate` + `whatsappContactTo` (`useWhatsappMessage.ts`, shared with `useCarContact`) — a page message would overwrite that `text` in `BaseLink`.

All pages use `useSanityQuery<T>(QUERY, params)` (avec `params.lang` synchronisé sur `useSanityLang()`) to fetch from Sanity and call `usePageSeo(computed(() => page.value?.seo))` for per-page SEO.

## Debug tooling (Tweakpane)

Use `usePaneFolder(pane, options)` composable to add a folder to the debug pane. It auto-disposes on component unmount. Access the root pane via `nuxtApp.$pane` (or `useNuxtApp().$pane`). Tweakpane n'est chargé que hors prod (le hook `build:manifest` retire son prefetch).

---

## Key Components

### ElementsMedia (`app/components/elements/Media.vue`)

Wrapper around `NuxtPicture` with loading overlay support.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | String | — | Image source (Sanity asset ref or URL) |
| `alt` | String | `''` | Alt text |
| `lazy` | Boolean | `true` | `loading="lazy"` vs `eager` |
| `preload` | Boolean\|Object | `false` | Preload hint (`{ fetchPriority }`) |
| `sizes` | String | `'sm:100vw xl:100vw'` | Responsive sizes string. **Always set this to match the real rendered width (read the CSS).** With the default, NuxtPicture over-fetches the full-width candidate — only correct for genuinely full-bleed media (heroes, full-screen backgrounds) |
| `provider` | `'sanity'`\|`'ipx'`\|undefined | — | Nuxt Image provider |
| `hotspot` | Object | — | Sanity hotspot `{ x, y, width, height }` |
| `crop` | Object | — | Sanity crop `{ top, bottom, left, right }` |
| `modifiers` | Object | — | Extra Nuxt Image modifiers |
| `ratio` | Number | — | Frame width/height. Renders a hand-built webp `<picture>` **cropped by the CDN** (`fit=crop`, hotspot/crop respected, global quality) instead of an uncropped image trimmed by CSS. Use it whenever the frame ratio differs from the photo (portrait car shots in a landscape hero) |
| `mobileRatio` | Number | — | Frame ratio under 800px when it differs from desktop (art direction: `<source media="(max-width: 799px)">` + one `preload` link per media). Car hero: `:ratio="1920 / 950" :mobile-ratio="414 / 680"` |
| `mobileSizes` | String | `'400:100vw 600:100vw sm:100vw'` | `sizes` of the mobile source (only with `mobileRatio`) |
| `overlay` | Boolean\|Object | `true` | Mount the `ElementsMediaOverlay` loading reveal. Object form = `ElementsMediaOverlay` props (`variant`, `color`, `duration`, `blur`, `threshold`, `borderRadius`). **Two variants:** `blur` (default — `backdrop-filter` veil, heavy: pass `false` **or** use `panel` whenever the media sits under a `transform` — parallax heroes, `ServiceCard`, `FullscreenMarquee`, ×N cards) and `panel` (opaque colour `scaleY` wipe, transform-only — safe under a parallax/Embla `transform`, e.g. the car gallery hero `:overlay="{ variant: 'panel', color: 'orange-100' }"`) |
| `parallax` | Boolean\|Object | `false` | Wrap the picture in `UtilsParallax`. Object form = `UtilsParallax` props (`speed`, `scale`, `position`, `reversed`, `id`, `trigger`) |

Exposes `{ mainRef, pictureRef }`. Detects `img.complete` on mount to skip the reveal animation for cached images.

`sizes` reference (screens: `sm:800, md:1280, lg:1440, xl:1920, xxl:2560`): a card spanning `N` of a 12-col grid ≈ `N/12 * 100vw` on desktop; a full-bleed mobile element ≈ `100vw`. Express the value as `vw` (not fixed `px`) so it tracks the design's viewport-relative sizing; the browser handles DPR itself. **Toujours préfixer chaque token (`sm:`/`md:`…)** : un `vw` nu produit un candidat srcset `0w` invalide. `xxl:` n'ajoute un candidat >1920 qu'aux images qui le référencent.

### ElementsMediaOverlay (`app/components/elements/MediaOverlay.vue`)

Loading/reveal overlay mounted inside `ElementsMedia` (when `overlay` is truthy). Reveal triggers once both `loaded` and in-view (IntersectionObserver) latch true. **Two variants via the `variant` prop:**
- `blur` (default): a `backdrop-filter: blur(var(--overlay-blur))` veil at `opacity: 1` that fades to `0`. Heavy under a `transform`.
- `panel`: an opaque `var(--c-{color})` panel (default `orange-100`) revealed by a `scaleY(1)→scaleY(0)` wipe. **Transform-only, no `backdrop-filter`** → stays smooth even on a dragging Embla slider — this is what the car gallery hero uses. Its `transform-origin: center top` + `--ease-in-out-expo` deliberately mirror the page transition's reveal (`Transition.vue`: same `orange-100`, `scaleY` toward the top, `expo.inOut`), so the media wipe reads as a continuation of the page curtain lifting.

A `::after` shimmer (transform `translateX`, compositor-only — not `background-position`) sweeps while `is-loading` = `isShimmering` = in-view **and** not yet revealed, so it never animates offscreen.

**Props:** `loaded: boolean`, `variant?: 'blur' | 'panel'` (default `'blur'`), `color?: string` (CSS token name → `var(--c-{color})`, default `'orange-100'`, panel only), `duration?: number` (seconds; overrides the height-scaled default — e.g. the car hero panel uses `0.5` since a full-screen `scaleY` wipe at 1.2s drags), `blur?: string` (default `'5px'`, blur only), `threshold?: number` (default `0`), `borderRadius?: string` (default `'0px'`).

Reveal duration scales with element height (clamped `0.65s`–`1.2s`, `--ease-in-out-circ`) unless `duration` overrides it.

**Perf — the overlay unmounts itself after the reveal.** A `backdrop-filter` left at `opacity: 0` still forces per-frame layer isolation + filter recompute — invisible but expensive every scroll frame, brutal under a parallax/Embla transform. So once revealed (the reveal never replays), the component drops its node via `v-if="!done"`, set on the reveal's **`transitionend`** (not a timer — so the fade is never cut off; if the event never fires the node simply stays, the original behaviour). Heroes can skip the overlay entirely with `:overlay="false"`; the car gallery hero instead uses the transform-only `panel` variant to get a loading wipe **without** any `backdrop-filter`. **Caveat for looping Embla galleries:** don't gate the media mount with a `visibleIndices` buffer — unmounting/remounting a slide on each loop re-creates the overlay and **replays the reveal on an already-loaded image**. Mount all slides (the panel variant + self-unmount keep it cheap) so each reveals exactly once.

### ElementsMarquee (`app/components/elements/Marquee.vue`)

Infinite scrolling marquee driven by GSAP `fromTo` with `repeat: -1` + ScrollTrigger.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `repeat` | Number | 4 | Number of slot copies rendered |
| `duration` | Number | 5 | Duration of one loop cycle (seconds) |
| `reversed` | Boolean | false | Scroll direction (right → left by default) |
| `pauseOnHover` | Boolean | false | Pause on mouse hover |
| `animatedOnMobile` | Boolean | false | Enable animation on mobile |
| `scrollVelocity` | Boolean | false | Speed up on scroll |
| `scrollVelocitySpeed` | Number | 0.5 | Velocity multiplier |
| `trigger` | HTMLElement\|null | null | External ScrollTrigger trigger element (use parent section when marquee is inside a parallax/animated container) |

**Key patterns:**
- Waits for `fontsLoaded` (Pinia store) before measuring `singleWidth` — critical to avoid seam misalignment
- `singleWidth = Math.round(elementsRef[0].getBoundingClientRect().width)` — rounded to avoid sub-pixel seam
- `useMouseInElement` only set up when `pauseOnHover: true` (avoids unnecessary event listeners)
- `useResizeObserver` with 200ms debounce → teardown + re-setup on resize
- Scroll velocity uses `useLenis(callback)` pattern (idiomatic lenis/vue API) with snappy ramp-up (`duration: 0.15`) and smooth return to 1 (`duration: 1`, triggered 100ms after scroll stops)
- `trigger` prop: use parent section ref when the marquee is inside an element animated by another ScrollTrigger (prevents play/pause firing at wrong scroll positions)

**Do NOT:**
- Use `modifiers: { x: ... }` on the tween — breaks seamless loop for reversed direction
- Call `tween.timeScale(X)` directly for velocity — causes position jump. Use `gsap.to(tween, { timeScale })` instead

### ElementsFullscreenMarquee (`app/components/elements/FullscreenMarquee.vue`)

Fullscreen 100vh section with two marquee rows that scroll vertically (rows translate from top to bottom of section via scrub ScrollTrigger).

- Always pass `:trigger="rootRef"` to both `<ElementsMarquee>` — the rows are animated vertically, so the marquee's own `mainRef` position is unreliable as a scroll trigger
- Slot content is wrapped in `__row-wrapper` div with `gap: desktop-vw(64px)` between items
- Background supports image or video via `backgroundMedia`

---

## Animation Architecture Reference

```
Tempus (RAF patcher)
  ├── GSAP (hooked via gsap.updateRoot)
  │     ├── ScrollTrigger (scroll-linked animations)
  │     ├── SplitText (text splitting)
  │     └── Flip (layout animations)
  └── Lenis (smooth scroll, driven by Tempus)
        └── lenis/nuxt module (VueLenis + useLenis)
```

**GSAP context pattern** (always use in components):
```js
ctx = gsap.context(() => {
  tween = gsap.fromTo(...)
}, rootRef.value!)

// cleanup
ctx?.revert()
```

**ScrollTrigger on animated parent elements**: when a component is inside a GSAP-animated container, use the parent's element as `trigger` (not the component's own ref), otherwise the trigger position is distorted by the parent's transform.

---

## Nuxt config highlights (`nuxt.config.ts`)

- Modules: `@nuxt/eslint`, `@nuxt/image`, `@nuxt/fonts`, `@vueuse/nuxt`, `@pinia/nuxt`, `@nuxtjs/seo`, `@nuxtjs/i18n`, `@nuxtjs/sanity`, `lenis/nuxt`, `@nuxt/ui`, `@nuxt/scripts`
- Sanity : `perspective: 'published'`, `useCdn: true`, pas de `globalHelper` (`useSanity()`/`useSanityQuery()` sont auto-importés) ; visual editing commenté
- i18n : locales construites depuis `../shared/languages` (+ `LOCALE_IETF` fr-FR/en-GB), `customRoutes: 'config'` + `pages: I18N_PAGES`, `skipSettingLocaleOnNavigate: true`
- Fonts (locales, `public/fonts/`, `src` explicite pour court-circuiter l'heuristique du provider local) : Lora (400), HaasGrotDispMedium (600), HaasGrotDispRegular (400), HaasGrotDispBold (700)
- Image: avif/webp, quality 90, Sanity provider + Netlify/ipxStatic/ipx based on env, screens: 800, 1280, 1440, 1920, `xxl` 2560
- GTM (`@nuxt/scripts`) : ID injecté au **runtime** (`NUXT_PUBLIC_SCRIPTS_GOOGLE_TAG_MANAGER_ID`, gtm.js non bundlé), `trigger: 'onNuxtReady'` obligatoire en v1 (`trigger: false` désactiverait GTM entièrement), Consent Mode v2 `denied` par défaut, **mock en dev** (`$development`)
- `runtimeConfig` : `airtableToken` / `airtableBaseId` / `airtableTableId` (serveur), `public.IS_PROD`, `public.scripts.googleTagManager.id`
- SEO (`@nuxtjs/seo`): `site.name = 'BORA CARS'`, `site.separator = '—'`, `site.trailingSlash: false`, `site.indexable` gated on `NUXT_PUBLIC_IS_PROD`. `ogImage` disabled. Per-page SEO via `usePageSeo()`. Global fallback description/image in `app.vue` via `useSeoMeta`.
- **schema.org** (`nuxt-schema-org`, part of `@nuxtjs/seo`): `WebSite` + `WebPage` nodes are **auto-generated** by the module — including the full i18n graph (per-locale `WebSite` with `inLanguage` + `translationOfWork`/`workTranslation`, `WebPage` `isPartOf`). So **do NOT** add manual `defineWebSite`/`defineWebPage` (they duplicate the auto nodes; `WebPage` infers `name`/`description` from the `<title>`/`<meta description>` set by `usePageSeo`). The only thing declared by hand is the **identity**, built dynamically from Sanity in `app.vue` (`useSchemaOrg(computed(...))`): one `Organization` (the brand, explicit `@id` `…/#identity` — preserved verbatim because it starts with `http`, and recognised as the identity since `resolveAsGraphKey` → `#identity`) **+ one `AutoRental` node per agency**. **Agencies are the `location` (Lieu) documents** — the single source already shared by menu/footer/cars — queried via `LOCATIONS_QUERY` (`queries/locations.ts`, all `*[_type=="location"]`). Each `AutoRental` has the Lieu's address/geo/telephone/openingHours, `parentOrganization` → the brand, and `sameAs` = the Lieu's `link` (its Google Business/kgmid URL — **per agency**, not brand-level: each Google listing = one establishment). `location` docs carry SEO fields (`country`, `geo`, `openingHours`, group "SEO local") added on top of the display fields. Brand-level fields (`email`/`priceRange`/`areaServed`/`socialLinks` = brand socials only) live in the `settings` singleton (group "Établissement"). `schemaOrg: { reactive: false }` is deliberate: with `reactive: true` the JSON-LD is rendered at SSR **and** re-injected client-side, so unhead merges the two same-`@id` `#identity` nodes and **concatenates** their array props (`sameAs`/`areaServed` show up doubled). JSON-LD is crawler-only (crawlers read the SSR/prerendered HTML, never SPA nav), so client resync adds nothing — keep it off. The auto `WebSite` description is fed per-locale via the i18n `nuxtSiteConfig.name`/`nuxtSiteConfig.description` keys (`i18n/locales/*.json`). **Car pages** (`pages/car/[uid].vue`) add a `Product` node (NOT `Car`/`Vehicle` — Google's "Vehicle listing" rich result is sale-only, "Product snippet" is purchasable-only; rentals fit neither, so a plain `Product` avoids both the vehicle-listing-for-sale evaluation and "unknown property" warnings). Vehicle specs go in `additionalProperty` (localized via the `car.specs.*` i18n keys); the `Offer` uses `businessFunction: LeaseOut` + `UnitPriceSpecification` (rental rate per day/month, not a sale). **+ a `BreadcrumbList`** (Accueil → Catalogue → car, labels via the `breadcrumb.*` i18n keys). The sitemap source (`server/api/__sitemap__/urls.ts`) emits per-car `lastmod` from Sanity `_updatedAt`.
- SCSS `additionalData`: auto-injects `_variables`, `_mixins`, `_functions`, `_layout`
- Vue 3.5, Nuxt 4.5, Vite 8, ESLint 10 (`@antfu/eslint-config` v9 + `@nuxt/eslint`), Pinia 4

### Rendu & déploiement

- **Toujours le preset Nitro `netlify`** (jamais `netlify_static` ni `nuxt generate`) : la prod a besoin de Netlify Functions au runtime pour `/api/contact` (Airtable) **et** `/_i18n/<hash>/<locale>/messages.json`.
- `NUXT_PUBLIC_IS_PROD=true` (branche `main`) → hybride : `nitro.prerender` part de `/fr`, `/en` + les chemins bio (`crawlLinks`), HTML statique servi par le CDN + fonctions. `false` (branche `develop`) → SSR pur, contenu Sanity toujours frais, non indexable. Les deux sont posés par contexte dans `netlify.toml`.
- `routeRules` : `/` → `/fr` et `/bio` → `/fr/bio` en **301 serveur** (compilées dans `_redirects`) ; `/en/catalogue` → `/en/catalog` ; pages bio en `robots: 'noindex, follow'` (via routeRules, **pas** `definePageMeta({ robots })`, lu trop tard par @nuxtjs/robots).
- `prerender.ignore` exclut `/` et `/bio` : sinon le prerender écrit un stub HTML meta-refresh que Netlify sert AVANT la règle `_redirects` (200 au lieu de 301). `autoSubfolderIndex: false` → `fr.html` servi en 200 direct sur `/fr` (aligné sur canonical/sitemap sans slash).
- `netlify.toml` pose `Access-Control-Allow-Origin: *` sur `/_nuxt/builds/latest.json` : le Dashboard du Studio (autre origine) y lit la date du build en ligne. **Ne pas retirer cet en-tête.**

### Pièges de dépendances (à relire avant tout `npm update`)

- **`@vue/devtools-api` est une dépendance obligatoire**, pas un reliquat : depuis Pinia 4 c'est un *peer* non optionnel que l'app doit installer elle-même (Pinia ne l'embarque plus). Ne pas la supprimer sous prétexte qu'aucun fichier ne l'importe.
- **`vue-router` doit rester aligné sur la version embarquée par Nuxt** (Nuxt 4.5 → `vue-router@^5`). Une plage divergente dans `package.json` fait cohabiter **deux copies** : Nuxt utilise la sienne, et tout `import { onBeforeRouteLeave } from 'vue-router'` dans l'app tape dans l'autre → clés d'injection différentes, le guard ne s'enregistre jamais (échec **silencieux**). Vérifier après chaque bump de Nuxt : `find node_modules -maxdepth 4 -path "*vue-router/package.json"` ne doit renvoyer qu'une ligne.
- **TypeScript reste en 6.x** : `typescript-eslint` (tiré par `@antfu/eslint-config` et `@nuxt/eslint`) déclare `typescript >=4.8.4 <6.1.0`, et TS 7 n'expose pas encore d'API programmatique (attendue en 7.1) — donc ni typescript-eslint ni les outils Vue ne peuvent tourner dessus. `npm i typescript@7` échoue en ERESOLVE.
- `npm install <pkg>` peut échouer en ERESOLVE sur les *peers optionnels* de `@antfu/eslint-config` (chaîne `eslint-plugin-astro` → `@typescript-eslint/parser`) alors qu'ils ne sont pas installés. Résolution : réinstallation propre (`rm -rf node_modules package-lock.json && npm install`), jamais `--force`/`--legacy-peer-deps`.
- **Auto-imports** : un `export const X = { … }` sans `;` final peut faire disparaître l'export **suivant** du même fichier des auto-imports → 500 « X is not defined » au runtime.
