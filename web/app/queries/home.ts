import { MODULES_PROJECTION } from './modules'

export type {
  HeroData,
  HeroBackgroundMedia,
  ServiceCard,
  BrandsSection,
  FullscreenMarqueeData,
  MarqueeItem,
  SanityLink,
  CardType,
  Car,
  PageModule,
} from './modules'

export { HERO_PROJECTION, CAR_LABEL_PROJECTION } from './modules'

export interface HomepageData {
  modules: import('./modules').PageModule[]
}

export const HOMEPAGE_QUERY = `*[_type == "homepage"][0]{ ${MODULES_PROJECTION} }`
