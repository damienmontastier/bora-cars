import type { TextAnimationPreset, TextAnimationStyle } from '~/config/TEXT_ANIMATION_CONFIG'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { setupSplitTextPane } from '~/composables/pane/splitText'
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
  /** Tweakpane folder label (dev only, requires debug: true) */
  label?: string
  /** Show Tweakpane debug folder — default: false */
  debug?: boolean
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

  const currentStyle = ref<TextAnimationStyle>(options.style ?? 'slide-x')

  let splitInstance: SplitText | null = null
  let ctx: gsap.Context | null = null

  function init() {
    const el = getEl()
    if (!el)
      return

    ctx?.revert()
    splitInstance?.revert()

    const preset = TEXT_ANIMATION_CONFIG[currentStyle.value] as TextAnimationPreset

    const splitType = (options.split?.type ?? preset.split?.type ?? 'chars') as string
    const splitVars: SplitText.Vars = {
      autoSplit: true,
      smartWrap: true,
      ...(splitType.includes('chars') ? { charsClass: 'char' } : {}),
      ...preset.split,
      ...options.split,
    }

    splitInstance = new SplitText(el, splitVars)

    const type = splitVars.type ?? 'chars'
    const targets = resolveTargets(splitInstance, type)

    const composableDefaults: ScrollTrigger.Vars = {
      trigger: el,
      start: 'top bottom',
      end: 'center center',
      scrub: true,
    }

    const scrollTriggerVars: ScrollTrigger.Vars | undefined = options.scrollTrigger === false
      ? undefined
      : {
          ...composableDefaults,
          ...preset.scrollTrigger,
          ...(options.scrollTrigger || {}),
          markers: import.meta.dev && options.debug,
          trigger: (options.scrollTrigger as ScrollTrigger.Vars)?.trigger ?? el,
        }

    if (preset.animate) {
      ctx = gsap.context(() => {
        preset.animate!(
          el,
          splitInstance!.chars,
          splitInstance!.words,
          splitInstance!.lines,
          scrollTriggerVars ?? composableDefaults,
        )
      }, el)
    }
    else {
      const from: gsap.TweenVars = { ...(preset.from ?? {}), ...options.from }
      const to: gsap.TweenVars = { ...(preset.to ?? {}), ...options.to }

      if (scrollTriggerVars?.scrub)
        to.ease = 'none'

      ctx = gsap.context(() => {
        // prepare is inside context so gsap.set() calls (e.g. perspective) are reverted on ctx.revert()
        preset.prepare?.(targets)
        gsap.fromTo(targets, from, {
          ...to,
          ...(scrollTriggerVars ? { scrollTrigger: scrollTriggerVars } : {}),
        })
      }, el)
    }

    nextTick(() => ScrollTrigger.refresh())
  }

  // Fonts load while component is already mounted (initial page load)
  watch(fontsLoaded, (loaded) => {
    if (loaded)
      init()
  })

  // Component mounts after fonts are already loaded (SPA navigation)
  onMounted(() => {
    if (fontsLoaded.value)
      init()

    if (import.meta.dev && options.debug) {
      setupSplitTextPane(currentStyle, init, options.label)
    }
  })

  onUnmounted(() => {
    ctx?.revert()
    splitInstance?.revert()
  })

  return { init }
}
