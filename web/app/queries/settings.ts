import type { SanityLink } from './home'
import { seoFields, type SeoData } from './fragments'
import { i18n } from './i18n'

export interface SettingsData {
  contactLink?: SanityLink
  fallbackTitle?: string
  seo?: SeoData
}

const contactLinkProjection = `{
  ${i18n('label', 'text')},
  "type": link.type,
  "blank": link.blank,
  "url": link.url,
  "email": link.email,
  "phone": link.phone,
  "internalLink": link.internalLink
}`

export const SETTINGS_QUERY = `*[_type == "settings"][0]{
  "contactLink": contactLink${contactLinkProjection},
  ${i18n('fallbackTitle')},
  ${seoFields()}
}`
