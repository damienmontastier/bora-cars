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
      proxy.dataLayer.push({
        event: 'page_view',
        page_title: title,
        page_location: typeof window !== 'undefined' ? window.location.href : path,
        page_path: path,
      })
    })
  },
})
