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

export const LEGAL_PAGE_QUERY = `*[_type == "legalPage" && (slug.current == $uid || slugEn.current == $uid)][0]{
  ${i18n('title')},
  "slugFr": slug.current,
  "slugEn": coalesce(slugEn.current, slug.current),
  "updatedAt": _updatedAt,
  "content": coalesce(content[language == $lang][0].value, content[language == "fr"][0].value)[]{
    ...,
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
