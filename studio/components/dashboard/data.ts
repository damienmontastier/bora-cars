import { useCallback, useEffect, useRef, useState } from 'react'
import { useClient } from 'sanity'
import { SINGLETON_TYPES } from '../../schemaTypes/constants'

export const API_VERSION = '2026-04-06'

export const CONTENT_TYPES = [...SINGLETON_TYPES, 'car', 'location', 'legalPage']

export type Localized<T = unknown> = { _key?: string, language?: string, value?: T }[] | null

export interface ImageInfo {
  url?: string
  width?: number
  hasHotspot?: boolean
  alt?: Localized<string>
}

interface BaseDoc {
  _id: string
  _type: string
  _updatedAt: string
  _createdAt: string
}

export interface CarDoc extends BaseDoc {
  marque?: string
  modele?: string
  slug?: string
  location?: string
  clientType?: string[] | null
  rentalTypes?: string[] | null
  prixJournalier?: number | null
  prixMensuel?: number | null
  kmJourInclus?: number | null
  kmMoisInclus?: number | null
  gamme?: string | null
  annee?: string | null
  boiteVitesse?: string | null
  carburant?: string | null
  nombrePlaces?: number | null
  nombrePortes?: number | null
  puissance?: number | null
  acceleration0to100?: number | null
  caution?: number | null
  ageMinimum?: number | null
  anciennetePermis?: number | null
  dureeMinimum?: number | null
  prixKmSupplementaire?: { prix?: number, km?: number } | null
  paiementsAcceptes?: string[] | null
  city?: Localized<string>
  description?: Localized
  teinteExterieure?: Localized<string>
  teinteInterieure?: Localized<string>
  equipements?: Localized<string[]>
  image?: ImageInfo | null
  images?: ImageInfo[] | null
}

export interface LocationDoc extends BaseDoc {
  city?: Localized<string>
  address?: string
  postalCode?: string
  addressLocality?: string
  country?: string
  phone?: string
  link?: string
  hasGeo?: boolean
  hoursCount?: number | null
}

export interface LegalDoc extends BaseDoc {
  title?: Localized<string>
  slug?: string
  slugEn?: string
  content?: Localized
  seo?: SeoInfo | null
}

export interface SeoInfo {
  title?: Localized<string>
  description?: Localized<string>
}

export interface SingletonDoc extends BaseDoc {
  seo?: SeoInfo | null
  moduleTypes?: string[] | null
  whatsappMessage?: Localized<string>
  whatsapp?: Record<string, Localized<string>> | null
  contactLink?: { label?: Localized<string>, target?: string } | null
  email?: string
  socialLinks?: string[] | null
  tauxChf?: number | null
  fallbackTitle?: Localized<string>
  bioCars?: string[] | null
  subjectOptionsCount?: number | null
  legalLinksCount?: number | null
  locationRefs?: string[] | null
  linksCount?: number | null
  [section: string]: unknown
}

export interface GlossaryEntry {
  _key: string
  key?: string
  value?: Localized<string>
}

export interface VideoAsset {
  _id: string
  originalFilename?: string
  size?: number
  mimeType?: string
  usedBy: { _id: string, _type: string }[]
}

export interface DashboardData {
  cars: CarDoc[]
  locations: LocationDoc[]
  legalPages: LegalDoc[]
  singletons: SingletonDoc[]
  videos: VideoAsset[]
  assets: { images: number, files: number, unused: number }
}

const IMAGE = `{
  "url": asset->url,
  "width": asset->metadata.dimensions.width,
  "hasHotspot": defined(hotspot),
  alt
}`

const SEO = `seo{ title, description }`

export const DASHBOARD_QUERY = `{
  "cars": *[_type == "car"]{
    _id, _type, _updatedAt, _createdAt,
    marque, modele, "slug": slug.current, "location": location._ref,
    clientType, rentalTypes, prixJournalier, prixMensuel, kmJourInclus, kmMoisInclus,
    gamme, annee, boiteVitesse, carburant, nombrePlaces, nombrePortes, puissance, acceleration0to100,
    caution, ageMinimum, anciennetePermis, dureeMinimum, prixKmSupplementaire, paiementsAcceptes,
    "city": location->city,
    description, teinteExterieure, teinteInterieure, equipements,
    "image": image${IMAGE},
    "images": images[]${IMAGE}
  },
  "locations": *[_type == "location"]{
    _id, _type, _updatedAt, _createdAt,
    city, address, postalCode, addressLocality, country,
    "phone": phone.phone,
    "link": coalesce(link.url, link.internalLink._ref),
    "hasGeo": defined(geo.lat) && defined(geo.lng),
    "hoursCount": count(openingHours)
  },
  "legalPages": *[_type == "legalPage"]{
    _id, _type, _updatedAt, _createdAt,
    title, "slug": slug.current, "slugEn": slugEn.current, content, ${SEO}
  },
  "singletons": *[_type in $singletons]{
    _id, _type, _updatedAt, _createdAt,
    ${SEO},
    "moduleTypes": modules[]._type,
    whatsappMessage,
    whatsapp,
    "contactLink": contactLink{
      label,
      "target": coalesce(link.url, link.email, link.phone, link.internalLink._ref)
    },
    email, socialLinks, tauxChf, fallbackTitle,
    "bioCars": cars[]._ref,
    "subjectOptionsCount": count(subjectOptions),
    "legalLinksCount": count(legalLinks),
    "locationRefs": locations[]._ref,
    "linksCount": count(links),
    _type == "glossaire" => { ... }
  },
  "videos": *[_type == "sanity.fileAsset" && mimeType match "video*"]{
    _id, originalFilename, size, mimeType,
    "usedBy": *[references(^._id)]{ _id, _type }
  },
  "assets": {
    "images": count(*[_type == "sanity.imageAsset"]),
    "files": count(*[_type == "sanity.fileAsset"]),
    "unused": count(*[_type in ["sanity.imageAsset", "sanity.fileAsset"] && count(*[references(^._id)]) == 0])
  }
}`

const REFRESH_DEBOUNCE_MS = 1200

export function useDashboardData() {
  const client = useClient({ apiVersion: API_VERSION })
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshedAt, setRefreshedAt] = useState<number | null>(null)
  const requestId = useRef(0)

  const refresh = useCallback(async () => {
    const id = ++requestId.current
    setLoading(true)
    try {
      const res = await client.fetch<DashboardData>(
        DASHBOARD_QUERY,
        { singletons: SINGLETON_TYPES },
        { perspective: 'raw', tag: 'dashboard' },
      )
      if (id !== requestId.current) return
      setData(res)
      setError(null)
      setRefreshedAt(Date.now())
    }
    catch (e) {
      if (id !== requestId.current) return
      setError(e instanceof Error ? e.message : 'Erreur de chargement')
    }
    finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [client])

  useEffect(() => {
    refresh()
    let timer: ReturnType<typeof setTimeout> | undefined
    const subscription = client
      .listen('*[_type in $types]', { types: CONTENT_TYPES }, {
        includeResult: false,
        visibility: 'query',
        events: ['mutation'],
      })
      .subscribe({
        next: () => {
          clearTimeout(timer)
          timer = setTimeout(refresh, REFRESH_DEBOUNCE_MS)
        },
        error: () => {
        },
      })
    return () => {
      clearTimeout(timer)
      subscription.unsubscribe()
    }
  }, [client, refresh])

  return { data, error, loading, refreshedAt, refresh }
}
