import type { LocaleCode } from '~/config/I18N_CONFIG'
import { defineSitemapEventHandler } from '#imports'
import { I18N_PAGES, SANITY_ROUTES } from '~/config/I18N_CONFIG'

const HREFLANG: Record<LocaleCode, string> = { fr: 'fr-FR', en: 'en-GB' }

interface SitemapAlt { hreflang: string, href: string }
interface SitemapEntry { loc: string, lastmod: string | undefined, alternatives?: SitemapAlt[] }

function localizedLoc(routeName: string, locale: LocaleCode, params: Record<string, string>) {
  if (routeName === 'index')
    return `/${locale}`
  const template = I18N_PAGES[routeName]?.[locale]
  if (typeof template !== 'string')
    return null
  let path: string = template
  for (const [key, value] of Object.entries(params))
    path = path.replace(`[${key}]`, value)
  return `/${locale}${path}`
}

function localizedEntries(
  routeName: string,
  locales: LocaleCode[],
  lastmod: string | undefined,
  paramsFor: (locale: LocaleCode) => Record<string, string>,
): SitemapEntry[] {
  const alternatives: SitemapAlt[] = locales
    .map(locale => ({ hreflang: HREFLANG[locale], href: localizedLoc(routeName, locale, paramsFor(locale)) }))
    .filter((alt): alt is SitemapAlt => alt.href !== null)

  const xDefault = localizedLoc(routeName, 'fr', paramsFor('fr'))
  if (xDefault)
    alternatives.push({ hreflang: 'x-default', href: xDefault })

  return locales
    .map(locale => ({ loc: localizedLoc(routeName, locale, paramsFor(locale)), lastmod, alternatives }))
    .filter((entry): entry is SitemapEntry => entry.loc !== null)
}

const STATIC_PAGES = Object.entries(SANITY_ROUTES)
  .filter(([, route]) => !route.param)
  .map(([type, route]) => ({ type, route: route.name }))

const ALL_LOCALES = Object.keys(I18N_PAGES.proprietaire ?? {}) as LocaleCode[]

export default defineSitemapEventHandler(async () => {
  const sanity = useSanity()

  const carLocales = Object.keys(I18N_PAGES['car-uid'] ?? {}) as LocaleCode[]
  const legalLocales = Object.keys(I18N_PAGES['legal-slug'] ?? {}) as LocaleCode[]

  try {
    const [cars, legalPages, lastmodByType] = await Promise.all([
      sanity.fetch<{ slug: string | null, lastmod: string | null }[]>(
        `*[_type == "car" && defined(slug.current)]{"slug": slug.current, "lastmod": _updatedAt}`,
      ),
      sanity.fetch<{ slugFr: string | null, slugEn: string | null, lastmod: string | null }[]>(
        `*[_type == "legalPage" && defined(slug.current)]{"slugFr": slug.current, "slugEn": coalesce(slugEn.current, slug.current), "lastmod": _updatedAt}`,
      ),
      sanity.fetch<Record<string, string | null>>(
        `{ ${STATIC_PAGES.map(p => `"${p.type}": *[_type == "${p.type}"][0]._updatedAt`).join(', ')} }`,
      ),
    ])

    const staticEntries = STATIC_PAGES.flatMap(({ type, route }) => {
      const lastmod = lastmodByType?.[type]
      if (!lastmod)
        return []
      return ALL_LOCALES
        .map(locale => ({ loc: localizedLoc(route, locale, {}), lastmod }))
        .filter((entry): entry is SitemapEntry => entry.loc !== null)
    })

    const carEntries = cars.flatMap(({ slug, lastmod }) =>
      slug ? localizedEntries('car-uid', carLocales, lastmod ?? undefined, () => ({ uid: slug })) : [],
    )

    const legalEntries = legalPages.flatMap(({ slugFr, slugEn, lastmod }) => {
      if (!slugFr)
        return []
      const byLocale: Record<LocaleCode, string> = { fr: slugFr, en: slugEn ?? slugFr }
      return localizedEntries('legal-slug', legalLocales, lastmod ?? undefined, locale => ({ slug: byLocale[locale] }))
    })

    return [...staticEntries, ...carEntries, ...legalEntries]
  }
  catch {
    return []
  }
})
