// ─── Types ────────────────────────────────────────────────────────────────────

export interface SanityImage {
  imageUrl: string
  imageAlt?: string
  imageHotspot?: { x: number, y: number, width: number, height: number }
  imageCrop?: { top: number, bottom: number, left: number, right: number }
}

// ─── GROQ fragments ───────────────────────────────────────────────────────────

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
    "imageAlt": ${field}.alt,
    "imageHotspot": ${field}.hotspot,
    "imageCrop": ${field}.crop
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
