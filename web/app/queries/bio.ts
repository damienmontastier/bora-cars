import type { CatalogueCar } from './catalogue'
import type { SeoData } from './fragments'
import { CAR_PROJECTION } from './catalogue'
import { seoFields } from './fragments'
import { i18n } from './i18n'

export interface BioData {
  cars?: (CatalogueCar | null)[]
  whatsappMessage?: string
  seo?: SeoData
}

export const BIO_QUERY = `*[_type == "bio"][0]{
  "cars": cars[]-> ${CAR_PROJECTION},
  ${i18n('whatsappMessage')},
  ${seoFields()}
}`
