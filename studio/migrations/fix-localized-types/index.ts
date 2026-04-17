import { at, defineMigration, set } from 'sanity/migrate'

// Pour chaque parentType (= _type de l'objet contenant), mappe field → type attendu
const FIELDS: Record<string, Record<string, 'string' | 'text' | 'block'>> = {
  // modules
  hero: { heading: 'string', tagline: 'text', subtext: 'string' },
  pitch: { eyebrow: 'string', heading: 'text', subtext: 'text' },
  brandsSection: { description: 'string', surtitle: 'string', heading: 'text' },
  servicePitch: { eyebrow: 'string', heading: 'string', body: 'text', ctaLabel: 'string' },
  cardsColumn: { heading: 'text', subtext: 'text' },
  title: { eyebrow: 'string', heading: 'text' },
  textBlock: { eyebrow: 'string', body: 'block' },
  processStep: { title: 'string', description: 'text' },
  // objects
  customImage: { alt: 'string' },
  customVideo: { alt: 'string' },
  // synthetic types pour les inline objects (sans _type)
  testimonialItem: { authorName: 'string', authorRole: 'string', quote: 'text' },
  faqItem: { question: 'string', answer: 'text' },
  serviceCard: { categoryLabel: 'string', subtitle: 'string' },
  // singletons / documents
  contact: { heading: 'string' },
  menu: { menuLabel: 'string', closeLabel: 'string' },
  footer: { contactTitle: 'string', sitemapTitle: 'string', socialsTitle: 'string' },
  car: { marque: 'string', modele: 'string' },
  location: { city: 'string', address: 'text' },
}

// Quand on rentre dans `<parent>.<arrayField>`, les items inline prennent ce type synthétique
const INLINE_ITEMS: Record<string, Record<string, string>> = {
  testimonials: { items: 'testimonialItem' },
  faq: { items: 'faqItem' },
  serviceCards: { cards: 'serviceCard' },
}

const VALUE_TYPE: Record<string, string> = {
  string: 'internationalizedArrayStringValue',
  text: 'internationalizedArrayTextValue',
  block: 'internationalizedArrayBlockValue',
}

const LOCALIZED_DOCUMENT_TYPES = [
  'homepage', 'proprietaire', 'professionnel', 'contact',
  'menu', 'footer', 'settings', 'car', 'location',
]

function fixEntry(entry: any, expectedValueType: string) {
  if (!entry || typeof entry !== 'object') return entry
  if (typeof entry._type !== 'string') return entry
  if (!entry._type.startsWith('internationalizedArray')) return entry
  if (entry._type === expectedValueType) return entry
  return { ...entry, _type: expectedValueType }
}

function walk(node: unknown, currentType: string | undefined): unknown {
  if (Array.isArray(node)) return node.map((item) => walk(item, currentType))
  if (!node || typeof node !== 'object') return node

  const obj = node as Record<string, unknown>
  const myType = (typeof obj._type === 'string' ? obj._type : currentType) ?? ''
  const fieldMap = FIELDS[myType]
  const inlineMap = INLINE_ITEMS[myType]
  const out: Record<string, unknown> = {}

  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('_')) {
      out[k] = v
      continue
    }
    const expectedKind = fieldMap?.[k]
    if (expectedKind && Array.isArray(v)) {
      const expected = VALUE_TYPE[expectedKind]
      out[k] = v.map((entry) => fixEntry(entry, expected))
      continue
    }
    const inlineType = inlineMap?.[k]
    if (inlineType && Array.isArray(v)) {
      out[k] = v.map((item) => walk(item, inlineType))
      continue
    }
    out[k] = walk(v, myType)
  }

  return out
}

export default defineMigration({
  title: 'Fix internationalizedArray value _types based on schema',
  documentTypes: LOCALIZED_DOCUMENT_TYPES,
  migrate: {
    document(doc) {
      const patches = []
      for (const [field, value] of Object.entries(doc)) {
        if (field.startsWith('_')) continue
        const fixed = walk(value, doc._type)
        if (JSON.stringify(fixed) !== JSON.stringify(value)) {
          patches.push(at(field, set(fixed)))
        }
      }
      return patches
    },
  },
})
