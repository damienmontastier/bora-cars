import { imageFields } from './fragments'
import { i18n } from './i18n'

export interface CarLocation {
  city?: string
  address?: string
  email?: { type: string, email?: string, text?: string }
  phone?: { type: string, phone?: string, text?: string }
}

export interface CarDetailData {
  _id: string
  slug: string
  marque: string
  modele: string
  imageUrl?: string
  imageHotspot?: { x: number, y: number, width: number, height: number }
  imageCrop?: { top: number, bottom: number, left: number, right: number }
  rentalTypes?: string[]
  location?: CarLocation
}

export const CAR_QUERY = `*[_type == "car" && slug.current == $uid][0] {
  _id,
  "slug": slug.current,
  ${i18n('marque')},
  ${i18n('modele')},
  ${imageFields()},
  rentalTypes,
  location-> {
    ${i18n('city')},
    ${i18n('address')},
    "email": email { type, email, text },
    "phone": phone { type, phone, text }
  }
}`
