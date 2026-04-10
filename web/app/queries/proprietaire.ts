import type { HeroData } from './home'

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
  "hero": modules[_type == "hero"][0]{
    heading,
    tagline,
    subtext,
    "backgroundMedia": backgroundMedia {
      mediaType,
      "imageUrl": image.asset._ref,
      "imageAlt": image.alt,
      "imageHotspot": image.hotspot,
      "imageCrop": image.crop,
      "videoUrl": video.asset->url,
      "videoAlt": video.alt
    }
  },
  "pitch": modules[_type == "pitch"][0]{
    eyebrow,
    heading,
    subtext
  },
  "process": modules[_type == "process"][0]{
    steps[]{_key, title, description}
  },
  "testimonials": modules[_type == "testimonials"][0]{
    "items": items[]{
      _key,
      authorName,
      authorRole,
      "car": car->{ marque, modele },
      quote,
      "backgroundImage": backgroundImage {
        "imageUrl": asset._ref,
        "imageAlt": alt,
        "imageHotspot": hotspot,
        "imageCrop": crop
      }
    }
  },
  "cardsColumn": modules[_type == "cardsColumn"][0]{
    heading,
    subtext,
    cards[]{_key, title, description}
  }
}`
