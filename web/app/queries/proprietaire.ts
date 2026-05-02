import { MODULES_PROJECTION, type PageModule } from './modules'

export interface ProprietaireData {
  modules: PageModule[]
}

export const PROPRIETAIRE_QUERY = `*[_type == "proprietaire"][0]{ ${MODULES_PROJECTION} }`
