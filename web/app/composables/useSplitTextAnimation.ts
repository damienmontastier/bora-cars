import type { TextAnimationStyle } from '~/config/TEXT_ANIMATION_CONFIG'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { TEXT_ANIMATION_CONFIG } from '~/config/TEXT_ANIMATION_CONFIG'

export type { TextAnimationStyle }

export interface SplitTextAnimationOptions {
  /** Named preset from TEXT_ANIMATION_CONFIG — default: 'slide-x' */
  style?: TextAnimationStyle
  /** SplitText.Vars overrides — merged on top of preset split config */
  split?: Partial<SplitText.Vars>
  /** GSAP fromTo start vars — merged on top of preset */
  from?: gsap.TweenVars
  /** GSAP fromTo end vars — merged on top of preset */
  to?: gsap.TweenVars
  /** ScrollTrigger overrides, or false to disable */
  scrollTrigger?: false | ScrollTrigger.Vars
}

function resolveTargets(instance: SplitText, type: string): Element[] {
  if (type.includes('chars'))
    return instance.chars
  if (type.includes('words'))
    return instance.words
  return instance.lines
}

export function useSplitTextAnimation(
  getEl: () => HTMLElement | null | undefined,
  options: SplitTextAnimationOptions = {},
) {
  const { fontsLoaded } = storeToRefs(useAppStore())

  let splitInstance: SplitText | null = null
  let ctx: gsap.Context | null = null

  function init() {
    const el = getEl()
    if (!el)
      return

    ctx?.revert()
    splitInstance?.revert()

    const preset = TEXT_ANIMATION_CONFIG[options.style ?? 'slide-x']

    const splitVars: SplitText.Vars = {
      autoSplit: true,
      smartWrap: true,
      charsClass: 'char',
      ...preset.split,
      ...options.split,
    }

    splitInstance = new SplitText(el, splitVars)

    const type = splitVars.type ?? 'chars'
    const targets = resolveTargets(splitInstance, type)

    preset.prepare?.(targets)

    const from: gsap.TweenVars = { ...preset.from, ...options.from }
    const to: gsap.TweenVars = { ...preset.to, ...options.to }

    let scrollTriggerVars: ScrollTrigger.Vars | undefined
    if (options.scrollTrigger !== false) {
      const composableDefaults: ScrollTrigger.Vars = {
        trigger: el,
        start: 'top bottom',
        end: 'center center',
        toggleActions: 'play resume resume reset',
        scrub: true,
      }
      scrollTriggerVars = {
        ...composableDefaults,
        ...preset.scrollTrigger,
        ...(options.scrollTrigger || {}),
        trigger: (options.scrollTrigger as ScrollTrigger.Vars)?.trigger ?? el,
      }
    }

    ctx = gsap.context(() => {
      gsap.fromTo(targets, from, {
        ...to,
        ...(scrollTriggerVars ? { scrollTrigger: scrollTriggerVars } : {}),
      })
    }, el)
  }

  watch(fontsLoaded, (loaded) => {
    if (loaded)
      init()
  }, { immediate: true })

  onUnmounted(() => {
    ctx?.revert()
    splitInstance?.revert()
  })

  return { init }
}
