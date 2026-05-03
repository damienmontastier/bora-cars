import type { SeoData } from './fragments'
import { imageFields, seoFields } from './fragments'
import { i18n } from './i18n'

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
}

export interface CatalogueData {
  title?: string
  seo?: SeoData
  cars: CatalogueCar[]
}

const CAR_PROJECTION = `{
  _id,
  "slug": slug.current,
  ${i18n('marque')},
  ${i18n('modele')},
  ${imageFields()},
  rentalTypes
}`

export const CATALOGUE_QUERY = `{
  "page": *[_type == "catalogue"][0]{
    ${i18n('title')},
    ${seoFields()}
  },
  "cars": *[_type == "car"] | order(_createdAt desc) [$from..$to] ${CAR_PROJECTION},
  "total": count(*[_type == "car"])
}`

export const CATALOGUE_CARS_QUERY = `*[_type == "car"] | order(_createdAt desc) [$from..$to] ${CAR_PROJECTION}`
