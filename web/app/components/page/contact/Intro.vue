<script setup lang="ts">
import type { ContactProfile } from '~/config/CONTACT_PRO_CONFIG'
import type { ContactProIntroData } from '~/queries/contact'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'

interface Props {
  profile: ContactProfile
  heading?: string | null
  proIntro?: ContactProIntroData | null
}

defineProps<Props>()

const rootRef = ref<HTMLElement | null>(null)

const { motionAllowed, canAnimate, track, motion } = useContactSwitchMotion()
const leaveTotal = motion.leave.duration + motion.leave.stagger

const running = new WeakMap<Element, { split?: SplitText, tween: gsap.core.Animation }>()
let heightTween: gsap.core.Tween | null = null
let leaveSkipped = false

function textTargets(el: Element) {
  return Array.from(el.querySelectorAll<HTMLElement>('.app-text')).filter((node) => {
    for (let parent = node.parentElement; parent && parent !== el; parent = parent.parentElement) {
      if (parent.classList.contains('sr-only') || parent.classList.contains('app-text'))
        return false
    }
    return true
  })
}

function stop(el: Element) {
  const current = running.get(el)
  if (!current)
    return
  current.tween.kill()
  current.split?.revert()
  running.delete(el)
}

function animateLines(el: Element, animate: (lines: Element[]) => gsap.core.Tween) {
  track(() => SplitText.create(textTargets(el), {
    type: 'lines',
    linesClass: 'line',
    aria: 'none',
    autoSplit: true,
    onSplit: (self) => {
      const tween = animate(self.lines)
      running.set(el, { split: self, tween })
      return tween
    },
  }))
}

function onLeave(el: Element, done: () => void) {
  stop(el)
  leaveSkipped = !canAnimate(el)
  if (leaveSkipped) {
    nextTick(done)
    return
  }
  heightTween?.kill()
  if (rootRef.value)
    gsap.set(rootRef.value, { height: rootRef.value.offsetHeight })

  animateLines(el, lines => gsap.to(lines, {
    autoAlpha: 0,
    yPercent: motion.textLeaveY,
    duration: motion.leave.duration,
    ease: motion.leave.ease,
    stagger: { amount: motion.leave.stagger },
    onComplete: () => {
      running.delete(el)
      done()
    },
  }))
}

function reveal(el: HTMLElement, done: () => void, delay: number) {
  const root = rootRef.value
  if (root?.style.height) {
    heightTween?.kill()
    heightTween = track(() => gsap.to(root, {
      height: el.offsetHeight,
      ...motion.height,
      onComplete: () => {
        gsap.set(root, { clearProps: 'height' })
      },
    }))
  }

  animateLines(el, lines => gsap.fromTo(lines, { autoAlpha: 0, yPercent: motion.textEnterY }, {
    autoAlpha: 1,
    yPercent: 0,
    delay,
    duration: motion.enter.duration,
    ease: motion.enter.ease,
    stagger: { amount: motion.enter.stagger },
    onComplete: () => {
      running.get(el)?.split?.revert()
      running.delete(el)
      done()
    },
  }))
}

function onEnter(el: Element, done: () => void) {
  stop(el)
  if (canAnimate(el)) {
    reveal(el, done, motion.gap)
    return
  }

  if (rootRef.value)
    gsap.set(rootRef.value, { clearProps: 'height' })

  if (leaveSkipped && motionAllowed() && el instanceof HTMLElement) {
    gsap.set(el, { autoAlpha: 0 })
    running.set(el, {
      tween: track(() => gsap.delayedCall(leaveTotal + motion.gap, () => {
        running.delete(el)
        gsap.set(el, { clearProps: 'opacity,visibility' })
        if (canAnimate(el))
          reveal(el, done, 0)
        else
          done()
      })),
    })
    return
  }

  done()
}
</script>

<template>
  <div ref="rootRef" class="page-contact-intro">
    <Transition :css="false" mode="out-in" @leave="onLeave" @enter="onEnter">
      <div v-if="profile === 'pro'" key="pro" class="page-contact-intro__pro">
        <TextsH3 v-if="proIntro?.heading" tag="h1" :animated="false">
          {{ proIntro.heading }}
        </TextsH3>
        <TextsP3 v-if="proIntro?.lead" weight="regular" class="page-contact-intro__lead">
          {{ proIntro.lead }}
        </TextsP3>
        <TextsP1 v-if="proIntro?.text" weight="regular" color="black-70">
          {{ proIntro.text }}
        </TextsP1>
      </div>
      <div v-else key="general" class="page-contact-intro__general">
        <TextsH2 v-if="heading" tag="h1" :animated="false">
          {{ heading }}
        </TextsH2>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss">
.page-contact-intro {
  &__pro {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(32px);
    max-width: desktop-vw(656px);
    white-space: pre-line;

    @include mobile {
      gap: mobile-vw(16px);
      max-width: none;
    }
  }

  &__lead {
    @include mobile {
      font-size: mobile-vw(20px);
      line-height: mobile-vw(26px);
    }
  }
}
</style>
