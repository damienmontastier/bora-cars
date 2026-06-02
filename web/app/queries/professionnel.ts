import type { SeoData } from './fragments'
import type { PageModule } from './modules'
import { seoFields } from './fragments'
import { i18n } from './i18n'
import { MODULES_PROJECTION } from './modules'

export interface ProfessionnelData {
  modules: PageModule[]
  whatsappMessage?: string
  seo?: SeoData
}

export const PROFESSIONNEL_QUERY = `*[_type == "professionnel"][0]{ ${MODULES_PROJECTION}, ${i18n('whatsappMessage')}, ${seoFields()} }`
