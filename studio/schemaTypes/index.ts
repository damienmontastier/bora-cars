import type { SchemaTypeDefinition } from 'sanity'

import { homepageType } from './singletons/homepage'
import { footerType } from './singletons/footer'
import { menuType } from './singletons/menu'
import { proprietaireType } from './singletons/proprietaire'
import { professionnelType } from './singletons/professionnel'
import { contactType } from './singletons/contact'
import { settingsType } from './singletons/settings'
import { catalogueType } from './singletons/catalogue'
import { catalogueProfessionnelType } from './singletons/catalogueProfessionnel'
import { carPageType } from './singletons/carPage'
import { glossaireType } from './singletons/glossaire'
import { bioType } from './singletons/bio'

import { locationType } from './documents/location'
import { carType } from './documents/car'
import { legalPageType } from './documents/legalPage'

import { heroType } from './modules/home/hero'
import { serviceCardsType } from './modules/home/serviceCards'
import { pitchType } from './modules/home/pitch'
import { processType } from './modules/home/process'
import { brandsSectionType } from './modules/home/brandsSection'
import { cardsColumnType } from './modules/home/cardsColumn'
import { testimonialsType } from './modules/home/testimonials'
import { fullscreenMarqueeType } from './modules/home/fullscreenMarquee'
import { titleType } from './modules/shared/title'
import { textType } from './modules/shared/text'
import { faqType } from './modules/shared/faq'

import { customImage } from './objects/customImage'
import { customVideo } from './objects/customVideo'
import { customMedia } from './objects/customMedia'
import { customLink } from './objects/customLink'
import { navLink } from './objects/navLink'
import { processStepType } from './objects/processStep'
import { specsLayoutType } from './objects/specsLayout'
import { glossaryEntry } from './objects/glossaryEntry'

export const schemaTypes: SchemaTypeDefinition[] = [
  homepageType,
  footerType,
  menuType,
  proprietaireType,
  professionnelType,
  contactType,
  settingsType,
  catalogueType,
  catalogueProfessionnelType,
  carPageType,
  glossaireType,
  bioType,

  locationType,
  carType,
  legalPageType,

  heroType,
  serviceCardsType,
  pitchType,
  processType,
  brandsSectionType,
  cardsColumnType,
  testimonialsType,
  fullscreenMarqueeType,
  titleType,
  textType,
  faqType,

  customImage,
  customVideo,
  customMedia,
  customLink,
  navLink,
  processStepType,
  specsLayoutType,
  glossaryEntry,
]
