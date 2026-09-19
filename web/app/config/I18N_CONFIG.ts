export type LocaleCode = 'fr' | 'en'

export const I18N_PAGES: Record<string, Partial<Record<LocaleCode, `/${string}` | false>>> = {
  'proprietaire': { fr: '/proprietaire', en: '/owner' },
  'professionnel': { fr: '/professionnel', en: '/business' },
  'contact': { fr: '/contact', en: '/contact' },
  'catalogue': { fr: '/catalogue', en: '/catalog' },
  'catalogue-professionnel': { fr: '/catalogue-professionnel', en: '/business-catalog' },
  'car-uid': { fr: '/voiture/[uid]', en: '/car/[uid]' },
  'legal-slug': { fr: '/legal/[slug]', en: '/legal/[slug]' },
  'bio': { fr: '/bio', en: '/bio' },
}

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
