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
}

export interface CatalogueTextBlock {
  eyebrow?: string
  body?: any[]
}

export interface CatalogueData {
  title?: string
  contentPreFooter?: CatalogueTextBlock
  seo?: SeoData
  cars: CatalogueCar[]
}

const CAR_PROJECTION = `{
  _id,
  "slug": slug.current,
  marque,
  modele,
  ${imageFields()},
  rentalTypes
}`

export const CATALOGUE_QUERY = `{
  "page": *[_type == "catalogue"][0]{
    ${i18n('title')},
    "contentPreFooter": contentPreFooter{
      ${i18n('eyebrow')},
      ${i18nBlock('body')}
    },
    ${seoFields()}
  },
  "cars": *[_type == "car"] | order(_createdAt desc) [$from..$to] ${CAR_PROJECTION},
  "total": count(*[_type == "car"])
}`

export const CATALOGUE_CARS_QUERY = `*[_type == "car"] | order(_createdAt desc) [$from..$to] ${CAR_PROJECTION}`
