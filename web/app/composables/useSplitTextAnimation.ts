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

  let mm: gsap.MatchMedia | null = null

  // Whether a parent-provided trigger is part of the contract. If yes, we must
  // wait for the parent's template ref to resolve before init — otherwise we'd
  // init with the `el` fallback, then re-init once the trigger lands (mm.revert
  // restoring the DOM to its visible natural state between the two = flicker).
  const expectsTrigger
    = !!options.scrollTrigger
      && options.scrollTrigger !== false
      && 'trigger' in (options.scrollTrigger as object)

  // init() can be triggered by multiple sources within the same tick (fontsLoaded
  // watcher, trigger ref propagation, onMounted). Each call does mm.revert()
  // which restores the DOM to its visible natural state for a frame before the
  // new SplitText hides it again — that's the "anim plays then resets" flicker.
  // Coalesce all calls into a single init() per tick.
  let pendingInit = false
  function scheduleInit() {
    if (pendingInit)
      return
    pendingInit = true
    nextTick(() => {
      pendingInit = false
      init()
    })
  }

  // Gate-keeper: only schedule init when all prerequisites are met. If a trigger
  // is expected but still null/undefined, bail and let the trigger watcher fire
  // when it lands.
  function tryInit() {
    if (!fontsLoaded.value)
      return
    if (expectsTrigger) {
      const t = (options.scrollTrigger as ScrollTrigger.Vars).trigger
      if (t === null || t === undefined)
        return
    }
    scheduleInit()
  }

  function init() {
    const el = getEl()
    if (!el)
      return

    // matchMedia owns the gsap.Context + SplitText created inside its callback,
    // so revert() cleans up tweens, ScrollTriggers AND the SplitText DOM in one pass.
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

        // Full bail-out: a11y (reduce motion) or mobile. Splitting text into hundreds of
        // <span> per char + animating them is heavy regardless of scrub vs toggle, so on
        // mobile we skip everything and leave the text in its natural rendered state.
        // https://gsap.com/resources/a11y/
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
          // dev: reset on leave-back so the anim can be replayed by scrolling; prod: play once
          toggleActions: import.meta.dev ? 'play none none reset' : 'play none none none',
        }

        // pick the right defaults: if user/preset explicitly disables scrub, use toggleActions defaults
        const userScrub = (options.scrollTrigger as ScrollTrigger.Vars)?.scrub
          ?? preset.scrollTrigger?.scrub
        const isToggleMode = userScrub === false
        const composableDefaults = isToggleMode ? toggleDefaults : scrubDefaults

        // when forcing toggle mode, drop `scrub` from preset AND user options so that
        // preset/user-defined start/end can still override the toggle defaults
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

        // Build the animation against a fresh SplitText state.
        // Called by SplitText on initial split AND on every autoSplit re-split
        // (font load, container resize). Per GSAP docs: returning the tween/timeline
        // lets SplitText auto-revert it AND restore its totalTime on re-split —
        // seamless across font-load.
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

          // ease on a scrubbed timeline distorts the scroll mapping — force 'none'
          if (scrollTriggerVars?.scrub)
            to.ease = 'none'

          preset.prepare?.(targets)
          return gsap.fromTo(targets, from, {
            ...to,
            ...(scrollTriggerVars ? { scrollTrigger: scrollTriggerVars } : {}),
          })
        }

        // Pick what SplitText splits. SplitText doesn't traverse BLOCK descendants
        // for `lines`, so when `el` is a wrapper around multiple text blocks we want
        // to split each block individually. Rules:
        //  1. If `el` itself is `.app-text`, split it directly. Inline descendants
        //     (e.g. a <span class="P2 app-text"> inside an <h2 class="H2 app-text">)
        //     are traversed automatically by SplitText with `deepSlice` and keep
        //     their styling across line breaks.
        //  2. Otherwise, collect only the OUTERMOST `.app-text` nodes — skip any
        //     `.app-text` that has another `.app-text` (or a `.sr-only`) ancestor
        //     within `el`, so we don't double-split the same content nor touch the
        //     screen-reader-only duplicate kept for a11y.
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

        // Reveal the split target(s) so descendant chars become controllable by
        // their per-char `from` state. `.app-text--will-animate` is set to
        // opacity: 0 by CSS to prevent the SSR-rendered text from flashing
        // visible between hydration and this point.
        const targetEls = Array.isArray(splitTarget) ? splitTarget : [splitTarget]
        targetEls.forEach((t) => { t.style.opacity = '1' })

        SplitText.create(splitTarget, {
          autoSplit: true,
          smartWrap: true,
          // GSAP's default `aria: 'auto'` adds aria-label on the split parent, which
          // ARIA prohibits on generic roles (<span>, <p>, <div>) — Lighthouse flags it.
          aria: 'none',
          // Set explicit classes on every split unit so global CSS (e.g. mask-wrapper
          // padding to prevent descender clipping) can target them by class name.
          // SplitText auto-derives mask wrapper class as `${unitClass}-mask`.
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

  // Fonts load while component is already mounted (initial page load)
  watch(fontsLoaded, tryInit)

  // Wait for a parent-provided ScrollTrigger trigger to resolve. Use case: a
  // parent template ref passed via `scrollTrigger.trigger` is null on the first
  // pass through onMounted (Vue assigns parent refs AFTER children mount), and
  // gets assigned only when the parent's render flushes. Without this watch, we
  // would silently lock in the fallback `el` as trigger and ScrollTrigger
  // positions would be off — especially when the parent has a transform that
  // distorts the child's measured scroll position.
  if (expectsTrigger) {
    watch(
      () => (options.scrollTrigger as ScrollTrigger.Vars).trigger,
      tryInit,
    )
  }

  // Component mounts after fonts are already loaded (SPA navigation)
  onMounted(() => {
    tryInit()

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
