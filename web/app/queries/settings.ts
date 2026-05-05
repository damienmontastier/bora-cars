import type { SanityLink } from './home'
import { seoFields, type SeoData } from './fragments'
import { i18n } from './i18n'

export interface SettingsData {
  contactLink?: SanityLink
  fallbackTitle?: string
  seo?: SeoData
}

export const SETTINGS_QUERY = `*[_type == "settings"][0]{
  contactLink{ type, text, url, email, phone },
  ${i18n('fallbackTitle')},
  ${seoFields()}
}`
