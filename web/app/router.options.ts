import type { RouterConfig } from '@nuxt/schema'
import { useEventBus } from '@vueuse/core'

// Décalage du scroll pour les ancres (header fixe / scroll-margin-top CSS).
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
    // ignore
  }
  return 0
}

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    const appStore = useAppStore()

    // Menu ouvert → on le ferme et on relâche le scroll au moindre changement de route.
    if (appStore.menuOpen) {
      appStore.menuOpen = false
      ;(window as any).lenis?.start()
    }

    // ───────────────────────────── Même page ─────────────────────────────
    if (to.path === from.path) {
      const lenis = (window as any).lenis

      // 1. Ancre (#)
      if (to.hash) {
        if (lenis) {
          lenis.scrollTo(to.hash, { offset: -getHashElementScrollMarginTop(to.hash) })
          return false
        }
        return { el: to.hash, top: getHashElementScrollMarginTop(to.hash), behavior: 'smooth' }
      }

      // 2. Changement de query uniquement (tri, filtres…) → ne pas scroller.
      if (JSON.stringify(to.query) !== JSON.stringify(from.query))
        return false

      // 3. Retour en haut.
      if (lenis) {
        if (lenis.scroll > 0)
          lenis.scrollTo(0, { force: true, lock: true })
        return false
      }
      return { top: 0, behavior: 'smooth' }
    }

    // ─────────────────────── Changement de page ───────────────────────
    // Toutes les remises à zéro / restaurations de scroll se font PENDANT que l'overlay
    // couvre l'écran. Transition.vue émet 'entering' au début de onEnter = nouvelle page
    // montée + overlay encore opaque. On scrolle là, puis l'overlay se lève sur la page
    // déjà positionnée — au lieu d'un saut visible APRÈS la transition (l'ancien
    // `page:transition:finish` se déclenchait une fois l'overlay déjà levé).
    const bus = useEventBus<string>('page-transition')

    function onceHidden(run: (resolve: (v: any) => void) => void) {
      return new Promise<any>((resolve) => {
        const off = bus.on(async (evt) => {
          if (evt !== 'entering')
            return
          off()
          await nextTick()
          run(resolve)
        })
      })
    }

    // Retour navigateur (back / forward) → on restaure la position précédente, masqué.
    // `preserveScroll` dit à Transition.onLeave de NE PAS forcer le scroll-to-top.
    if (savedPosition) {
      appStore.preserveScroll = true
      return onceHidden((resolve) => {
        appStore.preserveScroll = false
        const lenis = (window as any).lenis
        if (lenis) {
          lenis.scrollTo(savedPosition.top, { immediate: true, force: true })
          resolve(false)
        }
        else {
          resolve(savedPosition)
        }
      })
    }

    // Changement de page sans ancre → scroll-to-top géré par Transition.onLeave (masqué).
    if (!to.hash)
      return false

    // Chargement initial / refresh avec ancre : aucun onEnter ne se déclenche
    // (Transition `appear` off) → pas de 'entering'. On attend la fin du preloader
    // (lenis vient de démarrer) puis on snap sur l'ancre.
    if (!from.matched.length) {
      return new Promise<any>((resolve) => {
        const jump = () => nextTick(() => {
          const lenis = (window as any).lenis
          const margin = getHashElementScrollMarginTop(to.hash)
          if (lenis) {
            lenis.scrollTo(to.hash, { offset: -margin, immediate: true, force: true })
            resolve(false)
          }
          else {
            resolve({ el: to.hash, top: margin, behavior: 'instant' as ScrollBehavior })
          }
        })
        if (appStore.preloaderDone) {
          jump()
          return
        }
        const stop = watch(() => appStore.preloaderDone, (done) => {
          if (!done)
            return
          stop()
          jump()
        })
      })
    }

    // Nav client avec ancre sur une autre page → snap masqué sur 'entering'.
    return onceHidden((resolve) => {
      const lenis = (window as any).lenis
      const margin = getHashElementScrollMarginTop(to.hash)
      if (lenis) {
        lenis.scrollTo(to.hash, { offset: -margin, immediate: true, force: true })
        resolve(false)
      }
      else {
        resolve({ el: to.hash, top: margin, behavior: 'instant' as ScrollBehavior })
      }
    })
  },
}
