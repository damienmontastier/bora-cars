/**
 * Retire du sitemap les URLs légales « jumelles naïves » générées par nuxt-sitemap.
 *
 * ── Le bug ──
 * L'intégration i18n de `@nuxtjs/sitemap` traduit chaque page localisée découverte
 * (préfixe de locale + template d'URL via `pages`/`I18N_PAGES`) MAIS ne sait pas
 * traduire la VALEUR d'un segment dynamique. Or la route légale a le MÊME template
 * dans les deux langues (`/legal/[slug]`) et un slug DIFFÉRENT par locale (`slugEn`).
 * Le module réinjecte donc le slug tel quel dans les deux préfixes → des URLs
 * fantômes qui doublonnent le vrai contenu :
 *   - `/fr/legal/legal-notice`      (slug EN sous le préfixe FR)
 *   - `/en/legal/mentions-legales`  (slug FR sous le préfixe EN)  … etc.
 * Chacune renvoie 200 self-canonical → « Page en double, canonique choisie ≠
 * déclarée » dans la Search Console. (Les VOITURES échappent au bug : leur template
 * d'URL DIFFÈRE par locale — `/voiture/` vs `/car/` — donc la traduction du template
 * suffit et le slug identique tombe juste.)
 *
 * ── Le correctif ──
 * La source autoritaire `/api/__sitemap__/urls` (cf. `server/api/__sitemap__/urls.ts`
 * + `queries/legal`) émet DÉJÀ les bonnes entrées légales, une par locale, avec les
 * bons `hreflang`. Ce hook ne fait que SUPPRIMER les jumelles : on reconstruit
 * l'ensemble des couples (locale, slug) légitimes depuis Sanity, puis on retire toute
 * `/xx/legal/<slug>` hors de cet ensemble. Robuste même si un slug EN est identique au
 * slug FR (l'entrée légitime unique est alors dédupliquée en amont, donc conservée).
 *
 * S'exécute dans la fonction sitemap CACHÉE (≈10 min) → au plus un aller-retour Sanity
 * par (re)génération. En cas d'échec réseau, on NE filtre pas (mieux vaut un sitemap
 * avec jumelles qu'un sitemap amputé de ses vraies pages légales).
 */
interface SitemapResolvedCtx { urls: { loc?: string }[] }

export default defineNitroPlugin((nitroApp) => {
  // `sitemap:resolved` est bien émis par @nuxtjs/sitemap (cf. dist/runtime/server/
  // sitemap/nitro.js) mais absent de l'union typée `NitroRuntimeHooks` → on type le
  // ctx nous-mêmes et on tolère la clé inconnue.
  // @ts-expect-error — hook @nuxtjs/sitemap non déclaré dans les types Nitro.
  nitroApp.hooks.hook('sitemap:resolved', async (ctx: SitemapResolvedCtx) => {
    const legalRe = /\/(fr|en)\/legal\/([^/?#]+)/
    if (!ctx.urls.some(u => typeof u.loc === 'string' && legalRe.test(u.loc)))
      return

    let pages: { slugFr: string | null, slugEn: string | null }[]
    try {
      pages = await useSanity().fetch(
        `*[_type == "legalPage" && defined(slug.current)]{
          "slugFr": slug.current,
          "slugEn": coalesce(slugEn.current, slug.current)
        }`,
      )
    }
    catch {
      return
    }

    const validFr = new Set(pages.map(p => p.slugFr).filter((s): s is string => !!s))
    const validEn = new Set(pages.map(p => p.slugEn).filter((s): s is string => !!s))

    ctx.urls = ctx.urls.filter((u) => {
      const match = typeof u.loc === 'string' ? u.loc.match(legalRe) : null
      if (!match)
        return true
      const [, locale, slug] = match
      if (!slug)
        return true
      return locale === 'fr' ? validFr.has(slug) : validEn.has(slug)
    })
  })
})
