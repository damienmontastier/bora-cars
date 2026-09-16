# CLAUDE.md — `shared/`

Code TypeScript partagé entre `web/` (Nuxt) et `studio/` (Sanity). Vue d'ensemble : `../CLAUDE.md`.

## Contenu

`languages.ts` — **source unique des langues du site et du contenu** :

```ts
LANGUAGES         // [{ id: 'fr', title: 'Français', flag }, { id: 'en', title: 'English', flag }] as const
DEFAULT_LANGUAGE  // 'fr'
LanguageId        // 'fr' | 'en', dérivé de LANGUAGES
```

Consommateurs :
- `web/nuxt.config.ts` — `i18n.locales` (+ `isCatchallLocale` sur la langue par défaut), `i18n.defaultLocale`, `site.defaultLocale`
- `studio/schemaTypes/constants.ts` — `SUPPORTED_LANGUAGES` (langues du plugin `internationalizedArray`) et ré-export de `DEFAULT_LANGUAGE`
- `studio/lib/i18nValidation.ts` — langues exigées par `requireAllLanguages` (validation des schémas) et vérifiées par `missingLanguages` (Dashboard)

## Règles

- **Pas un package** : ni workspace npm, ni alias, ni `package.json`. Import en chemin relatif (`../shared/languages` depuis `web/nuxt.config.ts`, `../../shared/languages` depuis `studio/schemaTypes/` ou `studio/lib/`).
- **Zéro dépendance** : le fichier est compilé par deux toolchains distinctes (Nuxt/Nitro et le Vite du Studio), chacune avec son propre `node_modules`. N'importer ni `nuxt`, ni `vue`, ni `sanity`, ni `react`, ni aucun paquet npm — seulement du TS pur (constantes, types, fonctions pures).
- Ne pas y mettre de code qui ne sert qu'à une seule app.
- Le Studio est déployé depuis le poste (`sanity deploy`) et Netlify clone tout le repo (base directory `web/`) : `../shared` est donc bien disponible aux deux builds.

## Ajouter une langue

`LANGUAGES` ne suffit pas : plusieurs endroits codent encore `fr`/`en` en dur. À traiter en même temps :
- web : `LOCALE_IETF` (`nuxt.config.ts`), type `LocaleCode` + chemins de `I18N_PAGES` (`app/config/I18N_CONFIG.ts`), boucle de locales de `app/plugins/i18n-sanity.ts`, cast de `useSanityLang.ts`, `HREFLANG` (`server/api/__sitemap__/urls.ts`), `server/plugins/sitemap-i18n-legal.ts`, formats numériques `fr-FR`/`en-GB` (`useCurrency.ts`, `page/car/RentalInfo.vue`, `page/car/Highlights.vue`), nouveau `i18n/locales/<id>.json` (`nuxtSiteConfig`)
- studio : `defaultLanguages` (`sanity.config.ts`), sélecteur de langue de `WhatsappTemplatesInput.tsx`, `NavLinkPreview.tsx`, Dashboard (type `Lang` et `ROUTES` de `components/dashboard/seoPreview.ts`, bascule FR/EN de `GoogleTab.tsx`)
- contenu : traduire tous les champs `internationalizedArray*` dans Sanity, dont le document `glossaire`
- slugs traduits : seul `legalPage` a un `slugEn` dédié

Le **fallback de contenu** reste `fr` en dur dans les projections GROQ (`web/app/queries/i18n.ts`) et dans `pickLocalized()` (`studio/lib/preview.ts`) : changer `DEFAULT_LANGUAGE` ne les modifie pas.
