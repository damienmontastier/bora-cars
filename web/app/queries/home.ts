import { imageFields, imageRef, type SanityImage } from './fragments'

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
  media: ({ mediaType: 'image' | 'video' } & Partial<SanityImage>) | null
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

export interface HeroBackgroundMedia {
  mediaType: 'image' | 'video'
  imageUrl?: string
  imageAlt?: string
  imageHotspot?: { x: number, y: number, width: number, height: number }
  imageCrop?: { top: number, bottom: number, left: number, right: number }
  videoUrl?: string
  videoAlt?: string
}

export interface HeroData {
  heading?: string
  tagline?: string
  subtext?: string
  backgroundMedia?: HeroBackgroundMedia
}

export interface HomepageData {
  hero: HeroData | null
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
  "serviceCards": modules[_type == "serviceCards"][0]{
    cards[]{
      _key,
      cardType,
      categoryLabel,
      subtitle,
      link{ type, text, url, email, phone },
      media {
        mediaType,
        ${imageFields()}
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
    carsLeft[]->{_id, marque, modele, ${imageRef()}},
    carsRight[]->{_id, marque, modele, ${imageRef()}},
    description,
    surtitle,
    heading
  }
}`
