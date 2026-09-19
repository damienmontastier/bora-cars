import type { FieldGroupDefinition } from 'sanity'
import { LANGUAGES, DEFAULT_LANGUAGE } from '../../shared/languages'

export const GROUPS: FieldGroupDefinition[] = [
  { name: 'editorial', title: 'Editorial', default: true },
  { name: 'seo', title: 'SEO' },
]

export const SUPPORTED_LANGUAGES = LANGUAGES.map(({ id, title }) => ({ id, title }))

export { DEFAULT_LANGUAGE }

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
