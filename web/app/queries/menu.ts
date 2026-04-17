import type { SanityLink } from './home'
import { i18n } from './i18n'

export type { SanityLink }

export interface MenuLocation {
  city: string
}

export interface MenuData {
  menuLabel?: string
  closeLabel?: string
  links?: SanityLink[]
  locations?: MenuLocation[]
}

export const MENU_QUERY = `*[_type == "menu"][0]{
  ${i18n('menuLabel')},
  ${i18n('closeLabel')},
  links[],
  "locations": locations[]->{ ${i18n('city')} }
}`
