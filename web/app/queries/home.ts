export interface SanityLink {
  _key?: string
  type: 'external' | 'email' | 'phone' | 'internal'
  text?: string
  url?: string
  email?: string
  phone?: string
}

export interface CardGrid {
  x: number
  y: number
  w: number
  h: number
}

export interface ServiceCard {
  _key: string
  categoryLabel: string
  subtitle?: string
  url: string
  media: unknown
  grid?: CardGrid
}

export interface HomepageData {
  hero: {
    heading?: string
    tagline?: string
    subtext?: string
    cta?: SanityLink
  } | null
  serviceCards: {
    cards: ServiceCard[]
  } | null
  pitch: {
    eyebrow?: string
    heading?: string
    subtext?: string
    cta?: SanityLink
  } | null
  process: {
    steps: Array<{ _key: string, title: string, description?: string }>
  } | null
}

export const HOMEPAGE_QUERY = `*[_type == "homepage"][0]{
  "hero": modules[_type == "hero"][0]{
    heading,
    tagline,
    subtext,
    cta{ type, text, url, email, phone }
  },
  "serviceCards": modules[_type == "serviceCards"][0]{
    cards[]{
      _key,
      categoryLabel,
      subtitle,
      url,
      media,
      grid{ x, y, w, h }
    }
  },
  "pitch": modules[_type == "pitch"][0]{
    eyebrow,
    heading,
    subtext,
    cta{ type, text, url, email, phone }
  },
  "process": modules[_type == "process"][0]{
    steps[]{_key, title, description}
  }
}`
