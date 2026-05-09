import { at, defineMigration, set, unset } from 'sanity/migrate'

const DEFAULT_LANGUAGE = 'fr'

const randomKey = (length = 12): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < length; i += 1) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

type LocalizedListItem = {
  _key: string
  _type: 'internationalizedArrayStringListValue'
  language: string
  value: string[]
}

const isLegacyStringArray = (val: unknown): val is string[] =>
  Array.isArray(val)
  && val.every((v) => typeof v === 'string')

const isAlreadyLocalized = (val: unknown): val is LocalizedListItem[] =>
  Array.isArray(val) && val.length > 0
  && typeof val[0] === 'object' && val[0] !== null
  && 'language' in val[0]

export default defineMigration({
  title: 'Migrate car.equipements from string[] to internationalizedArrayStringList (seed FR)',
  documentTypes: ['car'],

  migrate: {
    document(doc) {
      const raw = doc as Record<string, unknown>
      if (!('equipements' in raw)) return []
      const value = raw.equipements

      if (value === null) return [at('equipements', unset())]
      if (isAlreadyLocalized(value)) return []
      if (!isLegacyStringArray(value)) return []
      if (value.length === 0) return [at('equipements', unset())]

      const next: LocalizedListItem[] = [
        {
          _key: randomKey(),
          _type: 'internationalizedArrayStringListValue',
          language: DEFAULT_LANGUAGE,
          value,
        },
      ]

      return [at('equipements', set(next))]
    },
  },
})
