import type { SchemaTypeDefinition } from 'sanity'

// Singletons
import { homepageType } from './singletons/homepage'
import { footerType } from './singletons/footer'
import { menuType } from './singletons/menu'
import { proprietaireType } from './singletons/proprietaire'
import { professionnelType } from './singletons/professionnel'
import { settingsType } from './singletons/settings'

// Documents
import { locationType } from './documents/location'
import { carType } from './documents/car'

// Modules — Home
import { heroType } from './modules/home/hero'
import { serviceCardsType } from './modules/home/serviceCards'
import { pitchType } from './modules/home/pitch'
import { processType } from './modules/home/process'
import { brandsSectionType } from './modules/home/brandsSection'
import { servicePitchType } from './modules/home/servicePitch'
import { cardsColumnType } from './modules/home/cardsColumn'
import { testimonialsType } from './modules/home/testimonials'
import { titleType } from './modules/shared/title'
import { textType } from './modules/shared/text'
import { faqType } from './modules/shared/faq'

// Objects
import { customImage } from './objects/customImage'
import { customVideo } from './objects/customVideo'
import { customMedia } from './objects/customMedia'
import { customLink } from './objects/customLink'
import { processStepType } from './objects/processStep'

export const schemaTypes: SchemaTypeDefinition[] = [
  // Singletons
  homepageType,
  footerType,
  menuType,
  proprietaireType,
  professionnelType,
  settingsType,

  // Documents
  locationType,
  carType,

  // Modules — Home
  heroType,
  serviceCardsType,
  pitchType,
  processType,
  brandsSectionType,
  servicePitchType,
  cardsColumnType,
  testimonialsType,
  titleType,
  textType,
  faqType,

  // Objects
  customImage,
  customVideo,
  customMedia,
  customLink,
  processStepType,
]
