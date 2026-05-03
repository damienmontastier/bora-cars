import type { GroupDefinition } from 'sanity'
import { LANGUAGES, DEFAULT_LANGUAGE } from '../../shared/languages'

export const GROUPS: GroupDefinition[] = [
  { name: 'editorial', title: 'Editorial', default: true },
  { name: 'seo', title: 'SEO' },
]

export const SUPPORTED_LANGUAGES = LANGUAGES.map(({ id, title }) => ({ id, title }))

export { DEFAULT_LANGUAGE }

export const LOCALIZED_DOCUMENT_TYPES = [
  'homepage',
  'proprietaire',
  'professionnel',
  'contact',
  'catalogue',
  'menu',
  'footer',
  'settings',
  'car',
  'location',
]
