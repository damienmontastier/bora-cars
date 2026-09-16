# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**BORA CARS** (boracars.com) — **location** de voitures de luxe (jamais de vente), site FR/EN dont tout le contenu est piloté par Sanity.

Ce fichier couvre le monorepo et ce qui traverse les apps. Chaque dossier a son propre CLAUDE.md, chargé dès qu'on travaille dedans :
- `web/CLAUDE.md` — site Nuxt 4 (architecture, animations, composants, SEO, rendu)
- `studio/CLAUDE.md` — Sanity Studio (schéma, singletons, composants custom, Dashboard, migrations)
- `shared/CLAUDE.md` — code partagé web ↔ studio (langues)

## Monorepo

| Dossier | Rôle | Stack |
|---------|------|-------|
| `web/` | Site public | Nuxt 4.5, Vue 3.5, Vite 8, GSAP + Lenis + Tempus, Pinia 4 — Netlify |
| `studio/` | CMS | Sanity Studio v6, React 19 — hébergé par Sanity |
| `shared/` | TS pur importé par les deux | `languages.ts` |
| `docs/` | Docs métier / stratégie, pas du code | `SEO.md`, `GBP-GSC.md`, `WHATSAPP.md`, `UTM.md`, `ANALYTICS.md`, `AIRTABLE.md`, `STRUCTURE.md` |
| `AUDIT.md` | Audit technique du site (SEO, i18n, analytics, perf, a11y) | — |

**Pas de workspaces npm** : `web/` et `studio/` ont chacun leur `node_modules` et leur `package-lock.json`. La racine ne fait qu'orchestrer via `npm --prefix` (+ `concurrently`, `husky`).

## Commands (depuis la racine)

```bash
npm run install:all       # npm install dans web/ puis studio/
npm run dev               # web (:3000) + studio (:3334) en parallèle
npm run dev:web           # ou dev:studio
npm run build             # build web puis studio
npm run lint              # ⚠ web uniquement (le Studio n'a pas d'ESLint) — aussi lint:fix
npm --prefix web run typecheck      # nuxt typecheck (vue-tsc)
npm --prefix studio run typecheck   # tsc --noEmit
npm run studio:deploy     # sanity deploy
```

- `generate` / `generate:prod` (`nuxt generate`) : reliquats de l'hébergement FTP, **jamais utilisés** par le déploiement (cf. `web/CLAUDE.md`).
- `studio:deploy-graphql` appelle un script `deploy-graphql` qui n'existe pas dans `studio/package.json`.
- Aucun hook husky actif, aucune CI : lint et typecheck se lancent à la main.

## Environnement

- **`web/.env`** — aucun template versionné (`web/.blank.env.ftp` est vide). Variables lues : `NUXT_PUBLIC_IS_PROD`, `NUXT_PUBLIC_SANITY_PROJECT_ID`, `NUXT_PUBLIC_SANITY_DATASET`, `NUXT_SITE_URL`, `NUXT_PUBLIC_SCRIPTS_GOOGLE_TAG_MANAGER_ID`, `NUXT_AIRTABLE_TOKEN`, `NUXT_AIRTABLE_BASE_ID`, `NUXT_AIRTABLE_TABLE_ID`. `NUXT_PUBLIC_IS_FTP` est mort (remplacé par `NUXT_PUBLIC_IS_PROD`) : ne pas le réintroduire.
- **`studio/.env`** — copier `studio/.env.example` : `SANITY_STUDIO_NETLIFY_BUILD_HOOK`, `SANITY_STUDIO_SITE_URL` et `SANITY_STUDIO_PREVIEW_SITE_URL` (optionnelles, défauts prod / develop), `SANITY_STUDIO_PORT`. Détail dans `studio/CLAUDE.md`.
- Node ≥ 22.12 (imposé par Studio v6 ; Netlify tourne en Node 22).

## Déploiement

