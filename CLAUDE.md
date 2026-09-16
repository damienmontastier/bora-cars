# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (binds to 0.0.0.0, requires .env)
npm run dev               # web (:3000) + studio (:3334) en parallèle

# Build / Generate
npm run build
npm run generate          # uses .env
npm run generate:ftp      # uses .env.ftp

# Lint / Types
npm run lint
npm run lint:fix
npm --prefix web run typecheck      # nuxt typecheck (vue-tsc)
npm --prefix studio run typecheck   # tsc --noEmit
```

Copy `.blank.env` to `.env`

**Port du Studio : 3334**, pas le 3333 par défaut de Sanity (`server.port` dans `studio/sanity.cli.ts`) — 3333 est partagé par tous les Studios de la machine, donc occupé dès qu'un autre projet Sanity tourne. Surchargeable par `SANITY_STUDIO_PORT` (lu depuis `studio/.env`, vérifié) ou en one-shot : `npm --prefix studio run dev -- --port 3335`.

## Architecture

**Monorepo** with two apps:
- `/web` — Nuxt 4 frontend (all source under `app/`)
- `/studio` — Sanity CMS

**Nuxt 4** uses the `app/` directory layout (compat mode). Root `package.json` orchestrates both apps via `npm --prefix`.

---

## Web App — Nuxt 4

### Plugin boot order (client-only, strictly numbered)

1. `01.tempus.client.js` — patches `requestAnimationFrame` via **Tempus**, disconnects GSAP's internal ticker
2. `02.gsap.client.js` — registers GSAP plugins (ScrollTrigger, SplitText, Flip), hooks GSAP into Tempus via `gsap.updateRoot`
3. `03.pane.client.js` — creates **Tweakpane** debug UI (FPS graph) driven by Tempus, provides `$pane`
4. `04.directives.client.ts` — registers `v-menu-theme` directive

**All animations must go through Tempus, never GSAP's own ticker.**

**API Tempus v1** (depuis `tempus@1.0.0`, ex-`1.0.0-dev.x`) — deux changements *breaking* :
- le callback reçoit **un objet d'état unique** `({ time, deltaTime, frame, budget })`, plus des arguments positionnels `(time, deltaTime)` → écrire `Tempus.add(({ time }) => …)` ;
- l'option `priority` s'appelle désormais **`order`** (même sémantique : le plus bas tourne en premier ; `priority` reste accepté comme alias déprécié).

Ordre d'exécution du projet : `lenis` (`order: -2`) → `gsap.updateRoot` (`order: -1`) → le reste (`order: 0`, ex. la parallaxe FAQ).
Chaque `Tempus.add()` passe aussi un `label` : il identifie le callback dans `Tempus.inspect()` et dans l'overlay `tempus/profiler` (`import { profiler } from 'tempus/profiler'`), qui affiche en direct comment chaque callback remplit le budget de frame. `state.budget()` (ms restantes dans la frame) permet de conditionner du travail optionnel.

### Global state — `app/stores/index.ts`

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

### Routing & i18n

Routes are locale-prefixed (`strategy: 'prefix'`). Default locale is `fr`. Always use `NuxtLinkLocale` for internal navigation (handled automatically by `BaseLink`). Locale files: `i18n/locales/fr.json` and `i18n/locales/en.json`. Sanity content is also localized FR/EN — see `app/queries/i18n.ts` and `app/composables/useSanityLang.ts`.

**The UI micro-copy lives in Sanity, fetched at runtime like all other content.** It's the `glossaire` singleton (Studio: « Glossaire (traductions) ») — one field-group tab per top-level i18n namespace, each a flat list of `glossaryEntry` items `{ key: 'dotted.path' (readOnly), value: internationalizedArrayText }`. The plugin `app/plugins/i18n-sanity.ts` runs a normal Sanity query (`GLOSSAIRE_I18N_QUERY`, `app/queries/glossaire.ts`), rebuilds the nested message tree from the dotted keys per locale, and `mergeLocaleMessage()`s it into vue-i18n (universal plugin → posed at SSR/prerender, serialized in the payload, re-applied on `i18n:localeSwitched` because lazy locale-loading reloads the file on switch). So `$t()` keys are unchanged; **to edit any UI text, edit Sanity — no rebuild of message files**. The `i18n/locales/{fr,en}.json` are therefore (deliberately) near-empty: they hold ONLY `nuxtSiteConfig` (site name/description), read at build by nuxt-site-config / schema.org **before** the runtime plugin runs, so it cannot come from the runtime glossaire. Do NOT move other copy back into these JSON. Sanity was bulk-seeded from the original JSON in a one-off migration (script since removed; the original strings remain in git history).

### Component conventions

Components are auto-imported with their folder as namespace prefix:

| Folder | Prefix | Example |
|--------|--------|---------|
| `app/components/texts/` | `Texts` | `<TextsH1>` |
| `app/components/atoms/` | `Atoms` | `<AtomsCTA>` |
| `app/components/elements/` | `Elements` | `<ElementsHero>` |
| `app/components/app/` | `App` | `<AppMenu>` |
| `app/components/utils/` | `Utils` | `<UtilsBaseLink>` |
| `app/components/svg/` | `Svg` | `<SvgLogo>` |
| `app/components/debug/` | `Debug` | wrapped in `<DevOnly>` |

**`BaseLink` (`app/components/utils/BaseLink.vue`)** — universal link: renders `<button>` (no `to`), `<a target="_blank">` (external/email/phone), or `<NuxtLinkLocale>` (internal). Always use instead of raw `<a>` or `<NuxtLink>`. Maps Sanity document types to routes via `INTERNAL_ROUTES`.

**`AtomsCTA`** — animated button with GSAP Flip + word-split effect. Themes: `white`, `black`, `orange`.

### SCSS system

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

### Composables — `app/composables/`

| File | Purpose |
|------|---------|
| `useFontsReady.ts` | Waits for `document.fonts.ready`, 2.5s fallback timeout. Sets `fontsLoaded` in store |
| `useBreakpoint.js` | VueUse breakpoints: `isMobile` (0–799px), `isDesktop` (800px+), `isDesktopLarge` (1440px+) |
| `usePaneFolder.ts` | Creates Tweakpane debug folder, auto-disposes on unmount. Access root pane via `useNuxtApp().$pane` |
| `useSettings.ts` | Global settings via `useState`, fetched once in `app.vue` |
| `useVideoReady.ts` | Waits for video element to reach ready state |
| `useMenuCtaSync.js` | Shared rect sync object between `AppMenu` and `ElementsHero` CTA (GSAP Flip morph) |
| `usePageSeo.ts` | Per-page SEO via `@nuxtjs/seo` — call with a `Ref<SeoData \| undefined>` from the Sanity query result. Sets `title`, `description`, `ogImage` + `ogImageWidth`/`ogImageHeight` (déduites de l'URL via `ogImageSize`, cf. `utils/index.ts` — sans elles WhatsApp/LinkedIn sortent l'aperçu sans visuel au 1er partage). **Aucune balise `twitter:*`** : doublons stricts de l'Open Graph, dépréciées par unhead ; le `twitter:card` auto de nuxt-seo-utils est coupé par `seo.automaticTwitterTags: false` (nuxt.config) — la marque n'a pas de compte X. Global fallback description/image is set in `app.vue`. |
| `useSplitTextAnimation.ts` | GSAP SplitText scroll animation. Accepts a named preset from `TEXT_ANIMATION_CONFIG` plus override options for `split`, `from`, `to`, `scrollTrigger`. Initialises after `fontsLoaded` and on SPA mount. Exposes `{ init }` for manual re-runs. Dev-only Tweakpane pane when `debug: true`. |
| `useIntersectionDebug.ts` | Dev-only IntersectionObserver visualiser — overlays a dashed border + badge on the target element, logs every intersection event. No-op in production. Options: `label`, `rootMargin`, `threshold`, `color`, `offColor`, `enabled`. |
| `useWhatsappMessage.ts` | Per-page WhatsApp prefill. A page calls `provideWhatsappMessage(computed(() => page.value?.whatsappMessage))`; `BaseLink` (the single link chokepoint) injects `?text=` into any `wa.me`/`whatsapp.com` URL it resolves via `withWhatsappText()`. Pages that don't provide a message (homepage, menu) keep a blank WhatsApp message. Sanity field `whatsappMessage` (tab "WhatsApp", static text) lives on the `professionnel`, `proprietaire` and `catalogue` singletons. The car page (`carPage`) instead uses an **object `whatsapp` with 4 editable subfield templates** (`withPrice` / `withoutPrice` / `simpleWithPrice` / `simpleWithoutPrice`), each `internationalizedArrayText`, with `{marque}`/`{modele}`/`{prix}`/`{periode}`/`{duree}`/`{quand}`/`{url}` tokens. The sticky-bar cases (`simple*`) have NO duration/`{quand}` selector on the site → their descriptions warn against `{duree}`/`{quand}`. The custom Studio input `studio/components/WhatsappTemplatesInput.tsx` is set as `components.input` on the **object** (not per field): one shared chip bar + `renderDefault` (the 4 subfields) + ONE car/language selector driving all 4 live previews. The query projects `page.whatsapp { withPrice, … }` (`queries/car.ts`, `CarWhatsappTemplates`); `useCarContact` picks the case by `schedule × hasPrice` and fills via `fillTemplate`. An empty Sanity field → empty message → `withWhatsappText` returns a plain `wa.me` link (no i18n fallback). `Pricing.vue` + `StickyBar.vue` both pass `page.whatsapp`. |

### Directives — `app/directives/`

**`v-menu-theme`** — Changes `menuTheme` in store based on section scroll position (ScrollTrigger):
```html
v-menu-theme="'white'"
v-menu-theme="{ theme: 'white', start: 'top 80px' }"
```

### Queries — `app/queries/`

GROQ query strings alongside TypeScript interfaces. Convention:
- Query consts: `UPPERCASE_QUERY`
- Type interfaces: `*Data` suffix

Files: `fragments.ts`, `menu.ts`, `settings.ts`, `home.ts`, `proprietaire.ts`, `professionnel.ts`, `contact.ts`, `modules.ts`.

Key shared types in `fragments.ts`: `SanityImage`, `SanityLink` (type: external | email | phone | internal).

**`modules.ts`** — centralises all page-module types and GROQ projections:
- `PageModule` union type covering all module `_type` variants: `hero`, `serviceCards`, `pitch`, `process`, `brandsSection`, `fullscreenMarquee`, `servicePitch`, `title`, `textBlock`, `faq`, `cardsColumn`, `testimonials`
- `MODULES_PROJECTION` — reusable GROQ fragment, include in any page query to get `modules[]` with all variants projected and localised
- `HERO_PROJECTION` / `CAR_LABEL_PROJECTION` — sub-fragments also exported for direct use
- `HeroData` supports `variant: 'variant-1' | 'variant-2' | 'variant-3'` (maps to `ElementsHero1/2/3`)

### Utils — `app/utils/index.ts`

Math: `lerp()`, `modulo()`, `truncate()`, `getRandomBetween()`
Validation: `isValidEmail()`, `isValidURL()`, `isValidPhoneNumber()`
String: `toKebabCase()`, `camelCase()`, `pascalCase()`
DOM: `offsetLeft()` (recursive offset)
Sanity: `sanityUrlToAssetId()` — convert CDN URL to asset ID for `@nuxt/image`

`app/utils/portableText.ts` — maps Sanity portable text block types to auto-imported text components.

### Config — `app/config/`

- `CAMERA_CONFIG.ts` — Three.js/TresJS camera presets (`default`, `blank`)
- `SCENE_CONFIG.ts` — TresJS scene config (routeName, cameraType)
- `TEXT_ANIMATION_CONFIG.ts` — 22 named GSAP SplitText animation presets (`TextAnimationStyle`). Each preset defines `split` (SplitText type/mask), `from`/`to` tween vars, `scrollTrigger` defaults, optional `prepare` (e.g. set perspective), and optional full `animate` override. Used exclusively by `useSplitTextAnimation`. Available styles: `slide-x`, `slide-y`, `scatter-in`, `stretch-up`, `scale-y-top`, `converge`, `explode`, `flip-x`, `flip-side`, `scramble`, `scale-center`, `blur-in`, `slide-left-twist`, `flip-3d`, `word-fade`, `tumble-3d`, `depth-in`, `pivot-top`, `pivot-bottom`, `dive-in`, `helix`, `scale-fan`, `wave-drop`, `pin-scale-y`, `word-zoom`, `blur-scale`, `corner-scale`.

### Pages — `app/pages/`

- `index.vue` — Homepage (Hero → ServiceCards → Pitch → ProcessSteps → BrandsSection → Footer)
- `proprietaire.vue` — Owner page
- `professionnel.vue` — Professional/business page
- `contact.vue` — Contact page (WIP)

All pages use `useSanityQuery<T>(QUERY)` to fetch from Sanity and call `usePageSeo(computed(() => page.value?.seo))` for per-page SEO.

### Debug tooling (Tweakpane)

Use `usePaneFolder(pane, options)` composable to add a folder to the debug pane. It auto-disposes on component unmount. Access the root pane via `nuxtApp.$pane` (or `useNuxtApp().$pane`).

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
| `overlay` | Boolean\|Object | `true` | Mount the `ElementsMediaOverlay` loading reveal. Object form = `ElementsMediaOverlay` props (`variant`, `color`, `duration`, `blur`, `threshold`, `borderRadius`). **Two variants:** `blur` (default — `backdrop-filter` veil, heavy: pass `false` **or** use `panel` whenever the media sits under a `transform` — parallax heroes, `ServiceCard`, `FullscreenMarquee`, ×N cards) and `panel` (opaque colour `scaleY` wipe, transform-only — safe under a parallax/Embla `transform`, e.g. the car gallery hero `:overlay="{ variant: 'panel', color: 'orange-100' }"`) |
| `parallax` | Boolean\|Object | `false` | Wrap the picture in `UtilsParallax`. Object form = `UtilsParallax` props (`speed`, `scale`, `position`, `reversed`, `id`, `trigger`) |

Exposes `{ mainRef, pictureRef }`. Detects `img.complete` on mount to skip the reveal animation for cached images.

`sizes` reference (screens: `sm:800, md:1280, lg:1440, xl:1920`): a card spanning `N` of a 12-col grid ≈ `N/12 * 100vw` on desktop; a full-bleed mobile element ≈ `100vw`. Express the value as `vw` (not fixed `px`) so it tracks the design's viewport-relative sizing; the browser handles DPR itself.

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

## Sanity Studio — `/studio`

### Schema structure

**Singletons** (restricted — no create/delete): `homepage`, `proprietaire`, `professionnel`, `menu`, `footer`, `settings`

**Documents**: `car` (voiture), `location` (lieu)

**Modules** (used as array items in singletons): `hero`, `serviceCards`, `pitch`, `process`, `brandsSection`, `fullscreenMarquee`, `cardsColumn`, `testimonials`, `title`, `text`, `faq`

**Objects**: `customImage`, `customVideo`, `customMedia`, `customLink`, `processStep`, `seo`

**Studio structure**: Pages → Catalogue (cars, locations) → Navigation (menu, footer) → Settings

### Sanity config

- Project ID: `xyw8hnp3`, dataset: `production`, apiVersion: `2026-04-06`
- Plugins: `linkField` (custom link type), `structureTool`, `visionTool`
- **Studio v6** (Node ≥ 22.12, build Vite 8/Rolldown, React strict mode activé en dev). Conventions d'import imposées par les libs qui l'accompagnent :
  - `@sanity/icons` v5 — **plus de barrel** : `import { HomeIcon } from '@sanity/icons/Home'` (sous-chemin = nom de l'icône sans le suffixe `Icon`), jamais `from '@sanity/icons'`.
  - `@sanity/ui` v4 — `Tooltip` → `@sanity/ui/tooltip`, `useToast`/`ToastProvider` → `@sanity/ui/toast` ; props renommées : `Stack`/`Inline` `space` → **`gap`**, `Grid` `columns`/`rows` → **`gridTemplateColumns`/`gridTemplateRows`**, `Badge` `mode` supprimée. Les anciennes ne sont plus lues au runtime (l'espacement disparaît silencieusement) — le typecheck les signale.
  - `@sanity/icons`, `@sanity/ui` et `@sanity/image-url` sont déclarés en dépendances directes (ils sont importés directement par le code du Studio).
- `npx tsc --noEmit` dans `/studio` doit rester vert (aucun script `typecheck` en CI, mais c'est le filet pour ces migrations de types).

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

## Nuxt config highlights (`web/nuxt.config.ts`)

- Modules: `@nuxt/eslint`, `@nuxt/image`, `@nuxt/fonts`, `@vueuse/nuxt`, `@pinia/nuxt`, `@nuxtjs/seo`, `@nuxtjs/i18n`, `@nuxtjs/sanity`, `lenis/nuxt`, `@nuxt/ui`, `@nuxt/scripts`
- Fonts: Lora (400), HaasGrotDispMedium (600), HaasGrotDispRegular (400)
- Image: avif/webp, Sanity provider + Netlify/ipxStatic/ipx based on env, breakpoints: 800, 1280, 1440, 1920
- SEO (`@nuxtjs/seo`): `site.name = 'BORA CARS'`, `site.separator = '—'`, `site.indexable` gated on `NUXT_PUBLIC_IS_PROD`. `ogImage` disabled. Per-page SEO via `usePageSeo()`. Global fallback description/image in `app.vue` via `useSeoMeta`.
- **schema.org** (`nuxt-schema-org`, part of `@nuxtjs/seo`): `WebSite` + `WebPage` nodes are **auto-generated** by the module — including the full i18n graph (per-locale `WebSite` with `inLanguage` + `translationOfWork`/`workTranslation`, `WebPage` `isPartOf`). So **do NOT** add manual `defineWebSite`/`defineWebPage` (they duplicate the auto nodes; `WebPage` infers `name`/`description` from the `<title>`/`<meta description>` set by `usePageSeo`). The only thing declared by hand is the **identity**, built dynamically from Sanity in `app.vue` (`useSchemaOrg(computed(...))`): one `Organization` (the brand, explicit `@id` `…/#identity` — preserved verbatim because it starts with `http`, and recognised as the identity since `resolveAsGraphKey` → `#identity`) **+ one `AutoRental` node per agency**. **Agencies are the `location` (Lieu) documents** — the single source already shared by menu/footer/cars — queried via `LOCATIONS_QUERY` (`queries/locations.ts`, all `*[_type=="location"]`). Each `AutoRental` has the Lieu's address/geo/telephone/openingHours, `parentOrganization` → the brand, and `sameAs` = the Lieu's `link` (its Google Business/kgmid URL — **per agency**, not brand-level: each Google listing = one establishment). `location` docs carry SEO fields (`country`, `geo`, `openingHours`, group "SEO local") added on top of the display fields. Brand-level fields (`email`/`priceRange`/`areaServed`/`socialLinks` = brand socials only) live in the `settings` singleton (group "Établissement"). `schemaOrg: { reactive: false }` is deliberate: with `reactive: true` the JSON-LD is rendered at SSR **and** re-injected client-side, so unhead merges the two same-`@id` `#identity` nodes and **concatenates** their array props (`sameAs`/`areaServed` show up doubled). JSON-LD is crawler-only (crawlers read the SSR/prerendered HTML, never SPA nav), so client resync adds nothing — keep it off. The auto `WebSite` description is fed per-locale via the i18n `nuxtSiteConfig.name`/`nuxtSiteConfig.description` keys (`i18n/locales/*.json`). **Car pages** (`pages/car/[uid].vue`) add a `Product` node (NOT `Car`/`Vehicle` — Google's "Vehicle listing" rich result is sale-only, "Product snippet" is purchasable-only; rentals fit neither, so a plain `Product` avoids both the vehicle-listing-for-sale evaluation and "unknown property" warnings). Vehicle specs go in `additionalProperty` (localized via the `car.specs.*` i18n keys); the `Offer` uses `businessFunction: LeaseOut` + `UnitPriceSpecification` (rental rate per day/month, not a sale). **+ a `BreadcrumbList`** (Accueil → Catalogue → car, labels via the `breadcrumb.*` i18n keys). The sitemap source (`server/api/__sitemap__/urls.ts`) emits per-car `lastmod` from Sanity `_updatedAt`.
- SCSS `additionalData`: auto-injects `_variables`, `_mixins`, `_functions`, `_layout`
- Vue 3.5, Nuxt 4.5, Vite 8, ESLint 10 (`@antfu/eslint-config` v9 + `@nuxt/eslint`), Pinia 4

