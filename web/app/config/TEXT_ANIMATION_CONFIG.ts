import type gsap from 'gsap'
import type { SplitText } from 'gsap/SplitText'
import gsapDefault from 'gsap'

export interface TextAnimationPreset {
  split: Pick<SplitText.Vars, 'type' | 'mask'>
  /** Optional setup before the tween — e.g. set perspective on parent elements */
  prepare?: (targets: Element[]) => void
  from: gsap.TweenVars
  to: gsap.TweenVars
  /** Preferred ScrollTrigger defaults for this effect (merged between composable defaults and user overrides) */
  scrollTrigger?: Partial<ScrollTrigger.Vars>
}

export const TEXT_ANIMATION_CONFIG = {

  // ─── Existing ───────────────────────────────────────────────────────────────

  /** Chars slide in from the right (clipped) */
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

  // ─── From fx1 ───────────────────────────────────────────────────────────────

  /** Chars scatter in: each rotates randomly and scales up */
  'scatter-in': {
    split: { type: 'chars', mask: undefined },
    from: {
      opacity: 0,
      scale: 0.6,
      rotation: () => gsapDefault.utils.random(-20, 20),
    },
    to: {
      ease: 'power4',
      opacity: 1,
      scale: 1,
      rotation: 0,
      stagger: 0.04,
    },
    scrollTrigger: { start: 'center+=20% bottom', end: '+=50%', scrub: true },
  },

  // ─── From fx2 ───────────────────────────────────────────────────────────────

  /** Chars squash and stretch upward (clipped) */
  'stretch-up': {
    split: { type: 'chars', mask: 'chars' },
    from: {
      opacity: 0,
      yPercent: 120,
      scaleY: 2.3,
      scaleX: 0.7,
      transformOrigin: '50% 0%',
    },
    to: {
      duration: 1,
      ease: 'back.inOut(2)',
      opacity: 1,
      yPercent: 0,
      scaleY: 1,
      scaleX: 1,
      stagger: 0.03,
    },
    scrollTrigger: { start: 'center bottom+=50%', end: 'bottom top+=40%', scrub: true },
  },

  // ─── From fx3 ───────────────────────────────────────────────────────────────

  /** Chars scale up from their top edge (clipped) */
  'scale-y-top': {
    split: { type: 'chars', mask: 'chars' },
    from: { transformOrigin: '50% 0%', scaleY: 0 },
    to: { ease: 'back', scaleY: 1, stagger: 0.03 },
    scrollTrigger: { start: 'center bottom-=5%', end: 'top top-=20%', scrub: true },
  },

  // ─── From fx5 ───────────────────────────────────────────────────────────────

  /** Chars fly in from random positions across the viewport */
  'explode': {
    split: { type: 'chars', mask: undefined },
    from: {
      opacity: 0,
      xPercent: () => gsapDefault.utils.random(-200, 200),
      yPercent: () => gsapDefault.utils.random(-150, 150),
    },
    to: {
      ease: 'power1.inOut',
      opacity: 1,
      xPercent: 0,
      yPercent: 0,
      stagger: { each: 0.05, grid: 'auto', from: 'random' },
    },
    scrollTrigger: { start: 'center bottom+=10%', end: 'bottom center', scrub: 0.9 },
  },

  // ─── From fx6 ───────────────────────────────────────────────────────────────

  /** Chars flip in on X axis (3D — needs perspective on parent) */
  'flip-x': {
    split: { type: 'chars', mask: undefined },
    prepare: targets => targets.forEach(el => gsapDefault.set(el.parentNode as Element, { perspective: 2000 })),
    from: {
      opacity: 0,
      rotationX: -90,
      yPercent: 50,
    },
    to: {
      ease: 'power1.inOut',
      opacity: 1,
      rotationX: 0,
      yPercent: 0,
      stagger: { each: 0.03, from: 0 },
    },
    scrollTrigger: { start: 'center bottom+=40%', end: 'bottom center-=30%', scrub: 0.9 },
  },

  // ─── From fx7 ───────────────────────────────────────────────────────────────

  /** Chars flip in on Y axis from the right (3D — needs perspective on parent) */
  'flip-side': {
    split: { type: 'chars', mask: undefined },
    prepare: targets => targets.forEach(el => gsapDefault.set(el.parentNode as Element, { perspective: 2000 })),
    from: {
      transformOrigin: '100% 50%',
      opacity: 0,
      rotationY: -90,
      z: -300,
    },
    to: {
      ease: 'expo',
      opacity: 1,
      rotationY: 0,
      z: 0,
      stagger: { each: 0.06, from: 'end' },
    },
    scrollTrigger: { start: 'bottom bottom+=20%', end: 'bottom top', scrub: 1 },
  },

  // ─── From fx10 ──────────────────────────────────────────────────────────────

  /** Chars blur-fade in from random order */
  'blur-in': {
    split: { type: 'chars', mask: undefined },
    from: { opacity: 0, filter: 'blur(20px)' },
    to: {
      duration: 0.25,
      ease: 'power1.inOut',
      opacity: 1,
      filter: 'blur(0px)',
      stagger: { each: 0.05, from: 'random' },
    },
    scrollTrigger: {
      start: 'top bottom',
      end: 'center center',
      scrub: false,
      toggleActions: 'play resume resume reset',
    },
  },

  // ─── From fx12 ──────────────────────────────────────────────────────────────

  /** Chars slide in from left with twist and horizontal scale (clipped) */
  'slide-left-twist': {
    split: { type: 'chars', mask: 'chars' },
    from: {
      xPercent: -250,
      rotationZ: 45,
      scaleX: 6,
      transformOrigin: '100% 50%',
    },
    to: {
      duration: 1,
      ease: 'power2',
      xPercent: 0,
      rotationZ: 0,
      scaleX: 1,
      stagger: -0.06,
    },
    scrollTrigger: { start: 'top bottom+=10%', end: 'bottom top+=10%', scrub: true },
  },

  // ─── From fx13 ──────────────────────────────────────────────────────────────

  /** Chars full 3D flip — rotate Y + fall from below (needs perspective on parent) */
  'flip-3d': {
    split: { type: 'chars', mask: undefined },
    prepare: targets => targets.forEach(el => gsapDefault.set(el.parentNode as Element, { perspective: 2000 })),
    from: {
      opacity: 0,
      rotationY: 180,
      xPercent: -40,
      yPercent: 100,
    },
    to: {
      ease: 'power4.inOut',
      opacity: 1,
      rotationY: 0,
      xPercent: 0,
      yPercent: 0,
      stagger: { each: -0.03, from: 0 },
    },
    scrollTrigger: { start: 'center bottom', end: 'bottom center-=30%', scrub: 0.9 },
  },

} as const satisfies Record<string, TextAnimationPreset>

export type TextAnimationStyle = keyof typeof TEXT_ANIMATION_CONFIG
