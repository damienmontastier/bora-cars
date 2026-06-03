import type { LocaleCode } from '~/config/I18N_CONFIG'
import { defineSitemapEventHandler } from '#imports'
import { I18N_PAGES } from '~/config/I18N_CONFIG'

// hreflang IETF par locale — aligné sur `locales[].language` dans nuxt.config
// (les URLs auto-découvertes du sitemap utilisent ces mêmes tags).
const HREFLANG: Record<LocaleCode, string> = { fr: 'fr-FR', en: 'en-GB' }

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

export default defineSitemapEventHandler(async () => {
  const sanity = useSanity()

  // Locales déduites des mappings de la route (évite de réimporter LANGUAGES).
  const locales = Object.keys(I18N_PAGES['car-uid'] ?? {}) as LocaleCode[]

  try {
    const cars = await sanity.fetch<{ slug: string | null }[]>(
      `*[_type == "car" && defined(slug.current)]{"slug": slug.current}`,
    )

    return cars.flatMap(({ slug }) => {
      if (!slug)
        return []

      // hreflang : chaque version locale pointe vers les autres (+ x-default → fr).
      const alternatives = locales
        .map(locale => ({ hreflang: HREFLANG[locale], href: localizedLoc('car-uid', locale, { uid: slug }) }))
        .filter((alt): alt is { hreflang: string, href: string } => alt.href !== null)

      const xDefault = localizedLoc('car-uid', 'fr', { uid: slug })
      if (xDefault)
        alternatives.push({ hreflang: 'x-default', href: xDefault })

      return locales
        .map(locale => ({ loc: localizedLoc('car-uid', locale, { uid: slug }), alternatives }))
        .filter((entry): entry is { loc: string, alternatives: typeof alternatives } => entry.loc !== null)
    })
  }
  catch {
    return []
  }
})
