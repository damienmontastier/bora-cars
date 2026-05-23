import { useEventBus } from '@vueuse/core'
import gsap from 'gsap'

export function useMenuCtaSnap() {
  const heroCTABus = useEventBus('hero-cta')

  onMounted(() => {
    const menuCtaEl = document.querySelector<HTMLElement>('.app-menu__cta')
    if (!menuCtaEl)
      return
    gsap.set(menuCtaEl, { clearProps: 'display,opacity,visibility,clipPath' })
    heroCTABus.emit('enter:snap')
    gsap.set(menuCtaEl, { opacity: 1 })
  })
}
