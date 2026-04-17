import type { GroupDefinition } from 'sanity'

export const GROUPS: GroupDefinition[] = [
  { name: 'editorial', title: 'Editorial', default: true },
  { name: 'seo', title: 'SEO' },
]

export const SUPPORTED_LANGUAGES = [
  { id: 'fr', title: 'Français' },
  { id: 'en', title: 'English' },
] as const

export const DEFAULT_LANGUAGE = 'fr'

export const LOCALIZED_DOCUMENT_TYPES = [
  'homepage',
  'proprietaire',
  'professionnel',
  'contact',
  'menu',
  'footer',
  'settings',
  'car',
  'location',
]
