import { SITE_URL } from '../../lib/netlifyDeploy'
import { SEO_PAGE_TYPES, TYPE_LABELS, clean, docLabel } from './checks'
import type { Snapshot } from './checks'
import type { CarDoc, GlossaryEntry, LegalDoc, Localized, SingletonDoc } from './data'

export type Lang = 'fr' | 'en'

export type Section = 'pages' | 'cars' | 'legal'

export interface SerpFlag {
  text: string
  tone: 'caution' | 'critical' | 'primary'
}

export interface SerpEntry {
  key: string
  section: Section
  docId: string
  docType: string
  label: string
  url: string
  title: string
  description: string
  shownTitle: string
  shownDescription: string
  flags: SerpFlag[]
  editPath: string
}

const BRAND = 'BORA CARS'
const SEPARATOR = '—'

const ROUTES: Record<string, Record<Lang, string>> = {
  homepage: { fr: '', en: '' },
  proprietaire: { fr: '/proprietaire', en: '/owner' },
  professionnel: { fr: '/professionnel', en: '/business' },
  catalogue: { fr: '/catalogue', en: '/catalog' },
  catalogueProfessionnel: { fr: '/catalogue-professionnel', en: '/business-catalog' },
  contact: { fr: '/contact', en: '/contact' },
}

const TITLE_FONT = '20px Arial, sans-serif'
const TITLE_MAX_WIDTH = 600
const DESCRIPTION_FONT = '14px Arial, sans-serif'
const DESCRIPTION_MAX_WIDTH = 990
const META_DESCRIPTION_CHARS = 160

let canvas: CanvasRenderingContext2D | null = null

function textWidth(text: string, font: string): number {
  canvas ??= document.createElement('canvas').getContext('2d')
  if (!canvas) return text.length * 8
  canvas.font = font
  return canvas.measureText(text).width
}

export function fitText(text: string, font: string, maxWidth: number): { text: string, truncated: boolean } {
  if (textWidth(text, font) <= maxWidth) return { text, truncated: false }
  let fitted = ''
  for (const word of text.split(' ')) {
    const next = fitted ? `${fitted} ${word}` : word
    if (textWidth(`${next} …`, font) > maxWidth) break
    fitted = next
  }
  return { text: `${fitted} …`, truncated: true }
}

function pick(value: Localized<unknown>, lang: Lang): { text: string, fallback: boolean } {
  const read = (l: string) => {
    const v = (value ?? []).find(item => item.language === l)?.value
    return typeof v === 'string' ? clean(v) : ''
  }
  const own = read(lang)
  if (own || lang === 'fr') return { text: own, fallback: false }
  const fr = read('fr')
  return { text: fr, fallback: Boolean(fr) }
}

function glossary(snapshot: Snapshot, section: string, key: string): Localized<string> {
  const doc = snapshot.context.singletons.get('glossaire')
  const entries = Array.isArray(doc?.[section]) ? (doc![section] as GlossaryEntry[]) : []
  return entries.find(entry => entry.key === key)?.value ?? null
}

export function glossaryEntryPath(snapshot: Snapshot, section: string, key: string): string | undefined {
  const doc = snapshot.context.singletons.get('glossaire')
  const entries = Array.isArray(doc?.[section]) ? (doc![section] as GlossaryEntry[]) : []
  const entry = entries.find(e => e.key === key)
  return entry ? `${section}[_key=="${entry._key}"]` : undefined
}

function plainText(value: Localized<unknown>, lang: Lang): { text: string, fallback: boolean } {
  const read = (l: string) => {
    const blocks = (value ?? []).find(item => item.language === l)?.value
    if (!Array.isArray(blocks)) return ''
    return clean(blocks
      .map((block: { children?: { text?: string }[] }) => (block?.children ?? []).map(child => child.text ?? '').join(''))
      .join(' '))
  }
  const own = read(lang)
  if (own || lang === 'fr') return { text: own, fallback: false }
  const fr = read('fr')
  return { text: fr, fallback: Boolean(fr) }
}

