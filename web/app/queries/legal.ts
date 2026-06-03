import type { SeoData } from './fragments'
import { seoFields } from './fragments'
import { i18n, internalLinkSlug } from './i18n'

export interface LegalPageData {
  title: string | null
  slugFr: string | null
  slugEn: string | null
  updatedAt: string | null
  content: any[] | null
  seo?: SeoData
}

// Match l'URL par slug FR OU slug EN — robuste quelle que soit la locale d'entrée
// (un lien EN arrive avec le slug EN). On renvoie les DEUX slugs : la page les
// passe à `useSetI18nParams` pour que le switcher de langue + les `hreflang`
// pointent vers la bonne URL localisée. `slugEn` retombe sur le slug FR si vide.
export const LEGAL_PAGE_QUERY = `*[_type == "legalPage" && (slug.current == $uid || slugEn.current == $uid)][0]{
  ${i18n('title')},
  "slugFr": slug.current,
  "slugEn": coalesce(slugEn.current, slug.current),
  "updatedAt": _updatedAt,
  "content": coalesce(content[language == $lang][0].value, content[language == "fr"][0].value)[]{
    ...,
    // Les annotations « link » (plugin link-field) portent une réf interne non
    // résolue → on la déréférence + slug localisé pour que BaseLink construise
    // la bonne URL (cf. internalLinkSlug). Les liens externes/email/tél passent
    // tels quels via le spread.
    markDefs[]{
      ...,
      _type == "link" => {
        "internalLink": internalLink->{ "_id": _id, "_type": _type, ${internalLinkSlug} }
      }
    }
  },
  ${seoFields()}
}`

export const LEGAL_PAGE_SLUGS_QUERY = `*[_type == "legalPage" && defined(slug.current)]{
  "slugFr": slug.current,
  "slugEn": coalesce(slugEn.current, slug.current)
}`
