import { MODULES_PROJECTION, type PageModule } from './modules'
import { seoFields, type SeoData } from './fragments'

export interface ProprietaireData {
  modules: PageModule[]
  seo?: SeoData
}

export const PROPRIETAIRE_QUERY = `*[_type == "proprietaire"][0]{ ${MODULES_PROJECTION}, ${seoFields()} }`