function breadcrumb(path: string): string {
  const host = SITE_URL.replace(/^https?:\/\//, '')
  return [`https://${host}`, ...path.split('/').filter(Boolean)].join(' › ')
}

function finalize(
  base: Omit<SerpEntry, 'shownTitle' | 'shownDescription' | 'flags'>,
  flags: SerpFlag[],
): SerpEntry {
  const flagCutDescription = base.section !== 'cars'
  const title = fitText(base.title, TITLE_FONT, TITLE_MAX_WIDTH)
  const description = fitText(base.description, DESCRIPTION_FONT, DESCRIPTION_MAX_WIDTH)
  const allFlags = [...flags]
  if (title.truncated) allFlags.push({ text: 'Titre coupé par Google', tone: 'caution' })
  if (description.truncated && flagCutDescription) allFlags.push({ text: 'Description coupée par Google', tone: 'caution' })
  if (base.description && base.description.length < 70) allFlags.push({ text: 'Description très courte', tone: 'primary' })
  if ((base.title.match(/bora\s*cars/gi) ?? []).length > 1) allFlags.push({ text: 'Marque en double dans le titre', tone: 'caution' })
  return { ...base, shownTitle: title.text, shownDescription: description.text, flags: allFlags }
}

export function buildSerpEntries(snapshot: Snapshot, lang: Lang): SerpEntry[] {
  const { singletons, cars, legalPages } = snapshot.context
  const settings = singletons.get('settings')
  const fallbackTitle = pick(settings?.fallbackTitle ?? null, lang).text || BRAND
  const defaultDescription = pick(glossary(snapshot, 'seo', 'description'), lang).text
  const entries: SerpEntry[] = []

  const pageEntry = (doc: SingletonDoc | LegalDoc, section: Section, path: string, label: string) => {
    const ownTitle = pick(doc.seo?.title ?? null, lang)
    const ownDescription = pick(doc.seo?.description ?? null, lang)
    const chunk = ownTitle.text || fallbackTitle
    const flags: SerpFlag[] = []
    if (!ownTitle.text) flags.push({ text: 'Titre par défaut (meta title vide)', tone: 'critical' })
    else if (ownTitle.fallback) flags.push({ text: 'Titre en français (traduction manquante)', tone: 'caution' })
    if (!ownDescription.text) flags.push({ text: 'Description générique du site', tone: 'caution' })
    else if (ownDescription.fallback) flags.push({ text: 'Description en français (traduction manquante)', tone: 'caution' })
    entries.push(finalize({
      key: `${doc._id}:${lang}`,
      section,
      docId: doc._id,
      docType: doc._type,
      label,
      url: breadcrumb(`/${lang}${path}`),
      title: doc._type === 'homepage' ? `${BRAND} ${SEPARATOR} ${chunk}` : `${chunk} ${SEPARATOR} ${BRAND}`,
      description: ownDescription.text || defaultDescription,
      editPath: 'seo',
    }, flags))
  }

  for (const type of SEO_PAGE_TYPES.filter(t => ROUTES[t])) {
    const doc = singletons.get(type)
    if (doc) pageEntry(doc, 'pages', ROUTES[type][lang], TYPE_LABELS[type])
  }

  const carTitle = pick(glossary(snapshot, 'car', 'seo.title'), lang).text
  const carTitleNoCity = pick(glossary(snapshot, 'car', 'seo.titleNoCity'), lang).text
  for (const car of [...cars].sort((a: CarDoc, b: CarDoc) => docLabel(a).localeCompare(docLabel(b), 'fr'))) {
    if (!car.slug) continue
    const name = clean(`${car.marque ?? ''} ${car.modele ?? ''}`)
    const city = pick(car.city ?? null, lang).text
    const template = city ? carTitle : carTitleNoCity
    const chunk = template ? template.replace(/\{car\}/g, name).replace(/\{city\}/g, city) : name
    const text = plainText(car.description ?? null, lang)
    const meta = text.text.length <= META_DESCRIPTION_CHARS
      ? text.text
      : `${text.text.slice(0, META_DESCRIPTION_CHARS).replace(/\s+\S*$/, '')}…`
    const flags: SerpFlag[] = []
    if (!text.text) flags.push({ text: 'Description générique (voiture sans description)', tone: 'caution' })
    else if (text.fallback) flags.push({ text: 'Description en français (traduction manquante)', tone: 'caution' })
    entries.push(finalize({
      key: `${car._id}:${lang}`,
      section: 'cars',
      docId: car._id,
      docType: 'car',
      label: docLabel(car),
      url: breadcrumb(`/${lang}/${lang === 'fr' ? 'voiture' : 'car'}/${car.slug}`),
      title: `${chunk} ${SEPARATOR} ${BRAND}`,
      description: meta || defaultDescription,
      editPath: 'description',
    }, flags))
  }

  for (const doc of [...legalPages].sort((a, b) => docLabel(a).localeCompare(docLabel(b), 'fr'))) {
    if (!doc.slug) continue
    pageEntry(doc, 'legal', `/legal/${lang === 'en' ? (doc.slugEn ?? doc.slug) : doc.slug}`, docLabel(doc))
  }

  const byDescription = new Map<string, SerpEntry[]>()
  for (const entry of entries) {
    if (entry.description) byDescription.set(entry.description, [...(byDescription.get(entry.description) ?? []), entry])
  }
  for (const group of byDescription.values()) {
    if (group.length < 2) continue
    for (const entry of group) {
      entry.flags.push({ text: `Même description que ${group.length - 1} autre${group.length > 2 ? 's' : ''} page${group.length > 2 ? 's' : ''}`, tone: 'caution' })
    }
  }

  return entries
}
