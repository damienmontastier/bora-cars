import { MODULES_PROJECTION, type PageModule } from './modules'

export interface ProfessionnelData {
  modules: PageModule[]
}

export const PROFESSIONNEL_QUERY = `*[_type == "professionnel"][0]{ ${MODULES_PROJECTION} }`
