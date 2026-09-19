import type { RouterConfig } from '@nuxt/schema'
import { useEventBus } from '@vueuse/core'

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
  }
  return 0
}

export default <RouterConfig>{
  scrollBehavior(to, from, _savedPosition) {
    const appStore = useAppStore()

    if (appStore.menuOpen) {
      appStore.menuOpen = false
      ;(window as any).lenis?.start()
    }

    if (to.path === from.path) {
      const lenis = (window as any).lenis

      if (to.hash) {
        if (lenis) {
          lenis.scrollTo(to.hash, { offset: -getHashElementScrollMarginTop(to.hash) })
          return false
        }
        return { el: to.hash, top: getHashElementScrollMarginTop(to.hash), behavior: 'smooth' }
      }

      if (JSON.stringify(to.query) !== JSON.stringify(from.query))
        return false

      if (lenis) {
        if (lenis.scroll > 0)
          lenis.scrollTo(0, { force: true, lock: true })
        return false
      }
      return { top: 0, behavior: 'smooth' }
    }

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

    if (!to.hash)
      return false

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
