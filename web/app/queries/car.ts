import type { SanityImage, SeoData } from './fragments'
import { imageFields, imageMemberFields, seoFields } from './fragments'
import { i18n, i18nBlock } from './i18n'

export interface CarLocation {
  city?: string
  address?: string
  postalCode?: string
  addressLocality?: string
  phone?: { type: string, phone?: string }
}

export interface CarPreFooter {
  eyebrow?: string
  body?: any[]
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
  description?: any[]
  rentalTypes?: string[]
  location?: CarLocation
  gamme?: 'suv' | 'sportive' | 'berline' | 'citadine' | 'compacte' | 'break'
  puissance?: number
  acceleration0to100?: number
  annee?: string
  boiteVitesse?: 'automatique' | 'manuelle'
  nombrePlaces?: number
  nombrePortes?: number
  teinteExterieure?: string
  teinteInterieure?: string
  carburant?: 'essence' | 'electrique' | 'diesel' | 'hybride-rechargeable'
  ageMinimum?: number
  anciennetePermis?: number
  dureeMinimum?: number
  kmJourInclus?: number
  prixJournalier?: number
  prixMensuel?: number
  caution?: number
  prixKmSupplementaire?: { prix?: number, km?: number }
  equipements?: string[]
  paiementsAcceptes?: ('virement' | 'carte' | 'especes')[]
  assuranceTitre?: string
  assuranceSousTitre?: string
  specsLayout?: { fixed?: string[], list?: string[] }
}

export interface CarPageResult {
  car: CarDetailData | null
  page: {
    contentPreFooter?: CarPreFooter
    whatsappMessage?: string
    seo?: SeoData
  } | null
}

export const CAR_QUERY = `{
  "car": *[_type == "car" && slug.current == $uid][0] {
    _id,
    "slug": slug.current,
    marque,
    modele,
    "ogImageUrl": image.asset->url,
    ${imageFields()},
    "images": images[] {
      ${imageMemberFields()}
    },
    ${i18nBlock('description')},
    rentalTypes,
    gamme,
    puissance,
    acceleration0to100,
    annee,
    boiteVitesse,
    nombrePlaces,
    nombrePortes,
    ${i18n('teinteExterieure')},
    ${i18n('teinteInterieure')},
    carburant,
    ageMinimum,
    anciennetePermis,
    dureeMinimum,
    kmJourInclus,
    prixJournalier,
    prixMensuel,
    caution,
    prixKmSupplementaire { prix, km },
    ${i18n('equipements')},
    paiementsAcceptes,
    ${i18n('assuranceTitre')},
    ${i18n('assuranceSousTitre')},
    "specsLayout": select(
      overrideSpecsLayout == true => specsLayout { fixed, list },
      *[_type == "carPage"][0].specsLayout { fixed, list }
    ),
    location-> {
      ${i18n('city')},
      address,
      postalCode,
      addressLocality,
      "phone": phone { type, phone }
    }
  },
  "page": *[_type == "carPage"][0] {
    "contentPreFooter": contentPreFooter{
      ${i18n('eyebrow')},
      ${i18nBlock('body')}
    },
    ${i18n('whatsappMessage')},
    ${seoFields()}
  }
}`
