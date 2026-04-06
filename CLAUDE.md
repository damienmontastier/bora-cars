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

**Nuxt 4** app using the `app/` directory layout (Nuxt 4 compat mode). All source lives under `app/`.

### Plugin boot order (client-only)

Plugins run in numbered order and are tightly coupled:

1. `01.tempus.client.js` — patches `requestAnimationFrame` via **Tempus** and disconnects GSAP's internal ticker
2. `02.gsap.client.js` — registers GSAP plugins (ScrollTrigger, SplitText) and hooks GSAP into Tempus via `$nuxt.$tempus`
3. `03.pane.client.js` — creates a **Tweakpane** debug UI (FPS graph) driven by Tempus; provides `$pane` for adding debug controls

All animations must go through Tempus, never GSAP's own ticker.

### Global state

`app/stores/index.ts` — single Pinia store (`useAppStore`) tracking `fontsLoaded` and `preloaderDone`. `app.vue` watches `useFontsReady()` and sets `fontsLoaded` when fonts are available.

### Routing & i18n

Routes are locale-prefixed (`strategy: 'prefix'`). Default locale is `fr-fr`. Use `NuxtLinkLocale` for internal navigation (handled automatically by `BaseLink`). Locale files: `i18n/locales/fr-fr.json` and `i18n/locales/uk-en.json`.

### Component conventions

- `BaseLink` (`app/components/utils/BaseLink.vue`) — universal link: renders a `<button>` (no `to`), `<a target="_blank">` (external URL), or `<NuxtLinkLocale>` (internal route). Always use this instead of raw `<a>` or `<NuxtLink>`.
- Components in `app/components/texts/`, `app/components/atoms/`, `app/components/app/` are auto-imported by Nuxt with their folder as a namespace prefix (e.g. `<TextsH1>`, `<AtomsCTA>`, `<AppMenu>`).
- Debug components (`app/components/debug/`) are wrapped in `<DevOnly>` in `app.vue`.

### SCSS system

Four SCSS partials are auto-injected into every component via Vite's `additionalData`: `_variables`, `_mixins`, `_functions`, `_layout`. You can use their helpers without explicit imports.

Key helpers:
- `desktop-vw(Npx)` / `mobile-vw(Npx)` — convert px to viewport-relative units (design base: 1920px desktop, 414px mobile)
- `@include mobile` / `@include desktop` — breakpoint at 800px
- `columns(N)` — CSS grid column span helper

Colors are CSS custom properties (e.g. `var(--c-light-1)`, `var(--c-red-1)`), defined in `_colors.scss`.

### Debug tooling (Tweakpane)

Use `usePaneFolder(pane, options)` composable to add a folder to the debug pane. It auto-disposes on component unmount. Access the root pane via `nuxtApp.$pane` (or `useNuxtApp().$pane`).

### Config files

`app/config/SCENE_CONFIG.ts` and `app/config/CAMERA_CONFIG.ts` hold scene/camera presets for TresJS pages.
