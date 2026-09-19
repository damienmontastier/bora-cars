import type { SeoData } from './fragments'
import { seoFields } from './fragments'
import { i18n } from './i18n'

export interface ContactSubjectOption {
  _key: string
  label: string
}

// Texte d'accueil du parcours « Leasing professionnel » (colonne de gauche)
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

// Écran de succès du parcours pro. `text` peut contenir le jeton {prenom}.
export interface ContactProSuccessData {
  kicker: string | null
  title: string | null
  text: string | null
  linksTitle: string | null
  whatsapp: ContactLinkCardData | null
  instagram: ContactLinkCardData | null
}

export interface ContactData {
  heading: string | null
  submitLabel: string | null
  subjectOptions: ContactSubjectOption[] | null
  proIntro: ContactProIntroData | null
  proSuccess: ContactProSuccessData | null
  seo?: SeoData
}

const LINK_CARD_PROJECTION = `{
      ${i18n('title')},
      ${i18n('subtitle')},
      url
    }`

export const CONTACT_QUERY = `*[_type == "contact"][0]{
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
