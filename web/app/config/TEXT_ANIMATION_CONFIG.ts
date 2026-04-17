import type gsap from 'gsap'
import type { SplitText } from 'gsap/SplitText'
import gsapDefault from 'gsap'

type AnimateFn = (
  el: HTMLElement,
  chars: Element[],
  words: Element[],
  lines: Element[],
  st: ScrollTrigger.Vars,
) => void

export interface TextAnimationPreset {
  split: Pick<SplitText.Vars, 'type' | 'mask'>
  /** Setup before tween — only used when animate is absent */
  prepare?: (targets: Element[]) => void
  from?: gsap.TweenVars
  to?: gsap.TweenVars
  /** Preferred ScrollTrigger defaults — merged between composable defaults and user overrides */
  scrollTrigger?: Partial<ScrollTrigger.Vars>
  /** Full custom animation — when present, from/to/prepare are ignored */
  animate?: AnimateFn
}

// ─── Shared helpers ──────────────────────────────────────────────────────────

const perspective = (targets: Element[], depth = 2000) =>
  targets.forEach(el => gsapDefault.set(el.parentNode as Element, { perspective: depth }))

const wordChars = (word: Element) =>
  [...word.querySelectorAll('.char')] as Element[]

// ─────────────────────────────────────────────────────────────────────────────

