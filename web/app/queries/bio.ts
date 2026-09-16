import type { CatalogueCar } from './catalogue'
import type { SeoData } from './fragments'
import { CAR_PROJECTION } from './catalogue'
import { seoFields } from './fragments'
import { i18n } from './i18n'

export interface BioData {
  /**
   * Peut contenir des `null` : une référence vers une voiture supprimée ou
   * repassée en brouillon ne résout rien sous la perspective `published`.
   * Toujours filtrer avant rendu (cf. `pages/bio.vue`).
   */
  cars?: (CatalogueCar | null)[]
  /** Gabarit du message WhatsApp de chaque story (jetons `{marque}`, `{modele}`…). */
  whatsappMessage?: string
  seo?: SeoData
}

/**
 * Page « link in bio » (/bio) — singleton `bio`, maquette « piste C · Stories ».
 *
 * `cars[]->` déréférence SANS réordonner : l'ordre du tableau Sanity (rangé à la
 * main dans le Studio) est l'ordre d'affichage. C'est toute la différence avec le
 * catalogue, trié par `_createdAt`. Les textes fixes (titre, boutons, fin de liste)
 * viennent du glossaire (namespace `bio`).
 */
export const BIO_QUERY = `*[_type == "bio"][0]{
  "cars": cars[]-> ${CAR_PROJECTION},
  ${i18n('whatsappMessage')},
  ${seoFields()}
}`
