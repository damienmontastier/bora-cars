import type { SeoData } from './fragments'
import type { ProFormData } from '~/config/CONTACT_PRO_CONFIG'
import { seoFields } from './fragments'
import { i18n } from './i18n'

export interface ContactSubjectOption {
  _key: string
  label: string
}

export interface ContactProIntroData {
  heading: string | null
  lead: string | null
  text: string | null
}

export interface ContactLinkCardData {
  title: string | null
  subtitle: string | null
  url: string | null
}

export interface ContactProSuccessData {
  kicker: string | null
  title: string | null
  text: string | null
  linksTitle: string | null
  whatsapp: ContactLinkCardData | null
  instagram: ContactLinkCardData | null
}

export interface ContactProfileSwitchData {
  label: string | null
  generalTitle: string | null
  generalSubtitle: string | null
  proTitle: string | null
  proSubtitle: string | null
}

export interface ContactData {
  profileSwitch: ContactProfileSwitchData | null
  heading: string | null
  submitLabel: string | null
  subjectOptions: ContactSubjectOption[] | null
  proIntro: ContactProIntroData | null
  proForm: ProFormData | null
  proSuccess: ContactProSuccessData | null
  seo?: SeoData
}

const LINK_CARD_PROJECTION = `{
      ${i18n('title')},
      ${i18n('subtitle')},
      url
    }`

export function proFormProjection(withCrm = false) {
  const crm = withCrm ? 'airtableColumn, airtableFormat, pendingCrmValue,' : ''
  return `{
    "steps": steps[]{
      _key,
      ${i18n('tab')},
      ${i18n('title')},
      ${i18n('subtitle')},
      "fields": fields[]{
        _key,
        _type,
        role,
        required,
        width,
        format,
        defaultValue,
        display,
        multiple,
        firstYear,
        ${crm}
        "showIf": showIf{ field, values },
        ${i18n('label')},
        ${i18n('placeholder')},
        ${i18n('errorMessage')},
        ${i18n('text')},
        ${i18n('monthLabel')},
        ${i18n('yearLabel')},
        ${i18n('pendingLabel')},
        ${i18n('before')},
        ${i18n('linkLabel')},
        ${i18n('after')},
        "options": options[]{
          _key,
          ${i18n('label')},
          ${i18n('description')}${withCrm ? ',\n          crmValue' : ''}
        }
      }
    },
    "labels": labels{
      ${['stepsLabel', 'stepCounter', 'start', 'next', 'back', 'submit', 'yes', 'no', 'requiredError', 'note', 'sendError'].map(f => i18n(f)).join(',\n      ')}
    }
  }`
}

export const CONTACT_QUERY = `*[_type == "contact"][0]{
  "profileSwitch": profileSwitch{
    ${i18n('label')},
    ${i18n('generalTitle')},
    ${i18n('generalSubtitle')},
    ${i18n('proTitle')},
    ${i18n('proSubtitle')}
  },
  ${i18n('heading')},
  ${i18n('submitLabel')},
  "subjectOptions": subjectOptions[]{
    "_key": _key,
    ${i18n('label')}
  },
  "proIntro": proIntro{
    ${i18n('heading')},
    ${i18n('lead')},
    ${i18n('text')}
  },
  "proForm": proForm${proFormProjection()},
  "proSuccess": proSuccess{
    ${i18n('kicker')},
    ${i18n('title')},
    ${i18n('text')},
    ${i18n('linksTitle')},
    "whatsapp": whatsapp${LINK_CARD_PROJECTION},
    "instagram": instagram${LINK_CARD_PROJECTION}
  },
  ${seoFields()}
}`
