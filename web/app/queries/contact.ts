import { i18n } from './i18n'

export interface ContactData {
  heading: string | null
}

export const CONTACT_QUERY = `*[_type == "contact"][0]{
  ${i18n('heading')}
}`
