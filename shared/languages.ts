export const LANGUAGES = [
  { id: 'fr', title: 'Français', flag: '🇫🇷' },
  { id: 'en', title: 'English', flag: '🇬🇧' },
] as const

export const DEFAULT_LANGUAGE = 'fr'

export type LanguageId = (typeof LANGUAGES)[number]['id']
