import type { SanityLink } from './home'
import { seoFields, type SeoData } from './fragments'

export interface SettingsData {
  contactLink?: SanityLink
  seo?: SeoData
}

export const SETTINGS_QUERY = `*[_type == "settings"][0]{
  contactLink{ type, text, url, email, phone },
  ${seoFields()}
}`
