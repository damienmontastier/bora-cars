export default () => {
  return 'Hello Util'
}
export function lerp(p1, p2, t) {
  return p1 + (p2 - p1) * t
}

export function modulo(n, d) {
  if (d === 0)
    return n
  if (d < 0)
    return Number.NaN
  return ((n % d) + d) % d
}

export function truncate(value, decimals) {
  return Number.parseFloat(value.toFixed(decimals))
}

export function isValidEmail(email) {
  const re = /^(?:[^<>()[\]\\.,;:\s@"]+(?:\.[^<>()[\]\\.,;:\s@"]+)*|".+")@(?:\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\]|(?:[a-z\-0-9]+\.)+[a-z]{2,})$/i
  return re.test(String(email).toLowerCase())
}

export function isValidURL(string) {
  let url

  try {
    url = new URL(string)
  }
  catch {
    return false
  }

  // Première vérification avec URL constructor
  const validProtocol = url.protocol === 'http:' || url.protocol === 'https:'

  // Seconde vérification avec une expression régulière
  const pattern = new RegExp('^(?:https?:\\/\\/)?' // protocol
    + '(?:(?:[a-z\\d](?:[a-z\\d-]{0,61}[a-z\\d])?\\.)+[a-z]{2,}|(?:\\d{1,3}\\.){3}\\d{1,3})' // domaine ou IPv4
    + '(?::\\d+)?(?:\\/[-\\w%.~+]*)*' // port et chemin
    + '(?:\\?[;&\\w%.~+=-]*)?' // query string
    + '(?:#[-\\w]*)?$', 'i') // fragment
  const validPattern = pattern.test(string)

  return validProtocol && validPattern
}

export function isValidPhoneNumber(phoneNumber) {
  const regex = /^tel:\+?\(?\d{3}\)?[-\s.]?\d{3}[-\s.]?\d{4,6}$/im
  return regex.test(phoneNumber)
}

export function extractPhoneNumber(inputString) {
  const regex = /(\+\d{1,4})?(\(\d{2,4}\))?[\s.-]?\d{3}[\s.-]?\d{4}/g
  const matches = inputString.match(regex)
  return matches ? matches[0] : null
}

export function isObject(obj) {
  return (
    typeof obj === 'object'
    && obj !== null
    && !Array.isArray(obj)
  )
}

export function isString(args) {
  return typeof args === 'string'
}

export function isObjectEmpty(objectName) {
  return Object.keys(objectName).length === 0
}

export function imageIsCached(src) {
  const image = new Image()
  image.src = src

  return image.complete
}
export function toKebabCase(string) {
  return string
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove invalid characters
    .replace(/-{2,}/g, '-') // Replace multiple hyphens with a single one
    .replace(/^-|-$/g, '') // Remove leading or trailing hyphens
}

export function camelCase(str) {
  // Using replace method with regEx
  return str.replace(/^\w|[A-Z]|\b\w/g, (word, index) => {
    return index === 0 ? word.toLowerCase() : word.toUpperCase()
  }).replace(/\s+/g, '')
}

export function pascalCase(str) {
  return str
    .replace(/\s(.)/g, (_, group1) => group1.toUpperCase()) // Majuscule après un espace
    .replace(/^\w/, c => c.toUpperCase()) // Majuscule initiale
    .replace(/\s+/g, '') // Retire tous les espaces
}

export function formatDateByLocale(locale, d) {
  return new Date(d).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getFileNameFromURL(url) {
  const fileNameWithExtension = url.substring(url.lastIndexOf('/') + 1)

  const fileName = fileNameWithExtension.split('.')[0]

  return fileName
}

export function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function offsetLeft(element, accumulator = 0) {
  const left = accumulator + element.offsetLeft
  if (element.offsetParent)
    return offsetLeft(element.offsetParent, left)

  return left
}

export function getRandomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Convert a Sanity CDN image URL to an asset ID for @nuxt/image sanity provider.
 * e.g. https://cdn.sanity.io/images/proj/dataset/abc123-700x700.jpg → image-abc123-700x700-jpg
 */
export function sanityUrlToAssetId(url: string): string | null {
  if (!url?.includes('cdn.sanity.io')) return null
  const match = url.match(/\/([a-f0-9]+-\d+x\d+\.\w+)(?:\?.*)?$/)
  if (!match) return null
  return `image-${match[1].replace(/\.(\w+)$/, '-$1')}`
}

export function objectToUID(obj) {
  // Helper function to generate a hash from a string
  function generateHash(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char // Simple hash function
      hash |= 0 // Convert to 32-bit integer
    }
    return hash.toString(36) // Convert hash to base-36 for shorter UID
  }

  // Convert the object to a string
  const objString = JSON.stringify(obj, Object.keys(obj).sort())

  // Generate and return the hash as UID
  return generateHash(objString)
}
