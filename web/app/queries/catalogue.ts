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
  description?: string
  contentPreFooter?: CatalogueTextBlock
  whatsappMessage?: string
  seo?: SeoData
  cars: CatalogueCar[]
}

export type CatalogueAudience = 'particulier' | 'professionnel'

// Option d'un select de filtre : `value` = clé stable (URL + GROQ), `label` = affiché.
export interface FilterOption {
  value: string
  label: string
}

// Facettes : map { clé de filtre → options disponibles }, alimentée par Sanity.
export type CatalogueFacets = Record<string, FilterOption[]>

// État des filtres tel que stocké dans l'URL (query string), clés dynamiques.
export type CatalogueFilters = Record<string, string>

// Tranches de prix (sur le prix JOURNALIER). `max: null` = pas de borne haute.
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

/**
 * Registre déclaratif des filtres du catalogue — source unique de vérité.
 *
 * Chaque entrée pilote, sans duplication : la clause GROQ du filtre, la requête
 * de facettes (valeurs distinctes lues dans Sanity), les paramètres + clés
 * d'URL côté composable, et le rendu des `<AtomsSelect>` côté UI.
 *
 * Activer / désactiver un filtre = basculer `enabled`. Les libellés sont des
 * clés i18n `catalogue.filters.<key>` (+ `.all.<key>`, et pour un range
 * `.<key>Options.<bucket>`).
 *
 * Types :
 * - `facet` : valeurs distinctes issues de Sanity (100% dynamique). `clause`
 *   compare `$<key>` ; `facet` est la projection GROQ qui liste les options
 *   (string[] → value=label, ou {value,label}[]). `@AUDIENCE@` y est remplacé
 *   par le filtre d'audience.
 * - `range` : tranches numériques statiques (`buckets`). `clause` compare
 *   `$<key>Min`/`$<key>Max`.
 */
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
    // On compare la valeur FR (canonique) de la ville du lieu référencé, pour
    // grouper toutes les agences d'une même ville indépendamment de la locale.
    clause: `($ville == "" || location->city[language == "fr"][0].value == $ville)`,
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

// Filtre GROQ selon le champ `clientType` de la voiture :
// - particulier (standard) : clientType non défini OU contient "particulier" → catalogue par défaut
// - professionnel : clientType contient "professionnel"
function audienceFilter(audience: CatalogueAudience) {
  return audience === 'professionnel'
    ? `_type == "car" && "professionnel" in clientType`
    : `_type == "car" && (!defined(clientType) || "particulier" in clientType)`
}

// Clause de filtres générée depuis le registre. Recherche texte (`q`) toujours
// active ; chaque condition se neutralise quand son paramètre est « vide »
// (`""` pour les chaînes, `null` pour les bornes de prix), ce qui garde une
// requête à chaîne constante (params seuls variables).
const FILTER_CLAUSE = [
  `($q == "" || marque match $q || modele match $q)`,
  ...ENABLED_FILTERS.map(f => f.clause),
].map(c => `\n  && ${c}`).join('')

function carFilter(audience: CatalogueAudience) {
  return `${audienceFilter(audience)}${FILTER_CLAUSE}`
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

// Valeurs distinctes par filtre `facet` activé, pour l'audience donnée.
// Indépendant de la sélection courante : on propose toujours toutes les options.
function catalogueFacetsQuery(audience: CatalogueAudience) {
  const f = audienceFilter(audience)
  const projections = ENABLED_FILTERS
    .filter(d => d.type === 'facet' && d.facet)
    .map(d => d.facet!.replace(/@AUDIENCE@/g, f))
  // Garde-fou : projection non vide même si aucun filtre facet n'est activé.
  if (!projections.length)
    return `{ "_": null }`
  return `{\n  ${projections.join(',\n  ')}\n}`
}

// Catalogue standard (particuliers + voitures sans `clientType`)
export const CATALOGUE_QUERY = catalogueQuery('catalogue', 'particulier')
export const CATALOGUE_CARS_QUERY = catalogueCarsQuery('particulier')
export const CATALOGUE_FACETS_QUERY = catalogueFacetsQuery('particulier')

// Catalogue professionnel
export const CATALOGUE_PRO_QUERY = catalogueQuery('catalogueProfessionnel', 'professionnel')
export const CATALOGUE_PRO_CARS_QUERY = catalogueCarsQuery('professionnel')
export const CATALOGUE_PRO_FACETS_QUERY = catalogueFacetsQuery('professionnel')
