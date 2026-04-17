import type { HeroData } from './home'
import { HERO_PROJECTION } from './home'
import { i18n } from './i18n'

export interface ProprietaireData {
  hero: HeroData | null
  pitch: {
    eyebrow?: string
    heading?: string
    subtext?: string
  } | null
  process: {
    steps: Array<{ _key: string, title: string, description?: string }>
  } | null
  testimonials: {
    items: Array<{
      _key: string
      authorName: string
      authorRole?: string
      car?: { marque: string, modele: string }
      quote: string
      backgroundImage?: {
        imageUrl?: string
        imageAlt?: string
        imageHotspot?: { x: number, y: number, width: number, height: number }
        imageCrop?: { top: number, bottom: number, left: number, right: number }
      }
    }>
  } | null
  cardsColumn: {
    heading?: string
    subtext?: string
    cards: Array<{ _key: string, title: string, description?: string }>
  } | null
}

export const PROPRIETAIRE_QUERY = `*[_type == "proprietaire"][0]{
  "hero": modules[_type == "hero"][0]${HERO_PROJECTION},
  "pitch": modules[_type == "pitch"][0]{
    ${i18n('eyebrow')},
    ${i18n('heading')},
    ${i18n('subtext')}
  },
  "process": modules[_type == "process"][0]{
    "steps": steps[]{ _key, ${i18n('title')}, ${i18n('description')} }
  },
  "testimonials": modules[_type == "testimonials"][0]{
    "items": items[]{
      _key,
      ${i18n('authorName')},
      ${i18n('authorRole')},
      "car": car->{ ${i18n('marque')}, ${i18n('modele')} },
      ${i18n('quote')},
      "backgroundImage": backgroundImage {
        "imageUrl": asset._ref,
        ${i18n('alt', 'imageAlt')},
        "imageHotspot": hotspot,
        "imageCrop": crop
      }
    }
  },
  "cardsColumn": modules[_type == "cardsColumn"][0]{
    ${i18n('heading')},
    ${i18n('subtext')},
    "cards": cards[]{ _key, ${i18n('title')}, ${i18n('description')} }
  }
}`
