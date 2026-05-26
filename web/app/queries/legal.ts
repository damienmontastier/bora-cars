import type { SeoData } from './fragments'
import { seoFields } from './fragments'
import { i18n, i18nBlock } from './i18n'

export interface LegalPageData {
  title: string | null
  slug: string | null
  updatedAt: string | null
  content: any[] | null
  seo?: SeoData
}

export const LEGAL_PAGE_QUERY = `*[_type == "legalPage" && slug.current == $uid][0]{
  ${i18n('title')},
  "slug": slug.current,
  "updatedAt": _updatedAt,
  ${i18nBlock('content')},
  ${seoFields()}
}`

export const LEGAL_PAGE_SLUGS_QUERY = `*[_type == "legalPage" && defined(slug.current)]{
  "slug": slug.current
}`
