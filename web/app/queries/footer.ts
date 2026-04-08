import type { SanityLink } from './home'

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
  contactTitle,
  "locations": locations[]->{city},
  contactLinks[],
  sitemapTitle,
  sitemap[],
  socialsTitle,
  socials[],
  legalLink
}`
