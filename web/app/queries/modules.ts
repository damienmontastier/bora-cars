import { i18n, i18nBlock } from './i18n'
import { imageFields, imageRef, type SanityImage } from './fragments'

// ─── Shared primitives ────────────────────────────────────────────────────────

export interface SanityLink {
  _key?: string
  type: 'external' | 'email' | 'phone' | 'internal'
  text?: string
  url?: string
  email?: string
  phone?: string
}

export type HeroBackgroundMedia =
  | {
      mediaType: 'image'
      imageUrl: string
      imageAlt?: string
      imageHotspot?: { x: number; y: number; width: number; height: number }
      imageCrop?: { top: number; bottom: number; left: number; right: number }
    }
  | {
      mediaType: 'video'
      videoUrl: string
      videoAlt?: string
    }

export interface HeroData {
  heading?: string
  tagline?: string
  subtext?: string
  backgroundMedia?: HeroBackgroundMedia
  variant?: 'variant-1' | 'variant-2' | 'variant-3'
}

export type CardType = 'xxl' | 'xl' | 'l' | 'm'

export interface ServiceCard {
  _key: string
  cardType: CardType
  categoryLabel: string
  subtitle?: string
  link: SanityLink
  media: ({ mediaType: 'image' | 'video' } & Partial<SanityImage>) | null
  grid?: { x: number; y: number; w: number; h: number }
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

export interface MarqueeItem {
  _key: string
  label: string
}

export interface FullscreenMarqueeData {
  items: MarqueeItem[]
  cta?: SanityLink
  backgroundMedia?: HeroBackgroundMedia
}

export interface TestimonialItem {
  _key: string
  authorName: string
  authorRole?: string
  car?: { marque: string; modele: string }
  quote: string
  backgroundImage?: {
    imageUrl?: string
    imageAlt?: string
    imageHotspot?: { x: number; y: number; width: number; height: number }
    imageCrop?: { top: number; bottom: number; left: number; right: number }
  }
}

// ─── Union type ───────────────────────────────────────────────────────────────

export type PageModule =
  | ({ _type: 'hero'; _key: string } & HeroData)
  | { _type: 'serviceCards'; _key: string; cards: ServiceCard[] }
  | { _type: 'pitch'; _key: string; eyebrow?: string; heading?: string; subtext?: string }
  | { _type: 'process'; _key: string; steps: Array<{ _key: string; title: string; description?: string }> }
  | ({ _type: 'brandsSection'; _key: string } & BrandsSection)
  | ({ _type: 'fullscreenMarquee'; _key: string } & FullscreenMarqueeData)
  | { _type: 'servicePitch'; _key: string; eyebrow?: string; heading?: string; body?: string; ctaLabel?: string; ctaUrl?: string }
  | { _type: 'title'; _key: string; eyebrow?: string; heading?: string }
  | { _type: 'textBlock'; _key: string; eyebrow?: string; body?: any[] }
  | { _type: 'faq'; _key: string; items: Array<{ _key: string; question: string; answer?: string }> }
  | { _type: 'cardsColumn'; _key: string; heading?: string; subtext?: string; cards: Array<{ _key: string; title: string; description?: string }> }
  | { _type: 'testimonials'; _key: string; items: TestimonialItem[] }

// ─── GROQ fragments ───────────────────────────────────────────────────────────

export const HERO_PROJECTION = `{
  variant,
  ${i18n('heading')},
  ${i18n('tagline')},
  ${i18n('subtext')},
  "backgroundMedia": backgroundMedia {
    mediaType,
    "imageUrl": image.asset._ref,
    ${i18n('image.alt', 'imageAlt')},
    "imageHotspot": image.hotspot,
    "imageCrop": image.crop,
    "videoUrl": video.asset->url,
    ${i18n('video.alt', 'videoAlt')}
  }
}`

export const CAR_LABEL_PROJECTION = `coalesce(marque[language == $lang][0].value, marque[language == "fr"][0].value) + " " + coalesce(modele[language == $lang][0].value, modele[language == "fr"][0].value)`

export const MODULES_PROJECTION = `"modules": modules[]{
  _type,
  _key,
  _type == "hero" => ${HERO_PROJECTION},
  _type == "serviceCards" => {
    cards[]{
      _key,
      cardType,
      ${i18n('categoryLabel')},
      ${i18n('subtitle')},
      link{ type, text, url, email, phone },
      media { mediaType, ${imageFields()} },
      grid { x, y, w, h }
    }
  },
  _type == "pitch" => {
    ${i18n('eyebrow')},
    ${i18n('heading')},
    ${i18n('subtext')}
  },
  _type == "process" => {
    "steps": steps[]{ _key, ${i18n('title')}, ${i18n('description')} }
  },
  _type == "brandsSection" => {
    "carsLeft": carsLeft[]->{ _id, ${i18n('marque')}, ${i18n('modele')}, ${imageRef()} },
    "carsRight": carsRight[]->{ _id, ${i18n('marque')}, ${i18n('modele')}, ${imageRef()} },
    ${i18n('description')},
    ${i18n('surtitle')},
    ${i18n('heading')}
  },
  _type == "fullscreenMarquee" => {
    "items": items[]->{ "_key": _id, "label": ${CAR_LABEL_PROJECTION} },
    "cta": cta { type, text, url, email, phone },
    "backgroundMedia": backgroundMedia {
      mediaType,
      "imageUrl": image.asset._ref,
      ${i18n('image.alt', 'imageAlt')},
      "imageHotspot": image.hotspot,
      "imageCrop": image.crop,
      "videoUrl": video.asset->url,
      ${i18n('video.alt', 'videoAlt')}
    }
  },
  _type == "servicePitch" => {
    ${i18n('eyebrow')},
    ${i18n('heading')},
    ${i18n('body')},
    ${i18n('ctaLabel')},
    ctaUrl
  },
  _type == "title" => {
    ${i18n('eyebrow')},
    ${i18n('heading')}
  },
  _type == "textBlock" => {
    ${i18n('eyebrow')},
    ${i18nBlock('body')}
  },
  _type == "faq" => {
    "items": items[]{ _key, ${i18n('question')}, ${i18n('answer')} }
  },
  _type == "cardsColumn" => {
    ${i18n('heading')},
    ${i18n('subtext')},
    "cards": cards[]{ _key, ${i18n('title')}, ${i18n('description')} }
  },
  _type == "testimonials" => {
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
  }
}`
