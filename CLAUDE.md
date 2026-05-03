# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (binds to 0.0.0.0, requires .env)
npm run dev

# Build / Generate
npm run build
npm run generate          # uses .env
npm run generate:ftp      # uses .env.ftp

# Lint
npm run lint
npm run lint:fix
```

Copy `.blank.env` to `.env` and set `NUXT_PUBLIC_IS_FTP=false` to get started.

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
| `usePageSeo.ts` | Per-page SEO via `@nuxtjs/seo` — call with a `Ref<SeoData \| undefined>` from the Sanity query result. Sets `title`, `description`, `ogImage`, `twitterTitle`. Global fallback description/image is set in `app.vue`. |
| `useSplitTextAnimation.ts` | GSAP SplitText scroll animation. Accepts a named preset from `TEXT_ANIMATION_CONFIG` plus override options for `split`, `from`, `to`, `scrollTrigger`. Initialises after `fontsLoaded` and on SPA mount. Exposes `{ init }` for manual re-runs. Dev-only Tweakpane pane when `debug: true`. |
| `useIntersectionDebug.ts` | Dev-only IntersectionObserver visualiser — overlays a dashed border + badge on the target element, logs every intersection event. No-op in production. Options: `label`, `rootMargin`, `threshold`, `color`, `offColor`, `enabled`. |

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
| `sizes` | String | — | Responsive sizes string |
| `provider` | `'sanity'`\|`'ipx'`\|undefined | — | Nuxt Image provider |
| `hotspot` | Object | — | Sanity hotspot `{ x, y, width, height }` |
| `crop` | Object | — | Sanity crop `{ top, bottom, left, right }` |
| `modifiers` | Object | — | Extra Nuxt Image modifiers |
| `overlay` | Boolean | `true` | Show reveal overlay (disable for non-animated contexts) |
| `overlayColor` | String | `'beige'` | CSS color token name for the overlay |

Exposes `{ mainRef, pictureRef }`. Detects `img.complete` on mount to skip the reveal animation for cached images.

### ElementsMediaOverlay (`app/components/elements/MediaOverlay.vue`)

Reveal overlay used inside `ElementsMedia`. Scales down (`scaleY: 1 → 0`, origin bottom) when both `loaded` and in-view. Shows a shimmer sweep while loading.

**Props:** `loaded: boolean`, `threshold?: number` (IO threshold, default 0.1), `color?: string` (CSS token, default `'beige'`), `borderRadius?: string`.

Reveal duration scales with element height: `height / 1000 * 1.5s`, clamped to `[0.7s, 1.6s]`.

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

- Modules: `@nuxt/eslint`, `@nuxt/image`, `@nuxt/fonts`, `@vueuse/nuxt`, `@pinia/nuxt`, `@nuxtjs/seo`, `@nuxtjs/i18n`, `@nuxtjs/sanity`, `lenis/nuxt`
- Fonts: Lora (400), HaasGrotDispMedium (600), HaasGrotDispRegular (400)
- Image: avif/webp, Sanity provider + Netlify/ipxStatic/ipx based on env, breakpoints: 800, 1280, 1440, 1920
- SEO (`@nuxtjs/seo`): `site.name = 'BORA CARS'`, `site.separator = '—'`, `site.indexable = false`. `ogImage` disabled. `schemaOrg` identity set to Organization. Per-page SEO via `usePageSeo()`. Global fallback description/image in `app.vue` via `useSeoMeta`.
- SCSS `additionalData`: auto-injects `_variables`, `_mixins`, `_functions`, `_layout`
- Vue version: 3.5.17, Nuxt: 4.4.2
