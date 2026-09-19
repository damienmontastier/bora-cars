import type { SeoData } from './fragments'
import { imageFields, seoFields } from './fragments'
import { i18n, i18nBlock } from './i18n'

export const CATALOGUE_LIMIT = 25

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
  description?: string
  contentPreFooter?: CatalogueTextBlock
  whatsappMessage?: string
  seo?: SeoData
  cars: CatalogueCar[]
}

export type CatalogueAudience = 'particulier' | 'professionnel'

export interface FilterOption {
  value: string
  label: string
}

export type CatalogueFacets = Record<string, FilterOption[]>

export type CatalogueFilters = Record<string, string>

export interface PriceBucket {
  value: string
  min: number
  max: number | null
}

export const PRICE_BUCKETS: PriceBucket[] = [
  { value: '0-500', min: 0, max: 500 },
  { value: '500-1000', min: 500, max: 1000 },
  { value: '1000-2000', min: 1000, max: 2000 },
  { value: '2000+', min: 2000, max: null },
]

export interface CatalogueFilterDef {
  key: string
  enabled: boolean
  type: 'facet' | 'range'
  clause: string
  facet?: string
  buckets?: PriceBucket[]
}

export const CATALOGUE_FILTERS: CatalogueFilterDef[] = [
  {
    key: 'marque',
    enabled: false,
    type: 'facet',
    clause: `($marque == "" || marque == $marque)`,
    facet: `"marque": array::unique(*[@AUDIENCE@ && defined(marque)].marque)`,
  },
  {
    key: 'ville',
    enabled: true,
    type: 'facet',
    clause: `($ville == "" || location._ref in *[_type == "location" && city[language == "fr"][0].value == $ville]._id)`,
    facet: `"ville": *[_type == "location" && _id in array::unique(*[@AUDIENCE@ && defined(location)].location._ref)]{
      "value": city[language == "fr"][0].value,
      ${i18n('city', 'label')}
    }`,
  },
  {
    key: 'prix',
    enabled: false,
    type: 'range',
    clause: `(!defined($prixMin) || (defined(prixJournalier) && prixJournalier >= $prixMin && prixJournalier <= $prixMax))`,
    buckets: PRICE_BUCKETS,
  },
]

export const ENABLED_FILTERS = CATALOGUE_FILTERS.filter(f => f.enabled)

function audienceFilter(audience: CatalogueAudience) {
  return audience === 'professionnel'
    ? `_type == "car" && "professionnel" in clientType`
    : `_type == "car" && (!defined(clientType) || "particulier" in clientType)`
}

const FILTER_CLAUSE = [
  `($q == "" || marque match $q || modele match $q)`,
  ...ENABLED_FILTERS.map(f => f.clause),
].map(c => `\n  && ${c}`).join('')

function carFilter(audience: CatalogueAudience) {
  return `${audienceFilter(audience)}${FILTER_CLAUSE}`
}

export const CAR_PROJECTION = `{
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
  const filter = carFilter(audience)
  return `{
    "page": *[_type == "${singleton}"][0]{
      ${i18n('title')},
      ${i18n('description')},
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
  return `*[${carFilter(audience)}] | order(_createdAt desc) [$from..$to] ${CAR_PROJECTION}`
}

function catalogueFacetsQuery(audience: CatalogueAudience) {
  const f = audienceFilter(audience)
  const projections = ENABLED_FILTERS
    .filter(d => d.type === 'facet' && d.facet)
    .map(d => d.facet!.replace(/@AUDIENCE@/g, f))
  if (!projections.length)
    return `{ "_": null }`
  return `{\n  ${projections.join(',\n  ')}\n}`
}

export const CATALOGUE_QUERY = catalogueQuery('catalogue', 'particulier')
export const CATALOGUE_CARS_QUERY = catalogueCarsQuery('particulier')
export const CATALOGUE_FACETS_QUERY = catalogueFacetsQuery('particulier')

export const CATALOGUE_PRO_QUERY = catalogueQuery('catalogueProfessionnel', 'professionnel')
export const CATALOGUE_PRO_CARS_QUERY = catalogueCarsQuery('professionnel')
export const CATALOGUE_PRO_FACETS_QUERY = catalogueFacetsQuery('professionnel')
