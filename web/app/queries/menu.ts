import type { SanityLink } from './home'
import { i18n } from './i18n'

export type { SanityLink }

export interface MenuLocation {
  city: string
  link?: SanityLink
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
    "internalLink": link.internalLink->{ "_id": _id, "_type": _type, "slug": slug.current }
  },
  "locations": locations[]->{
    ${i18n('city')},
    "link": link{
      "type": type,
      "blank": blank,
      "url": url,
      "email": email,
      "phone": phone,
      "internalLink": internalLink->{ "_id": _id, "_type": _type, "slug": slug.current }
    }
  }
}`
