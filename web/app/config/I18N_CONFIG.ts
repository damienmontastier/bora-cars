/**
 * Configuration i18n centralisée — noms de route & URLs traduites.
 *
 * Bonne pratique `@nuxtjs/i18n` : on ne hardcode JAMAIS de chemin d'URL côté
 * composants. On référence les **noms de route** Nuxt (dérivés du chemin de
 * fichier dans `app/pages/`) et `@nuxtjs/i18n` résout le chemin localisé via
 * `I18N_PAGES` ci-dessous — activé par `customRoutes: 'config'` dans
 * `nuxt.config.ts`, qui importe `I18N_PAGES`.
 *
 * Nom de route Nuxt = chemin du fichier, segments joints par `-` :
 *   pages/index.vue                   → 'index'
 *   pages/catalogue.vue               → 'catalogue'
 *   pages/catalogue-professionnel.vue → 'catalogue-professionnel'
 *   pages/proprietaire.vue            → 'proprietaire'
 *   pages/professionnel.vue           → 'professionnel'
 *   pages/contact.vue                 → 'contact'
 *   pages/car/[uid].vue               → 'car-uid'
 *   pages/legal/[slug].vue            → 'legal-slug'
 */

export type LocaleCode = 'fr' | 'en'

/**
 * URLs traduites par locale, indexées par **nom de route**.
 * - Chemins SANS préfixe de locale : `@nuxtjs/i18n` ajoute `/fr`·`/en`
 *   automatiquement (`strategy: 'prefix'`).
 * - Les segments dynamiques `[uid]` / `[slug]` DOIVENT être conservés.
 * - Pour traduire une URL : éditer une seule ligne ici.
 */
export const I18N_PAGES: Record<string, Partial<Record<LocaleCode, string | false>>> = {
  'proprietaire': { fr: '/proprietaire', en: '/owner' },
  'professionnel': { fr: '/professionnel', en: '/business' },
  'contact': { fr: '/contact', en: '/contact' },
  'catalogue': { fr: '/catalogue', en: '/catalogue' },
  'catalogue-professionnel': { fr: '/catalogue-professionnel', en: '/business-catalogue' },
  'car-uid': { fr: '/voiture/[uid]', en: '/car/[uid]' },
  'legal-slug': { fr: '/legal/[slug]', en: '/legal/[slug]' },
}

/**
 * Pont CMS → routeur : **type de document Sanity → route Nuxt**.
 *
 * `@nuxtjs/i18n` traduit un NOM de route en chemin localisé (via `I18N_PAGES`),
 * mais il ne connaît rien à Sanity : un lien interne stocké dans le CMS est une
 * **référence de document** (`_type` + éventuel `slug`), pas un nom de route.
 * Cette table fait la correspondance — c'est la seule chose qu'i18n ne peut pas
 * déduire seul (ex. `homepage` → `index`, camelCase → kebab-case).
 *
 * `BaseLink` lit cette table puis produit un objet route ; `NuxtLinkLocale`
 * applique ensuite la locale + l'URL traduite. `param` n'est présent que pour
 * les documents à slug (route dynamique) → `{ name, params: { [param]: slug } }`.
 */
export const SANITY_ROUTES: Record<string, { name: string, param?: string }> = {
  homepage: { name: 'index' },
  proprietaire: { name: 'proprietaire' },
  professionnel: { name: 'professionnel' },
  contact: { name: 'contact' },
  catalogue: { name: 'catalogue' },
  catalogueProfessionnel: { name: 'catalogue-professionnel' },
  car: { name: 'car-uid', param: 'uid' },
  legalPage: { name: 'legal-slug', param: 'slug' },
}