| Branche | Web (Netlify, base directory `web/`, `web/netlify.toml`) |
|---------|------------------------------------------------------------|
| `main` | Production — `NUXT_PUBLIC_IS_PROD=true` : pages localisées **prérendues** + Netlify Functions, indexable |
| `develop` | `NUXT_PUBLIC_IS_PROD=false` : SSR pur, contenu toujours frais, non indexable |

Même build (`nuxt build`, preset Nitro `netlify`) dans les deux cas. Le Studio se déploie à part (`npm run studio:deploy`).

**Le contenu publié dans Sanity n'apparaît en prod qu'après un rebuild**, car les pages sont prérendues. C'est le rôle de l'outil « Mise en ligne » du Studio (ou du bouton équivalent du Dashboard), qui appelle le build hook Netlify. Vocabulaire côté client : *brouillon → publié → en ligne*. `develop.boracars.com` (SSR) sert de site de test : le contenu publié y apparaît sans rebuild.

## Contrats web ↔ studio

- **Sanity** : project `xyw8hnp3`, dataset `production`, apiVersion `2026-04-06`, côté Studio comme côté web (où projectId/dataset viennent de l'env).
- **Schéma ↔ requêtes** : le Studio définit les types (`studio/schemaTypes/`), le web les lit avec des GROQ **écrits à la main** et des interfaces `*Data` écrites à la main (`web/app/queries/`), sans typegen. Ajouter ou renommer un champ ⇒ mettre à jour la projection et l'interface côté web. Renommer un champ qui a déjà des données ⇒ migration (`studio/migrations/`).
- **Langues** : `shared/languages.ts` alimente les locales Nuxt et les langues du plugin `internationalizedArray`. Les champs localisés sont des tableaux `{ language, value }` ; le web les projette avec `i18n()` / `i18nBlock()` (`web/app/queries/i18n.ts`, repli sur FR).
- **Micro-copy UI** : aucun texte d'interface dans des JSON. Tout vit dans le singleton Sanity `glossaire` et est injecté dans vue-i18n au runtime. Nouvelle clé `$t()` = nouvelle entrée dans `glossaire` + publication. Exception : `nuxtSiteConfig`, lu au build, qui reste dans `web/i18n/locales/*.json`.
- **Routes** : un type Sanity liable doit exister dans `linkableSchemaTypes` (`studio/sanity.config.ts`) **et** dans `SANITY_ROUTES` / `I18N_PAGES` (`web/app/config/I18N_CONFIG.ts`). Aucun chemin d'URL en dur côté web.
- **WhatsApp** : les templates sont des chaînes contenant des jetons `{token}`, saisies dans le Studio avec un éditeur à tags et remplies côté web par `fillWhatsappTemplate`. Les jetons proposés par le Studio (`CAR_VARIABLES` / `BIO_VARIABLES` / `PAGE_VARIABLES`) doivent correspondre à ceux que le web remplit réellement.
- **Build en ligne** : le Dashboard du Studio lit `/_nuxt/builds/latest.json` sur le site de prod (date du dernier build, fin d'une mise en ligne). Cette lecture cross-origin repose sur l'en-tête `Access-Control-Allow-Origin` posé dans `web/netlify.toml` : ne pas le retirer.
- **Logique du site recopiée dans le Studio** : à mettre à jour côté Studio dès qu'on la change côté web.

  | Côté web | Copie dans `studio/` |
  |----------|-------------------|
  | Filtre `clientType` de `web/app/queries/catalogue.ts` | `components/CatalogueCarsPreview.tsx`, `components/dashboard/Overview.tsx` |
  | URLs traduites de `web/app/config/I18N_CONFIG.ts` | `ROUTES` de `components/dashboard/seoPreview.ts` |
  | Calcul du `<title>` et de la meta description (`app.vue`, `pages/index.vue`, `pages/car/[uid].vue`, `usePageSeo.ts`) | `components/dashboard/seoPreview.ts` |
  | Blocs affichés par `web/app/components/page/car/*` | Critères de `components/dashboard/completeness.ts` |
- **Agences** : les documents `location` servent à la fois à l'affichage (menu, footer, voitures) et au JSON-LD `AutoRental` (un nœud par agence). Les champs de marque sont dans `settings`.
