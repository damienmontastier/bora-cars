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
  "links": links[]{
    "_key": _key,
    ${i18n('label', 'text')},
    "type": link.type,
    "blank": link.blank,
    "url": link.url,
    "email": link.email,
    "phone": link.phone,
    "internalLink": link.internalLink
  },
  "locations": locations[]->{ ${i18n('city')} }
}`
