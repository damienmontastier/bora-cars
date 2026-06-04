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
}

export interface SanityImage {
  imageUrl: string
  imageAlt?: string
  imageHotspot?: { x: number, y: number, width: number, height: number }
  imageCrop?: { top: number, bottom: number, left: number, right: number }
}

/**
 * Full image fragment (asset ref + alt + hotspot + crop), injected flat on the parent object.
 *
 * @param field - Sanity image field name (default: 'image')
 *
 * @example
 * // Inside a projection:
 * media { mediaType, ${imageFields()} }
 * // → { mediaType, imageUrl, imageAlt, imageHotspot, imageCrop }
 *
 * // With a custom field name:
 * car { ${imageFields('thumbnail')} }
 * // → { imageUrl, imageAlt, imageHotspot, imageCrop }
 */
export function imageFields(field = 'image') {
  return `
    "imageUrl": ${field}.asset._ref,
    ${i18n(`${field}.alt`, 'imageAlt')},
    "imageHotspot": ${field}.hotspot,
    "imageCrop": ${field}.crop
  `
}

/**
 * Image fragment for when the current projection scope IS the image itself —
 * e.g. members of an `array of customImage`, where `asset`/`hotspot`/`crop`/`alt`
 * live directly on the item (no wrapping field).
 *
 * @example
 * "images": images[] { ${imageMemberFields()} }
 * // → [{ imageUrl, imageAlt, imageHotspot, imageCrop }]
 */
export function imageMemberFields() {
  return `
    "imageUrl": asset._ref,
    ${i18n('alt', 'imageAlt')},
    "imageHotspot": hotspot,
    "imageCrop": crop
  `
}

/**
 * Minimal image fragment (asset ref only).
 *
 * @param field - Sanity image field name (default: 'image')
 *
 * @example
 * car { _id, marque, ${imageRef()} }
 * // → { _id, marque, imageUrl }
 */
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
