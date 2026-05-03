import { i18n } from './i18n'
import { seoFields, type SeoData } from './fragments'

export interface ContactData {
  heading: string | null
  seo?: SeoData
}

export const CONTACT_QUERY = `*[_type == "contact"][0]{
  ${i18n('heading')},
  ${seoFields()}
}`
