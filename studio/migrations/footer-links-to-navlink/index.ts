import { at, defineMigration, set, unset } from 'sanity/migrate'

const DEFAULT_LANGUAGE = 'fr'

const ARRAY_FIELDS = ['contactLinks', 'sitemap', 'socials'] as const
const SINGLE_FIELDS = ['legalLink'] as const

function randomKey(length = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < length; i += 1) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

function toNavLink(item: any, keepKey = true) {
  const { text, _key, _type: _, ...linkFields } = item
  return {
    ...(keepKey && { _key: _key ?? randomKey() }),
    _type: 'navLink',
    label: [
      {
        _key: DEFAULT_LANGUAGE,
        _type: 'internationalizedArrayStringValue',
        language: DEFAULT_LANGUAGE,
        value: text ?? '',
      },
    ],
    link: {
      _type: 'customLink',
      ...linkFields,
    },
  }
}

export default defineMigration({
  title: 'Convert footer links from customLink to navLink with i18n label',
  documentTypes: ['footer'],
  migrate: {
    document(doc) {
      const patches = []

      for (const field of ARRAY_FIELDS) {
        const items = doc[field] as any[]
        if (!Array.isArray(items) || items.length === 0) continue
        if (!items.some((item) => item._type === 'customLink')) continue

        patches.push(
          at(field, set(items.map((item) => (item._type === 'customLink' ? toNavLink(item) : item))))
        )
      }

      for (const field of SINGLE_FIELDS) {
        const item = doc[field] as any
        if (!item || item._type !== 'customLink') continue
        patches.push(at(field, set(toNavLink(item, false))))
      }

      return patches
    },
  },
})
