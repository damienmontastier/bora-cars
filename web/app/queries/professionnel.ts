import { MODULES_PROJECTION, type PageModule } from './modules'
import { seoFields, type SeoData } from './fragments'

export interface ProfessionnelData {
  modules: PageModule[]
  seo?: SeoData
}

export const PROFESSIONNEL_QUERY = `*[_type == "professionnel"][0]{ ${MODULES_PROJECTION}, ${seoFields()} }`
