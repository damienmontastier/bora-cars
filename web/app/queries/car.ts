import { imageFields, type SanityImage } from './fragments'
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
  ogImageUrl?: string
  imageUrl?: string
  imageHotspot?: { x: number, y: number, width: number, height: number }
  imageCrop?: { top: number, bottom: number, left: number, right: number }
  images?: SanityImage[]
  rentalTypes?: string[]
  location?: CarLocation
  gamme?: 'suv' | 'sportive' | 'berline' | 'citadine' | 'compacte' | 'break'
  puissance?: number
  annee?: string
  boiteVitesse?: 'automatique' | 'manuelle'
  nombrePlaces?: number
  carburant?: 'essence' | 'electrique' | 'diesel' | 'hybride-rechargeable'
  ageMinimum?: number
  anciennetePermis?: number
  dureeMinimum?: number
  kmJourInclus?: number
  prixJournalier?: number
  caution?: number
  prixKmSupplementaire?: { prix?: number, km?: number }
  equipements?: string[]
  paiementsAcceptes?: ('virement' | 'carte' | 'especes')[]
}

export const CAR_QUERY = `*[_type == "car" && slug.current == $uid][0] {
  _id,
  "slug": slug.current,
  ${i18n('marque')},
  ${i18n('modele')},
  "ogImageUrl": image.asset->url,
  ${imageFields()},
  "images": images[] {
    ${imageFields()}
  },
  rentalTypes,
  gamme,
  puissance,
  annee,
  boiteVitesse,
  nombrePlaces,
  carburant,
  ageMinimum,
  anciennetePermis,
  dureeMinimum,
  kmJourInclus,
  prixJournalier,
  caution,
  prixKmSupplementaire { prix, km },
  equipements,
  paiementsAcceptes,
  location-> {
    ${i18n('city')},
    ${i18n('address')},
    "email": email { type, email, text },
    "phone": phone { type, phone, text }
  }
}`
