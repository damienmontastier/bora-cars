import type { HeroData, FullscreenMarqueeData } from './home'
import { HERO_PROJECTION, CAR_LABEL_PROJECTION } from './home'
import { i18n, i18nBlock } from './i18n'

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
  fullscreenMarquee: FullscreenMarqueeData | null
}

export const PROFESSIONNEL_QUERY = `*[_type == "professionnel"][0]{
  "hero": modules[_type == "hero"][0]${HERO_PROJECTION},
  "title": modules[_type == "title"][0]{
    ${i18n('eyebrow')},
    ${i18n('heading')}
  },
  "textBlock": modules[_type == "textBlock"][0]{
    ${i18n('eyebrow')},
    ${i18nBlock('body')}
  },
  "faq": modules[_type == "faq"][0]{
    "items": items[]{ _key, ${i18n('question')}, ${i18n('answer')} }
  },
  "cardsColumn": modules[_type == "cardsColumn"][0]{
    ${i18n('heading')},
    ${i18n('subtext')},
    "cards": cards[]{ _key, ${i18n('title')}, ${i18n('description')} }
  },
  "fullscreenMarquee": modules[_type == "fullscreenMarquee"][0]{
    "items": items[]->{
      "_key": _id,
      "label": ${CAR_LABEL_PROJECTION}
    },
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
  }
}`
