import type { SanityLink } from './home'

export type { SanityLink }

export interface MenuLocation {
  city: string
}

export interface MenuData {
  menuLabel?: string
  closeLabel?: string
  cta?: SanityLink
  links?: SanityLink[]
  locations?: MenuLocation[]
}

export const MENU_QUERY = `*[_type == "menu"][0]{
  menuLabel,
  closeLabel,
  cta,
  links[],
  "locations": locations[]->{city}
}`
