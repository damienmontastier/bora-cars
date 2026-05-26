// GTM auto pageview tracking.
// `useScriptEventPage` fires on route change AFTER Nuxt updates the document title,
// so we get the right title for SPA navigations (which Enhanced Measurement often misses).
// Skipped entirely when no GTM_ID is registered (e.g. local dev without .env).
export default defineNuxtPlugin({
  name: 'gtm-pageview',
  setup() {
    let gtm: ReturnType<typeof useScriptGoogleTagManager> | undefined
    try {
      gtm = useScriptGoogleTagManager()
    }
    catch {
      return
    }
    if (!gtm)
      return

    const { proxy } = gtm

    useScriptEventPage(({ title, path }) => {
      // GA4 canonical event + parameters so the standard dashboards & reports work out of the box.
      proxy.dataLayer.push({
        event: 'page_view',
        page_title: title,
        page_location: typeof window !== 'undefined' ? window.location.href : path,
        page_path: path,
      })
    })
  },
})