### Pièges de dépendances (à relire avant tout `npm update`)

- **`@vue/devtools-api` est une dépendance obligatoire**, pas un reliquat : depuis Pinia 4 c'est un *peer* non optionnel que l'app doit installer elle-même (Pinia ne l'embarque plus). Ne pas la supprimer sous prétexte qu'aucun fichier ne l'importe.
- **`vue-router` doit rester aligné sur la version embarquée par Nuxt** (Nuxt 4.5 → `vue-router@^5`). Une plage divergente dans `package.json` fait cohabiter **deux copies** : Nuxt utilise la sienne, et tout `import { onBeforeRouteLeave } from 'vue-router'` dans l'app tape dans l'autre → clés d'injection différentes, le guard ne s'enregistre jamais (échec **silencieux**). Vérifier après chaque bump de Nuxt : `find node_modules -maxdepth 4 -path "*vue-router/package.json"` ne doit renvoyer qu'une ligne.
- **TypeScript reste en 6.x** : `typescript-eslint` (tiré par `@antfu/eslint-config` et `@nuxt/eslint`) déclare `typescript >=4.8.4 <6.1.0`, et TS 7 n'expose pas encore d'API programmatique (attendue en 7.1) — donc ni typescript-eslint ni les outils Vue ne peuvent tourner dessus. `npm i typescript@7` échoue en ERESOLVE.
- `npm install <pkg>` peut échouer en ERESOLVE sur les *peers optionnels* de `@antfu/eslint-config` (chaîne `eslint-plugin-astro` → `@typescript-eslint/parser`) alors qu'ils ne sont pas installés. Résolution : réinstallation propre (`rm -rf node_modules package-lock.json && npm install`), jamais `--force`/`--legacy-peer-deps`.
