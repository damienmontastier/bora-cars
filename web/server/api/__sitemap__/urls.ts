import type { LocaleCode } from '~/config/I18N_CONFIG'
import { defineSitemapEventHandler } from '#imports'
import { I18N_PAGES } from '~/config/I18N_CONFIG'

// hreflang IETF par locale — aligné sur `locales[].language` dans nuxt.config
// (les URLs auto-découvertes du sitemap utilisent ces mêmes tags).
const HREFLANG: Record<LocaleCode, string> = { fr: 'fr-FR', en: 'en-GB' }

interface SitemapAlt { hreflang: string, href: string }
interface SitemapEntry { loc: string, lastmod: string | undefined, alternatives: SitemapAlt[] }

// Construit le `loc` localisé pour une route nommée + params dynamiques.
// On NE peut PAS utiliser `_i18nTransform` ici : il reconstruit l'URL via
// findPageMapping (match par préfixe statique), ce qui échoue pour une route
// dynamique à chemin traduit (`car-uid` → /voiture/[uid] en fr, /car/[uid] en
// en) → il retomberait sur /fr/car/<slug> (cassé). On résout donc le chemin
// depuis I18N_PAGES (source de vérité) et on préfixe la locale (strategy: 'prefix').
function localizedLoc(routeName: string, locale: LocaleCode, params: Record<string, string>) {
  let path = I18N_PAGES[routeName]?.[locale]
  if (typeof path !== 'string')
    return null
  for (const [key, value] of Object.entries(params))
    path = path.replace(`[${key}]`, value)
  return `/${locale}${path}`
}

// Entrées localisées d'une route dynamique : une `loc` par locale + le bloc
// `alternatives` (hreflang croisés + x-default → fr). `paramsFor` peut renvoyer
// un slug DIFFÉRENT par locale — c'est le cas des pages légales (slug FR vs slug
// EN traduit) ; pour les voitures le slug est identique dans les deux langues.
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

export default defineSitemapEventHandler(async () => {
  const sanity = useSanity()

  // Locales déduites des mappings de la route (évite de réimporter LANGUAGES).
  const carLocales = Object.keys(I18N_PAGES['car-uid'] ?? {}) as LocaleCode[]
  const legalLocales = Object.keys(I18N_PAGES['legal-slug'] ?? {}) as LocaleCode[]

  try {
    const [cars, legalPages] = await Promise.all([
      sanity.fetch<{ slug: string | null, lastmod: string | null }[]>(
        `*[_type == "car" && defined(slug.current)]{"slug": slug.current, "lastmod": _updatedAt}`,
      ),
      // slugEn retombe sur le slug FR si l'override anglais n'est pas renseigné.
      sanity.fetch<{ slugFr: string | null, slugEn: string | null, lastmod: string | null }[]>(
        `*[_type == "legalPage" && defined(slug.current)]{"slugFr": slug.current, "slugEn": coalesce(slugEn.current, slug.current), "lastmod": _updatedAt}`,
      ),
    ])

    // `lastmod` = date de dernière modif Sanity → signal de fraîcheur pour les crawlers.
    const carEntries = cars.flatMap(({ slug, lastmod }) =>
      slug ? localizedEntries('car-uid', carLocales, lastmod ?? undefined, () => ({ uid: slug })) : [],
    )

    const legalEntries = legalPages.flatMap(({ slugFr, slugEn, lastmod }) => {
      if (!slugFr)
        return []
      const byLocale: Record<LocaleCode, string> = { fr: slugFr, en: slugEn ?? slugFr }
      return localizedEntries('legal-slug', legalLocales, lastmod ?? undefined, locale => ({ slug: byLocale[locale] }))
    })

    return [...carEntries, ...legalEntries]
  }
  catch {
    return []
  }
})
