import { useMounted, usePreferredReducedMotion } from '@vueuse/core'
import gsap from 'gsap'

const CONTACT_SWITCH_MOTION = {
  leave: { duration: 0.4, stagger: 0.08, ease: 'power2.in' },
  gap: 0.05,
  enter: { duration: 0.75, stagger: 0.15, ease: 'power3.out' },
  height: { duration: 0.35, ease: 'power2.out' },
  scroll: { duration: 1.2, ease: 'power3.inOut' },
  textLeaveY: -30,
  textEnterY: 50,
  formLeaveY: -16,
  formEnterY: 32,
} as const

export function useContactSwitchMotion() {
  const { preloaderDone } = storeToRefs(useAppStore())
  const mounted = useMounted()
  const reducedMotion = usePreferredReducedMotion()

  function motionAllowed() {
    return mounted.value && preloaderDone.value && reducedMotion.value !== 'reduce'
  }

  function canAnimate(el: Element | null | undefined): el is HTMLElement {
    return !!el
      && motionAllowed()
      && el.getClientRects().length > 0
  }

  let ctx: gsap.Context | null = null
  function track<T extends () => unknown>(fn: T): ReturnType<T> {
    ctx ??= gsap.context(() => {})
    return ctx.add(fn)
  }

  onBeforeUnmount(() => {
    ctx?.revert()
    ctx = null
  })

  return { motionAllowed, canAnimate, track, motion: CONTACT_SWITCH_MOTION }
}
