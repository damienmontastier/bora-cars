import type { CatalogueCar } from './catalogue'
import type { SeoData } from './fragments'
import type { SanityLink } from './modules'
import { CAR_PROJECTION } from './catalogue'
import { seoFields } from './fragments'
import { i18n, internalLinkSlug } from './i18n'

export interface BioData {
  title?: string
  description?: string
  quickLinks?: SanityLink[]
  /**
   * Peut contenir des `null` : une référence vers une voiture supprimée ou
   * repassée en brouillon ne résout rien sous la perspective `published`.
   * Toujours filtrer avant rendu (cf. `pages/bio.vue`).
   */
  cars?: (CatalogueCar | null)[]
  whatsappMessage?: string
  seo?: SeoData
}

const linkProjection = `{
  "_key": _key,
  ${i18n('label', 'text')},
  "type": link.type,
  "blank": link.blank,
  "url": link.url,
  "email": link.email,
  "phone": link.phone,
  "internalLink": link.internalLink->{ "_id": _id, "_type": _type, ${internalLinkSlug} }
}`

/**
 * Page « link in bio » (/bio) — singleton `bio`.
 *
 * `cars[]->` déréférence SANS réordonner : l'ordre du tableau Sanity (rangé à la
 * main dans le Studio) est l'ordre d'affichage. C'est toute la différence avec le
 * catalogue, trié par `_createdAt`.
 */
export const BIO_QUERY = `*[_type == "bio"][0]{
  ${i18n('title')},
  ${i18n('description')},
  "quickLinks": quickLinks[]${linkProjection},
  "cars": cars[]-> ${CAR_PROJECTION},
  ${i18n('whatsappMessage')},
  ${seoFields()}
}`
