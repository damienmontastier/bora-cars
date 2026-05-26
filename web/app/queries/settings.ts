import type { SanityLink } from './home'
import { seoFields, type SanityImage, type SeoData } from './fragments'
import { i18n } from './i18n'

export interface Partner extends SanityImage {
  aspectRatio?: number
}

export interface SettingsData {
  contactLink?: SanityLink
  fallbackTitle?: string
  partners?: Partner[]
  seo?: SeoData
}

const contactLinkProjection = `{
  ${i18n('label', 'text')},
  "type": link.type,
  "blank": link.blank,
  "url": link.url,
  "email": link.email,
  "phone": link.phone,
  "internalLink": link.internalLink->{ "_id": _id, "_type": _type, "slug": slug.current }
}`

export const SETTINGS_QUERY = `*[_type == "settings"][0]{
  "contactLink": contactLink${contactLinkProjection},
  ${i18n('fallbackTitle')},
  "partners": partners[]{
    "imageUrl": asset._ref,
    ${i18n('alt', 'imageAlt')},
    "aspectRatio": asset->metadata.dimensions.aspectRatio
  },
  ${seoFields()}
}`
