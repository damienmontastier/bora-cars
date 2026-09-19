import type { TextAnimationPreset, TextAnimationStyle } from '~/config/TEXT_ANIMATION_CONFIG'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { setupSplitTextPane } from '~/composables/pane/splitText'
import { TEXT_ANIMATION_CONFIG } from '~/config/TEXT_ANIMATION_CONFIG'

export type { TextAnimationStyle }

export interface SplitTextAnimationOptions {
  style?: TextAnimationStyle
  split?: Partial<SplitText.Vars>
  from?: gsap.TweenVars
  to?: gsap.TweenVars
  scrollTrigger?: false | ScrollTrigger.Vars
  label?: string
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

  let mm: gsap.MatchMedia | null = null

  function init() {
    const el = getEl()
    if (!el)
      return

    mm?.revert()
    mm = gsap.matchMedia()

    mm.add(
      {
        isMobile: '(max-width: 799px)',
        isDesktop: '(min-width: 800px)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const { reduceMotion, isMobile } = context.conditions!

        if (reduceMotion || isMobile)
          return

        const preset = TEXT_ANIMATION_CONFIG[currentStyle.value] as TextAnimationPreset

        const splitType = (options.split?.type ?? preset.split?.type ?? 'chars') as string

        const scrubDefaults: ScrollTrigger.Vars = {
          trigger: el,
          start: 'top bottom',
          end: 'center center',
          scrub: true,
        }

        const toggleDefaults: ScrollTrigger.Vars = {
          trigger: el,
          start: 'top 85%',
          toggleActions: import.meta.dev ? 'play none none reset' : 'play none none none',
        }

        const userScrub = (options.scrollTrigger as ScrollTrigger.Vars)?.scrub
          ?? preset.scrollTrigger?.scrub
        const isToggleMode = userScrub === false
        const composableDefaults = isToggleMode ? toggleDefaults : scrubDefaults

        const stripScrub = <T extends ScrollTrigger.Vars | undefined>(v: T): T => {
          if (!isToggleMode || !v)
            return v
          const { scrub: _sc, ...rest } = v
          return rest as T
        }
        const presetScrollTrigger = stripScrub(preset.scrollTrigger)
        const userScrollTrigger = options.scrollTrigger
          ? stripScrub(options.scrollTrigger)
          : {}

        const scrollTriggerVars: ScrollTrigger.Vars | undefined = options.scrollTrigger === false
          ? undefined
          : {
              ...composableDefaults,
              ...presetScrollTrigger,
              ...userScrollTrigger,
              markers: import.meta.dev && options.debug,
              trigger: (options.scrollTrigger as ScrollTrigger.Vars)?.trigger ?? el,
            }

        const buildAnim = (self: SplitText): gsap.core.Animation | void => {
          if (preset.animate) {
            return preset.animate(
              el,
              self.chars,
              self.words,
              self.lines,
              scrollTriggerVars ?? composableDefaults,
            )
          }

          const targets = resolveTargets(self, splitType)
          const from: gsap.TweenVars = { ...(preset.from ?? {}), ...options.from }
          const to: gsap.TweenVars = { ...(preset.to ?? {}), ...options.to }

          if (scrollTriggerVars?.scrub)
            to.ease = 'none'

          preset.prepare?.(targets)
          gsap.set(targets, from)
          return gsap.fromTo(targets, from, {
            ...to,
            immediateRender: true,
            ...(scrollTriggerVars ? { scrollTrigger: scrollTriggerVars } : {}),
          })
        }

        const isElTextLeaf = el.classList.contains('app-text')
        let splitTarget: HTMLElement | HTMLElement[] = el
        if (!isElTextLeaf) {
          const all = Array.from(el.querySelectorAll<HTMLElement>('.app-text'))
          const outermost = all.filter((node) => {
            let ancestor = node.parentElement
            while (ancestor && ancestor !== el) {
              if (ancestor.classList.contains('sr-only'))
                return false
              if (ancestor.classList.contains('app-text'))
                return false
              ancestor = ancestor.parentElement
            }
            return true
          })
          if (outermost.length)
            splitTarget = outermost
        }

        SplitText.create(splitTarget, {
          autoSplit: true,
          smartWrap: true,
          aria: 'none',
          ...(splitType.includes('chars') ? { charsClass: 'char' } : {}),
          ...(splitType.includes('words') ? { wordsClass: 'word' } : {}),
          ...(splitType.includes('lines') ? { linesClass: 'line' } : {}),
          ...preset.split,
          ...options.split,
          onSplit: buildAnim,
        })

        nextTick(() => ScrollTrigger.refresh())
      },
    )
  }

  watch(fontsLoaded, (loaded) => {
    if (loaded)
      init()
  })

  if (options.scrollTrigger) {
    watch(
      () => (options.scrollTrigger as ScrollTrigger.Vars).trigger,
      (val) => {
        if (val && fontsLoaded.value)
          init()
      },
    )
  }

  onMounted(() => {
    if (fontsLoaded.value)
      nextTick(() => init())

    if (import.meta.dev && options.debug) {
      setupSplitTextPane(currentStyle, init, options.label)
    }
  })

  onUnmounted(() => {
    mm?.revert()
    mm = null
  })

  return { init }
}
