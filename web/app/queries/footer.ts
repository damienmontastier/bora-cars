import type { SanityLink } from './home'
import { i18n } from './i18n'

export type { SanityLink }

export interface FooterLocation {
  city: string
}

export interface FooterData {
  contactTitle?: string
  locations?: FooterLocation[]
  contactLinks?: SanityLink[]
  sitemapTitle?: string
  sitemap?: SanityLink[]
  socialsTitle?: string
  socials?: SanityLink[]
  legalTitle?: string
  legalLinks?: SanityLink[]
}

const linkProjection = `{
  "_key": _key,
  ${i18n('label', 'text')},
  "type": link.type,
  "blank": link.blank,
  "url": link.url,
  "email": link.email,
  "phone": link.phone,
  "internalLink": link.internalLink->{ "_id": _id, "_type": _type, "slug": slug.current }
}`

export const FOOTER_QUERY = `*[_type == "footer"][0]{
  ${i18n('contactTitle')},
  "locations": locations[]->{ ${i18n('city')} },
  "contactLinks": contactLinks[]${linkProjection},
  ${i18n('sitemapTitle')},
  "sitemap": sitemap[]${linkProjection},
  ${i18n('socialsTitle')},
  "socials": socials[]${linkProjection},
  ${i18n('legalTitle')},
  "legalLinks": legalLinks[]${linkProjection}
}`