export const TEXT_ANIMATION_CONFIG = {

  // ─── index.js ──────────────────────────────────────────────────────────────

  /** fx11 — chars slide in from the right (clipped) */
  'slide-x': {
    split: { type: 'chars', mask: 'chars' },
    from: { transformOrigin: '0% 50%', xPercent: 105 },
    to: { xPercent: 0, duration: 1, ease: 'expo', stagger: 0.042 },
    scrollTrigger: { start: 'top bottom', end: 'top top+=10%', scrub: true },
  },

  /** Lines slide up from below (clipped) */
  'slide-y': {
    split: { type: 'lines', mask: 'lines' },
    from: { yPercent: 105 },
    to: { yPercent: 0, duration: 1, ease: 'expo', stagger: 0.08 },
    scrollTrigger: { start: 'top bottom', end: 'top center', scrub: true },
  },

  /** fx1 — chars scatter in: scale up + random rotation */
  'scatter-in': {
    split: { type: 'chars', mask: undefined },
    from: { opacity: 0, scale: 0.6, rotation: () => gsapDefault.utils.random(-20, 20) },
    to: { ease: 'power4', opacity: 1, scale: 1, rotation: 0, stagger: 0.04 },
    scrollTrigger: { start: 'center+=20% bottom', end: '+=50%', scrub: true },
  },

  /** fx2 — chars squash and stretch upward (clipped) */
  'stretch-up': {
    split: { type: 'chars', mask: 'chars' },
    from: { opacity: 0, yPercent: 120, scaleY: 2.3, scaleX: 0.7, transformOrigin: '50% 0%' },
    to: { duration: 1, ease: 'back.inOut(2)', opacity: 1, yPercent: 0, scaleY: 1, scaleX: 1, stagger: 0.03 },
    scrollTrigger: { start: 'center bottom+=50%', end: 'bottom top+=40%', scrub: true },
  },

  /** fx3 — chars scale up from their top edge (clipped) */
  'scale-y-top': {
    split: { type: 'chars', mask: 'chars' },
    from: { transformOrigin: '50% 0%', scaleY: 0 },
    to: { ease: 'back', scaleY: 1, stagger: 0.03 },
    scrollTrigger: { start: 'center bottom-=5%', end: 'top top-=20%', scrub: true },
  },

  /** fx4 — chars converge from a spread toward the center of each word */
  'converge': {
    split: { type: 'chars', mask: undefined },
    from: { x: (i: number, _: unknown, arr: unknown[]) => 150 * (i - arr.length / 2) },
    to: { ease: 'power1.inOut', x: 0, stagger: { grid: 'auto', from: 'center' } },
    scrollTrigger: { start: 'center bottom+=30%', end: 'top top+=15%', scrub: true },
  },

  /** fx5 — chars fly in from random positions across the viewport */
  'explode': {
    split: { type: 'chars', mask: undefined },
    from: {
      opacity: 0,
      xPercent: () => gsapDefault.utils.random(-200, 200),
      yPercent: () => gsapDefault.utils.random(-150, 150),
    },
    to: { ease: 'power1.inOut', opacity: 1, xPercent: 0, yPercent: 0, stagger: { each: 0.05, grid: 'auto', from: 'random' } },
    scrollTrigger: { start: 'center bottom+=10%', end: 'bottom center', scrub: 0.9 },
  },

  /** fx6 — chars flip in on X axis (3D) */
  'flip-x': {
    split: { type: 'chars', mask: undefined },
    prepare: targets => perspective(targets, 2000),
    from: { opacity: 0, rotationX: -90, yPercent: 50 },
    to: { ease: 'power1.inOut', opacity: 1, rotationX: 0, yPercent: 0, stagger: { each: 0.03, from: 0 } },
    scrollTrigger: { start: 'center bottom+=40%', end: 'bottom center-=30%', scrub: 0.9 },
  },

  /** fx7 — chars flip in on Y axis from the right (3D) */
  'flip-side': {
    split: { type: 'chars', mask: undefined },
    prepare: targets => perspective(targets, 2000),
    from: { transformOrigin: '100% 50%', opacity: 0, rotationY: -90, z: -300 },
    to: { ease: 'expo', opacity: 1, rotationY: 0, z: 0, stagger: { each: 0.06, from: 'end' } },
    scrollTrigger: { start: 'bottom bottom+=20%', end: 'bottom top', scrub: 1 },
  },

  /** fx8 — chars scramble through random symbols before settling */
  'scramble': {
    split: { type: 'chars', mask: undefined },
    animate: (el, chars, _w, _l, st) => {
      const symbols = 'abcdefghijklmnopqrstuvwxyz!@#$%^&*-_+=;:<>,'
      chars.forEach((char, i) => {
        const html = (char as HTMLElement).innerHTML
        gsapDefault.fromTo(char, { opacity: 0 }, {
          duration: 0.03,
          innerHTML: () => symbols[Math.floor(Math.random() * symbols.length)],
          repeat: 1,
          repeatRefresh: true,
          opacity: 1,
          repeatDelay: 0.03,
          delay: (i + 1) * 0.18,
          onComplete: () => gsapDefault.set(char, { innerHTML: html }),
          scrollTrigger: { ...st, toggleActions: 'play resume resume reset', onEnter: () => gsapDefault.set(char, { opacity: 0 }) },
        })
      })
    },
    scrollTrigger: { start: 'top bottom', end: 'bottom center', scrub: false, toggleActions: 'play resume resume reset' },
  },

  /** fx9 — chars scale in from 0 and converge from the viewport center */
  'scale-center': {
    split: { type: 'chars', mask: undefined },
    from: {
      scaleX: 0,
      x: (_: unknown, target: unknown) =>
        window.innerWidth / 2 - (target as HTMLElement).offsetLeft - (target as HTMLElement).offsetWidth / 2,
    },
    to: { ease: 'power1.inOut', scaleX: 1, x: 0 },
    scrollTrigger: { start: 'top bottom', end: 'top top', scrub: true },
  },

  /** fx10 — chars blur-fade in from random order */
  'blur-in': {
    split: { type: 'chars', mask: undefined },
    from: { opacity: 0, filter: 'blur(20px)' },
    to: { duration: 0.25, ease: 'power1.inOut', opacity: 1, filter: 'blur(0px)', stagger: { each: 0.05, from: 'random' } },
    scrollTrigger: { start: 'top bottom', end: 'center center', scrub: false, toggleActions: 'play resume resume reset' },
  },

  /** fx12 — chars slide in from left with twist and horizontal scale (clipped) */
  'slide-left-twist': {
    split: { type: 'chars', mask: 'chars' },
    from: { xPercent: -250, rotationZ: 45, scaleX: 6, transformOrigin: '100% 50%' },
    to: { duration: 1, ease: 'power2', xPercent: 0, rotationZ: 0, scaleX: 1, stagger: -0.06 },
    scrollTrigger: { start: 'top bottom+=10%', end: 'bottom top+=10%', scrub: true },
  },

  /** fx13 — chars full 3D flip — rotate Y + fall from below */
  'flip-3d': {
    split: { type: 'chars', mask: undefined },
    prepare: targets => perspective(targets, 2000),
    from: { opacity: 0, rotationY: 180, xPercent: -40, yPercent: 100 },
    to: { ease: 'power4.inOut', opacity: 1, rotationY: 0, xPercent: 0, yPercent: 0, stagger: { each: -0.03, from: 0 } },
    scrollTrigger: { start: 'center bottom', end: 'bottom center-=30%', scrub: 0.9 },
  },

  // ─── index2.js ─────────────────────────────────────────────────────────────

  /** fx16 — title rotates + words fade in sequentially */
  'word-fade': {
    split: { type: 'words', mask: undefined },
    animate: (el, _c, words, _l, st) => {
      gsapDefault.fromTo(el,
        { transformOrigin: '0% 50%', rotate: 3 },
        { ease: 'none', rotate: 0, scrollTrigger: { ...st, start: 'top bottom', end: 'top top' } },
      )
      gsapDefault.fromTo(words,
        { opacity: 0.1 },
        { ease: 'none', opacity: 1, stagger: 0.05, scrollTrigger: { ...st, start: 'top bottom-=20%', end: 'center top+=20%' } },
      )
    },
    scrollTrigger: { scrub: true },
  },

  /** fx17 — chars tumble in with random 3D rotation + depth */
  'tumble-3d': {
    split: { type: 'chars', mask: undefined },
    prepare: targets => perspective(targets, 1000),
    from: {
      opacity: 0,
      rotateX: () => gsapDefault.utils.random(-120, 120),
      z: () => gsapDefault.utils.random(-200, 200),
    },
    to: { ease: 'none', opacity: 1, rotateX: 0, z: 0, stagger: 0.02 },
    scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: true },
  },

  /** fx18 — chars rush in from deep Z space */
  'depth-in': {
    split: { type: 'chars', mask: undefined },
    prepare: targets => perspective(targets, 1000),
    from: { opacity: 0.2, z: -800 },
    to: { ease: 'back.out(1.2)', opacity: 1, z: 0, stagger: 0.04 },
    scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: true },
  },

  /** fx19 — chars pivot in from top edge in 3D */
  'pivot-top': {
    split: { type: 'chars', mask: undefined },
    prepare: targets => perspective(targets, 1000),
    from: { transformOrigin: '50% 0%', opacity: 0, rotationX: -90, z: -200 },
    to: { ease: 'power1', opacity: 1, rotationX: 0, z: 0, stagger: 0.05 },
    scrollTrigger: { start: 'center bottom', end: 'bottom top+=20%', scrub: true },
  },

  /** fx20 — chars pivot in from bottom edge, random stagger order */
  'pivot-bottom': {
    split: { type: 'chars', mask: undefined },
    prepare: targets => perspective(targets, 1000),
    from: { transformOrigin: '50% 100%', opacity: 0, rotationX: 90 },
    to: { ease: 'power4', opacity: 1, rotationX: 0, stagger: { each: 0.03, from: 'random' } },
    scrollTrigger: { start: 'center bottom', end: 'bottom top+=20%', scrub: true },
  },

  /** fx21 — per-word: chars dive in from 3D depth + wave Y offset */
  'dive-in': {
    split: { type: 'chars,words', mask: undefined },
    animate: (el, _c, words, _l, st) => {
      for (const word of words) {
        const wc = wordChars(word)
        perspective(wc, 2000)
        gsapDefault.fromTo(wc, {
          opacity: 0,
          y: (i, _, arr) => -40 * Math.abs(i - arr.length / 2),
          z: () => gsapDefault.utils.random(-1500, -600),
          rotationX: () => gsapDefault.utils.random(-500, -200),
        }, {
          ease: 'power1.inOut', opacity: 1, y: 0, z: 0, rotationX: 0,
          stagger: { each: 0.06, from: 'center' },
          scrollTrigger: { ...st, trigger: word, start: 'top bottom', end: 'top top+=15%' },
        })
      }
    },
    scrollTrigger: { scrub: true },
  },

  /** fx22 — per-word: chars spiral in with wave X/Y/rotationZ + rotationY */
  'helix': {
    split: { type: 'chars,words', mask: undefined },
    animate: (el, _c, words, _l, st) => {
      for (const word of words) {
        const wc = wordChars(word)
        const n = wc.length
        perspective(wc, 1000)
        const factor = (i: number) => i < Math.ceil(n / 2) ? i : Math.ceil(n / 2) - Math.abs(Math.floor(n / 2) - i) - 1
        gsapDefault.fromTo(wc, {
          x: (i) => (n % 2 ? Math.abs(Math.ceil(n / 2) - 1 - factor(i)) : Math.abs(Math.ceil(n / 2) - factor(i))) * 200 * (i < n / 2 ? -1 : 1),
          y: (i) => factor(i) * 60,
          rotationY: -270,
          rotationZ: (i) => i < n / 2 ? Math.abs(factor(i) - n / 2) * 8 : -Math.abs(factor(i) - n / 2) * 8,
        }, {
          ease: 'power2.inOut', x: 0, y: 0, rotationZ: 0, rotationY: 0, scale: 1,
          scrollTrigger: { ...st, trigger: word, start: 'top bottom+=40%', end: 'top top+=15%' },
        })
      }
    },
    scrollTrigger: { scrub: true },
  },

  /** fx23 — per-word: chars fan out/in from alternating directions */
  'scale-fan': {
    split: { type: 'chars,words', mask: undefined },
    animate: (el, _c, words, _l, st) => {
      words.forEach((word, wi) => {
        const wc = wordChars(word)
        gsapDefault.fromTo(wc, {
          scale: 0.01,
          x: (i, _, arr) => wi % 2 ? i * 50 : (arr.length - i - 1) * -50,
        }, {
          ease: 'power4', scale: 1, x: 0,
          scrollTrigger: { ...st, trigger: word, start: 'center bottom', end: 'bottom top-=40%' },
        })
      })
    },
    scrollTrigger: { scrub: true },
  },

  /** fx24 — chars drop in with an elastic wave pattern */
  'wave-drop': {
    split: { type: 'chars', mask: undefined },
    from: {
      y: (i: number, _: unknown, arr: unknown[]) => {
        const n = arr.length
        const f = i < Math.ceil(n / 2) ? i : Math.ceil(n / 2) - Math.abs(Math.floor(n / 2) - i) - 1
        return (n / 2 - f + 6) * 130
      },
    },
    to: { ease: 'elastic.out(.4)', y: 0, stagger: { amount: 0.1, from: 'center' } },
    scrollTrigger: { start: 'top bottom', end: 'bottom top-=50%', scrub: true },
  },

  /** fx25 — chars scale up from bottom edge while parent is pinned */
  'pin-scale-y': {
    split: { type: 'chars', mask: undefined },
    animate: (el, chars, _w, _l, st) => {
      gsapDefault.fromTo(chars, { scaleY: 0, transformOrigin: '50% 100%' }, {
        ease: 'power3.in', scaleY: 1, stagger: 0.05,
        scrollTrigger: { ...st, start: 'center center', end: '+=500%', scrub: true, pin: el.parentElement! },
      })
    },
  },

  /** fx27 — words fly in from random 3D positions while parent is pinned */
  'word-zoom': {
    split: { type: 'words', mask: undefined },
    animate: (el, _c, words, _l, st) => {
      words.forEach(w => gsapDefault.set(w.parentNode as Element, { perspective: 1000 }))
      gsapDefault.fromTo(words, {
        z: () => gsapDefault.utils.random(500, 950),
        opacity: 0,
        xPercent: () => gsapDefault.utils.random(-100, 100),
        yPercent: () => gsapDefault.utils.random(-10, 10),
        rotationX: () => gsapDefault.utils.random(-90, 90),
      }, {
        ease: 'expo', opacity: 1, rotationX: 0, rotationY: 0, xPercent: 0, yPercent: 0, z: 0,
        scrollTrigger: { ...st, start: 'center center', end: '+=300%', scrub: true, pin: el.parentElement! },
        stagger: { each: 0.006, from: 'random' },
      })
    },
  },

  /** fx28 — per-word: chars scale + blur + rotate based on distance from center */
  'blur-scale': {
    split: { type: 'chars,words', mask: undefined },
    animate: (el, _c, words, _l, st) => {
      for (const word of words) {
        const wc = wordChars(word)
        const n = wc.length
        const factor = (i: number) => i < Math.ceil(n / 2) ? i : Math.ceil(n / 2) - Math.abs(Math.floor(n / 2) - i) - 1
        gsapDefault.fromTo(wc, {
          transformOrigin: '50% 100%',
          scale: (i) => gsapDefault.utils.mapRange(0, Math.ceil(n / 2), 0.5, 2.1, factor(i)),
          y: (i) => gsapDefault.utils.mapRange(0, Math.ceil(n / 2), 0, 60, factor(i)),
          rotation: (i) => i < n / 2
            ? gsapDefault.utils.mapRange(0, Math.ceil(n / 2), -4, 0, factor(i))
            : gsapDefault.utils.mapRange(0, Math.ceil(n / 2), 0, 4, factor(i)),
          filter: 'blur(12px) opacity(0)',
        }, {
          ease: 'power2.inOut', y: 0, rotation: 0, scale: 1, filter: 'blur(0px) opacity(1)',
          scrollTrigger: { ...st, trigger: word, start: 'top bottom+=40%', end: 'top top+=15%' },
          stagger: { amount: 0.15, from: 'center' },
        })
      }
    },
    scrollTrigger: { scrub: true },
  },

  /** fx29 — per-word: chars scale in from alternating corner origins */
  'corner-scale': {
    split: { type: 'chars,words', mask: undefined },
    animate: (el, _c, words, _l, st) => {
      words.forEach((word, wi) => {
        const wc = wordChars(word)
        gsapDefault.fromTo(wc, {
          transformOrigin: `${wi % 2 ? 0 : 100}% ${wi % 2 ? 100 : 0}%`,
          scale: 0,
        }, {
          ease: 'power4', scale: 1,
          stagger: { each: 0.03, from: wi % 2 ? 'end' : 'start' },
          scrollTrigger: { ...st, trigger: word, start: 'top bottom-=10%', end: 'top top' },
        })
      })
    },
    scrollTrigger: { scrub: true },
  },

} as const satisfies Record<string, TextAnimationPreset>

export type TextAnimationStyle = keyof typeof TEXT_ANIMATION_CONFIG
