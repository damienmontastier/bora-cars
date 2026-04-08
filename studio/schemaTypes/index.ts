import type { SchemaTypeDefinition } from 'sanity'

// Singletons
import { homepageType } from './singletons/homepage'
import { footerType } from './singletons/footer'
import { menuType } from './singletons/menu'
import { proprietaireType } from './singletons/proprietaire'
import { settingsType } from './singletons/settings'

// Documents
import { locationType } from './documents/location'

// Modules — Home
import { heroType } from './modules/home/hero'
import { serviceCardsType } from './modules/home/serviceCards'
import { pitchType } from './modules/home/pitch'
import { processType } from './modules/home/process'
import { brandsSectionType } from './modules/home/brandsSection'
import { servicePitchType } from './modules/home/servicePitch'

// Objects
import { customImage } from './objects/customImage'
import { customMedia } from './objects/customMedia'
import { customLink } from './objects/customLink'

export const schemaTypes: SchemaTypeDefinition[] = [
  // Singletons
  homepageType,
  footerType,
  menuType,
  proprietaireType,
  settingsType,

  // Documents
  locationType,

  // Modules — Home
  heroType,
  serviceCardsType,
  pitchType,
  processType,
  brandsSectionType,
  servicePitchType,

  // Objects
  customImage,
  customMedia,
  customLink,
]
