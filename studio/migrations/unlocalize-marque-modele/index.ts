import { at, defineMigration, set } from 'sanity/migrate'

const DEFAULT_LANGUAGE = 'fr'

type LocalizedItem = { _key: string, _type?: string, language: string, value: unknown }

const isLocalizedArray = (v: unknown): v is LocalizedItem[] =>
  Array.isArray(v) && v.length > 0
  && typeof v[0] === 'object' && v[0] !== null
  && 'language' in (v[0] as Record<string, unknown>)

const pickValue = (v: unknown): string | undefined => {
  if (typeof v === 'string') return v
  if (!isLocalizedArray(v)) return undefined
  const fr = v.find((item) => item.language === DEFAULT_LANGUAGE)?.value
  if (typeof fr === 'string' && fr.length > 0) return fr
  const fallback = v.find((item) => typeof item.value === 'string' && (item.value as string).length > 0)?.value
  return typeof fallback === 'string' ? fallback : undefined
}

export default defineMigration({
  title: 'Unlocalize car.marque + car.modele (pick FR value as canonical string)',
  documentTypes: ['car'],

  migrate: {
    document(doc) {
      const raw = doc as Record<string, unknown>
      const patches = []

      for (const field of ['marque', 'modele'] as const) {
        const current = raw[field]
        if (typeof current === 'string') continue
        const next = pickValue(current)
        if (typeof next === 'string') {
          patches.push(at(field, set(next)))
        }
      }

      return patches
    },
  },
})
