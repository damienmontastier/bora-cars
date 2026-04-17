import { at, defineMigration, set } from 'sanity/migrate'

const DEFAULT_LANGUAGE = 'fr'

const LOCALIZED_DOCUMENT_TYPES = [
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

const LOCALIZED_FIELD_NAMES = new Set([
  'heading', 'tagline', 'subtext', 'eyebrow', 'subtitle', 'description',
  'surtitle', 'ctaLabel', 'authorName', 'authorRole', 'quote',
  'menuLabel', 'closeLabel', 'contactTitle', 'sitemapTitle', 'socialsTitle',
  'categoryLabel', 'question', 'answer', 'title', 'alt',
  'marque', 'modele', 'city', 'address',
  'body',
])

const randomKey = (length = 12): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < length; i += 1) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

type Block = { _type: 'block', children?: unknown[] }
type LocalizedItem = { _key: string, _type?: string, language: string, value: unknown }

const isLegacyString = (val: unknown): val is string =>
  typeof val === 'string' && val.length > 0

const isLegacyPortableText = (val: unknown): val is Block[] =>
  Array.isArray(val) && val.length > 0
  && typeof val[0] === 'object' && val[0] !== null
  && '_type' in val[0] && (val[0] as { _type?: string })._type === 'block'

const isAlreadyLocalized = (val: unknown): val is LocalizedItem[] =>
  Array.isArray(val) && val.length > 0
  && typeof val[0] === 'object' && val[0] !== null
  && 'language' in val[0]

const wrap = (value: unknown, type: 'string' | 'text' | 'block'): LocalizedItem[] => {
  const _type = type === 'block' ? 'internationalizedArrayBlockValue'
    : type === 'text' ? 'internationalizedArrayTextValue'
      : 'internationalizedArrayStringValue'
  return [{ _key: randomKey(), _type, language: DEFAULT_LANGUAGE, value }]
}

function transform(node: unknown, parentKey?: string): unknown {
  if (Array.isArray(node)) return node.map((item) => transform(item, parentKey))
  if (node && typeof node === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      if (LOCALIZED_FIELD_NAMES.has(k)) {
        if (isAlreadyLocalized(v)) {
          out[k] = v
        }
        else if (isLegacyPortableText(v)) {
          out[k] = wrap(v, 'block')
        }
        else if (isLegacyString(v)) {
          // Heuristic : multi-line ou champs nommés "tagline/body/answer/quote/address/description/subtext" → text
          const isText = /\n/.test(v)
            || ['tagline', 'body', 'answer', 'quote', 'address', 'description', 'subtext'].includes(k)
          out[k] = wrap(v, isText ? 'text' : 'string')
        }
        else {
          out[k] = v
        }
      }
      else {
        out[k] = transform(v, k)
      }
    }
    return out
  }
  return node
}

function transformTopLevel(field: string, value: unknown): unknown {
  if (LOCALIZED_FIELD_NAMES.has(field)) {
    if (isAlreadyLocalized(value)) return value
    if (isLegacyPortableText(value)) return wrap(value, 'block')
    if (isLegacyString(value)) {
      const isText = /\n/.test(value)
        || ['tagline', 'body', 'answer', 'quote', 'address', 'description', 'subtext'].includes(field)
      return wrap(value, isText ? 'text' : 'string')
    }
  }
  return transform(value, field)
}

export default defineMigration({
  title: 'Localize string/text fields to internationalizedArray (seed FR)',
  documentTypes: LOCALIZED_DOCUMENT_TYPES,

  migrate: {
    document(doc) {
      const patches = []
      for (const [field, value] of Object.entries(doc)) {
        if (field.startsWith('_')) continue
        const transformed = transformTopLevel(field, value)
        if (JSON.stringify(transformed) !== JSON.stringify(value)) {
          patches.push(at(field, set(transformed)))
        }
      }
      return patches
    },
  },
})
