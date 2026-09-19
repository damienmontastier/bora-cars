const SECTIONS = [
  'seo',
  'breadcrumb',
  'error',
  'underConstruction',
  'footer',
  'menu',
  'catalogue',
  'car',
  'bio',
  'testimonials',
  'contact',
  'media',
  'legal',
  'cookies',
] as const

interface LocalizedValue { language: string, value: string }
interface GlossaryEntry { key: string, value: LocalizedValue[] }
export type GlossaireI18nData = Partial<Record<typeof SECTIONS[number], GlossaryEntry[]>>

export const GLOSSAIRE_I18N_QUERY = `*[_id == "glossaire"][0]{
  ${SECTIONS.map(s => `"${s}": ${s}[]{ key, "value": value[]{ language, value } }`).join(',\n  ')}
}`

function pickLocale(value: LocalizedValue[] | undefined, locale: string): string | undefined {
  if (!Array.isArray(value))
    return undefined
  const hit = value.find(v => v?.language === locale)?.value
  if (hit != null && hit !== '')
    return hit
  return value.find(v => v?.language === 'fr')?.value
}

function setPath(obj: Record<string, any>, segments: string[], value: string) {
  let cur = obj
  for (let i = 0; i < segments.length - 1; i += 1) {
    const s = segments[i]!
    if (typeof cur[s] !== 'object' || cur[s] === null)
      cur[s] = {}
    cur = cur[s]
  }
  cur[segments[segments.length - 1]!] = value
}

export function buildLocaleMessages(doc: GlossaireI18nData | null, locale: string): Record<string, any> {
  const root: Record<string, any> = {}
  if (!doc)
    return root
  for (const section of SECTIONS) {
    const entries = doc[section]
    if (!Array.isArray(entries))
      continue
    for (const entry of entries) {
      if (!entry?.key)
        continue
      const val = pickLocale(entry.value, locale)
      if (val == null)
        continue
      setPath(root, [section, ...entry.key.split('.')], val)
    }
  }
  return root
}
