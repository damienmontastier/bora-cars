import { i18n } from './i18n'

export interface InternalLinkRef {
  _id?: string
  _type?: string
  slug?: string
}

export interface SeoData {
  title?: string
  description?: string
  image?: string
  imageHotspot?: SanityImage['imageHotspot']
  imageCrop?: SanityImage['imageCrop']
}

export interface SanityImage {
  imageUrl: string
  imageAlt?: string
  imageHotspot?: { x: number, y: number, width: number, height: number }
  imageCrop?: { top: number, bottom: number, left: number, right: number }
}

export function imageFields(field = 'image') {
  return `
    "imageUrl": ${field}.asset._ref,
    ${i18n(`${field}.alt`, 'imageAlt')},
    "imageHotspot": ${field}.hotspot,
    "imageCrop": ${field}.crop
  `
}

export function imageMemberFields() {
  return `
    "imageUrl": asset._ref,
    ${i18n('alt', 'imageAlt')},
    "imageHotspot": hotspot,
    "imageCrop": crop
  `
}

export function imageRef(field = 'image') {
  return `"imageUrl": ${field}.asset._ref`
}

export function seoFields() {
  return `
    "seo": {
      ${i18n('seo.title', 'title')},
      ${i18n('seo.description', 'description')},
      "image": seo.image.asset->url
    }
  `
}
