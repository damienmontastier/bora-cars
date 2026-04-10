import type { HeroData } from './home'

export interface ProfessionnelData {
  hero: HeroData | null
  title: {
    eyebrow?: string
    heading?: string
  } | null
  textBlock: {
    eyebrow?: string
    body?: any[]
  } | null
  faq: {
    items: Array<{ _key: string, question: string, answer?: string }>
  } | null
  cardsColumn: {
    heading?: string
    subtext?: string
    cards: Array<{ _key: string, title: string, description?: string }>
  } | null
}

export const PROFESSIONNEL_QUERY = `*[_type == "professionnel"][0]{
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
  "title": modules[_type == "title"][0]{
    eyebrow,
    heading
  },
  "textBlock": modules[_type == "textBlock"][0]{
    eyebrow,
    body
  },
  "faq": modules[_type == "faq"][0]{
    "items": items[]{_key, question, answer}
  },
  "cardsColumn": modules[_type == "cardsColumn"][0]{
    heading,
    subtext,
    cards[]{_key, title, description}
  }
}`
