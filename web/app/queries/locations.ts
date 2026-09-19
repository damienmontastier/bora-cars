import { i18n } from './i18n'

export interface LocationData {
  city?: string
  description?: string
  address?: string
  postalCode?: string
  addressLocality?: string
  country?: string
  phone?: string
  mapsUrl?: string
  geo?: { lat?: number, lng?: number }
  openingHours?: { days?: string[], opens?: string, closes?: string, open24h?: boolean }[]
}

export const LOCATIONS_QUERY = `*[_type == "location"] | order(_createdAt asc){
  ${i18n('city')},
  ${i18n('description')},
  address,
  postalCode,
  addressLocality,
  country,
  "phone": phone.phone,
  "mapsUrl": link.url,
  "geo": geo{ lat, lng },
  "openingHours": openingHours[]{ days, opens, closes, open24h }
}`
