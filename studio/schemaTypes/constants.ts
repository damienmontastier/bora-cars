import type { FieldGroupDefinition } from 'sanity'
import { LANGUAGES, DEFAULT_LANGUAGE } from '../../shared/languages'

export const GROUPS: FieldGroupDefinition[] = [
  { name: 'editorial', title: 'Editorial', default: true },
  { name: 'seo', title: 'SEO' },
]

export const SUPPORTED_LANGUAGES = LANGUAGES.map(({ id, title }) => ({ id, title }))

export { DEFAULT_LANGUAGE }

// Documents uniques (id = nom du type) : pas de création/suppression/duplication
// dans le Studio (cf. `document.actions` dans sanity.config.ts).
export const SINGLETON_TYPES = [
  'homepage',
  'footer',
  'menu',
  'proprietaire',
  'professionnel',
  'contact',
  'settings',
  'catalogue',
  'catalogueProfessionnel',
  'carPage',
  'glossaire',
  'bio',
]

export const LOCALIZED_DOCUMENT_TYPES = [
  'homepage',
  'proprietaire',
  'professionnel',
  'contact',
  'catalogue',
  'catalogueProfessionnel',
  'menu',
  'footer',
  'settings',
  'car',
  'location',
  'legalPage',
  'glossaire',
  'bio',
]
