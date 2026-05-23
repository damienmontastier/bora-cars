import type { SeoData } from './fragments'
import { seoFields } from './fragments'
import { i18n } from './i18n'

export interface ContactSubjectOption {
  _key: string
  label: string
}

export interface ContactData {
  heading: string | null
  submitLabel: string | null
  subjectOptions: ContactSubjectOption[] | null
  seo?: SeoData
}

export const CONTACT_QUERY = `*[_type == "contact"][0]{
  ${i18n('heading')},
  ${i18n('submitLabel')},
  "subjectOptions": subjectOptions[]{
    "_key": _key,
    ${i18n('label')}
  },
  ${seoFields()}
}`
