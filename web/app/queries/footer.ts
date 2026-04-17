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
  legalLink?: SanityLink
}

export const FOOTER_QUERY = `*[_type == "footer"][0]{
  ${i18n('contactTitle')},
  "locations": locations[]->{ ${i18n('city')} },
  contactLinks[],
  ${i18n('sitemapTitle')},
  sitemap[],
  ${i18n('socialsTitle')},
  socials[],
  legalLink
}`
