import type { SeoData } from './fragments'
import type { PageModule } from './modules'
import { seoFields } from './fragments'
import { i18n } from './i18n'
import { MODULES_PROJECTION } from './modules'

export interface ProprietaireData {
  modules: PageModule[]
  whatsappMessage?: string
  seo?: SeoData
}

export const PROPRIETAIRE_QUERY = `*[_type == "proprietaire"][0]{ ${MODULES_PROJECTION}, ${i18n('whatsappMessage')}, ${seoFields()} }`
