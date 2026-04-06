import type { SchemaTypeDefinition } from 'sanity'

// Singletons
import { homepageType } from './singletons/homepage'

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

export const schemaTypes: SchemaTypeDefinition[] = [
  // Singletons
  homepageType,

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
]
