import type { SeoData } from './fragments'
import { imageFields, seoFields } from './fragments'
import { i18n, i18nBlock } from './i18n'

export const CATALOGUE_LIMIT = 18

export interface CatalogueCar {
  _id: string
  slug?: string
  marque: string
  modele: string
  imageUrl?: string
  imageHotspot?: { x: number, y: number, width: number, height: number }
  imageCrop?: { top: number, bottom: number, left: number, right: number }
  rentalTypes?: string[]
  prixJournalier?: number
  prixMensuel?: number
}

export interface CatalogueTextBlock {
  eyebrow?: string
  body?: any[]
}

export interface CatalogueData {
  title?: string
  contentPreFooter?: CatalogueTextBlock
  whatsappMessage?: string
  seo?: SeoData
  cars: CatalogueCar[]
}

export type CatalogueAudience = 'particulier' | 'professionnel'

// Filtre GROQ selon le champ `clientType` de la voiture :
// - particulier (standard) : clientType non défini OU contient "particulier" → catalogue par défaut
// - professionnel : clientType contient "professionnel"
function audienceFilter(audience: CatalogueAudience) {
  return audience === 'professionnel'
    ? `_type == "car" && "professionnel" in clientType`
    : `_type == "car" && (!defined(clientType) || "particulier" in clientType)`
}

const CAR_PROJECTION = `{
  _id,
  "slug": slug.current,
  marque,
  modele,
  ${imageFields()},
  rentalTypes,
  prixJournalier,
  prixMensuel
}`

function catalogueQuery(singleton: string, audience: CatalogueAudience) {
  const filter = audienceFilter(audience)
  return `{
    "page": *[_type == "${singleton}"][0]{
      ${i18n('title')},
      "contentPreFooter": contentPreFooter{
        ${i18n('eyebrow')},
        ${i18nBlock('body')}
      },
      ${i18n('whatsappMessage')},
      ${seoFields()}
    },
    "cars": *[${filter}] | order(_createdAt desc) [$from..$to] ${CAR_PROJECTION},
    "total": count(*[${filter}])
  }`
}

function catalogueCarsQuery(audience: CatalogueAudience) {
  return `*[${audienceFilter(audience)}] | order(_createdAt desc) [$from..$to] ${CAR_PROJECTION}`
}

// Catalogue standard (particuliers + voitures sans `clientType`)
export const CATALOGUE_QUERY = catalogueQuery('catalogue', 'particulier')
export const CATALOGUE_CARS_QUERY = catalogueCarsQuery('particulier')

// Catalogue professionnel
export const CATALOGUE_PRO_QUERY = catalogueQuery('catalogueProfessionnel', 'professionnel')
export const CATALOGUE_PRO_CARS_QUERY = catalogueCarsQuery('professionnel')
