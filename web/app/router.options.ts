import type { RouterConfig } from '@nuxt/schema'

// Fonction utilitaire pour calculer le décalage du scroll si vous avez un header fixe
// ou si l'élément a du scroll-margin-top CSS
function getHashElementScrollMarginTop(selector: string): number {
  try {
    const elem = document.querySelector(selector)
    if (elem) {
      const style = getComputedStyle(elem)
      const docStyle = getComputedStyle(document.documentElement)
      return (Number.parseFloat(style.scrollMarginTop) || 0) + (Number.parseFloat(docStyle.scrollPaddingTop) || 0)
    }
  }
  catch {
    // ignore errors
  }
  return 0
}

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    const nuxtApp = useNuxtApp()

    const lenis = (window as any).lenis

    if (to.path === from.path) {
      // 1. Gestion des ancres (#)
      if (to.hash) {
        if (lenis) {
          lenis.scrollTo(to.hash, {
            offset: -getHashElementScrollMarginTop(to.hash),
          })
          return false
        }
        return {
          el: to.hash,
          top: getHashElementScrollMarginTop(to.hash),
          behavior: 'smooth',
        }
      }

      // Changement de query uniquement (sort, filtres…) → ne pas scroller
      // Pour réactiver le scroll-to-top sur ces navigations, supprimer ce bloc :
      const onlyQueryChanged = !to.hash && JSON.stringify(to.query) !== JSON.stringify(from.query)
      if (onlyQueryChanged)
        return false

      if (lenis) {
        lenis.scrollTo(0, {
          force: true,
          lock: true,
        })
        return false
      }

      return { top: 0, behavior: 'smooth' }
    }

    // 2. Changement de page sans ancre → scroll géré par onBeforeEnter dans app.vue
    if (!to.hash)
      return false

    // 3. Ancre sur une autre page → attendre que la nouvelle page soit montée
    return new Promise((resolve) => {
      nuxtApp.hooks.hookOnce('page:transition:finish', async () => {
        await new Promise(r => setTimeout(r, 0))

        if (lenis) {
          lenis.scrollTo(to.hash, { offset: -getHashElementScrollMarginTop(to.hash), force: true })
          resolve(false)
        }
        else {
          resolve({
            el: to.hash,
            top: getHashElementScrollMarginTop(to.hash),
            behavior: 'smooth',
          })
        }
      })
    })
  },
}
