interface SitemapResolvedCtx { urls: { loc?: string }[] }

export default defineNitroPlugin((nitroApp) => {
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
