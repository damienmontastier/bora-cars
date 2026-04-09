export interface SanityLink {
  _key?: string
  type: 'external' | 'email' | 'phone' | 'internal'
  text?: string
  url?: string
  email?: string
  phone?: string
}


export type CardType = 'xxl' | 'xl' | 'l' | 'm'

export interface ServiceCard {
  _key: string
  cardType: CardType
  categoryLabel: string
  subtitle?: string
  link: SanityLink
  media: {
    mediaType: 'image' | 'video'
    imageUrl?: string
    imageAlt?: string
  } | null
  grid?: {
    x: number
    y: number
    w: number
    h: number
  }
}

export interface Car {
  _id: string
  marque: string
  modele: string
  imageUrl?: string
}

export interface BrandsSection {
  carsLeft: Car[]
  carsRight: Car[]
  description?: string
  surtitle?: string
  heading?: string
}

export interface HomepageData {
  hero: {
    heading?: string
    tagline?: string
    subtext?: string
  } | null
  serviceCards: {
    cards: ServiceCard[]
  } | null
  pitch: {
    eyebrow?: string
    heading?: string
    subtext?: string
  } | null
  process: {
    steps: Array<{ _key: string, title: string, description?: string }>
  } | null
  brandsSection: BrandsSection | null
}

export const HOMEPAGE_QUERY = `*[_type == "homepage"][0]{
  "hero": modules[_type == "hero"][0]{
    heading,
    tagline,
    subtext
  },
  "serviceCards": modules[_type == "serviceCards"][0]{
    cards[]{
      _key,
      cardType,
      categoryLabel,
      subtitle,
      link{ type, text, url, email, phone },
      media {
        mediaType,
        "imageUrl": image.asset->url,
        "imageAlt": image.alt
      },
      grid { x, y, w, h }
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
  "brandsSection": modules[_type == "brandsSection"][0]{
    carsLeft[]->{_id, marque, modele, "imageUrl": image.asset->url},
    carsRight[]->{_id, marque, modele, "imageUrl": image.asset->url},
    description,
    surtitle,
    heading
  }
}`
