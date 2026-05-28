<script setup lang="ts">
import gsap from 'gsap'
import { useLenis } from 'lenis/vue'
import Tempus from 'tempus'

interface FaqItem {
  _key: string
  question: string
  answer?: string
}

const props = defineProps<{ items: FaqItem[] }>()

const itemRefs = ref<HTMLElement[]>([])
const expanded = ref<string | null>(null)
let activeTweens: gsap.core.Tween[] = []

const lenis = useLenis()
const analytics = useAnalytics()

const bgSetters: Array<(value: number) => void> = []
const bgContentSetters: Array<(value: number) => void> = []
const clamp01 = gsap.utils.clamp(0, 1)

// Height is driven by a GSAP tween (replaces the CSS transition so it can't
// desync against the scroll). Scroll uses Lenis's native scrollTo so user wheel/
// touch input still interrupts it. The bg parallax reads the live rect every
// frame via Tempus, so it stays coherent across both motions even though they
// have different curves and durations.
const HEIGHT_DURATION = 0.4
const HEIGHT_EASE = 'cubic-bezier(0.215, 0.61, 0.355, 1)' // --ease-out-cubic
const SCROLL_DURATION = 1

// Live parallax: progress is recomputed every frame from getBoundingClientRect,
// so the bg's yPercent always reflects the actual layout state, whatever the
// height tween is doing.
function updateParallax() {
  const vh = window.innerHeight
  for (let i = 0; i < itemRefs.value.length; i++) {
    const item = itemRefs.value[i]
    const setBg = bgSetters[i]
    const setBgContent = bgContentSetters[i]
    if (!item || !setBg || !setBgContent)
      continue
    const rect = item.getBoundingClientRect()
    const h = rect.height
    const progress = clamp01((vh / 2 + 0.125 * h - rect.top) / (1.25 * h))
    const yPercent = -100 + progress * 200
    setBg(yPercent)
    setBgContent(-yPercent)
  }
}

function getWrappers(itemEl: HTMLElement): HTMLElement[] {
  return Array.from(itemEl.querySelectorAll<HTMLElement>('.faq-item__answer-wrapper'))
}

function measureExpandedHeight(itemEl: HTMLElement): number {
  // Snapshot the wrapper's auto height as if `.is-expanded` was applied, without
  // ever painting that state — sync set, read, revert.
  const wrapper = itemEl.querySelector<HTMLElement>('.faq-item__answer-wrapper')
  if (!wrapper)
    return 0
  const hadClass = wrapper.classList.contains('is-expanded')
  const originalInline = wrapper.style.height
  if (!hadClass)
    wrapper.classList.add('is-expanded')
  wrapper.style.height = 'auto'
  const h = wrapper.getBoundingClientRect().height
  wrapper.style.height = originalInline
  if (!hadClass)
    wrapper.classList.remove('is-expanded')
  return h
}

function toggle(key: string, index: number) {
  // Kill any in-progress tweens so the user can re-toggle instantly. All
  // subsequent measurements (getBoundingClientRect, lenis.scroll) then read the
  // live mid-animation state — the next tween picks up smoothly from there.
  for (const t of activeTweens) t.kill()
  activeTweens = []

  const wasOpen = expanded.value === key

  analytics.trackFaqToggle({
    question_index: index,
    question_text: props.items[index]?.question,
    expanded_state: !wasOpen,
  })

  const itemEl = itemRefs.value[index]
  if (!itemEl) {
    expanded.value = wasOpen ? null : key
    return
  }

  const targetWrappers = getWrappers(itemEl)
  if (!targetWrappers.length) {
    expanded.value = wasOpen ? null : key
    return
  }

  // Target measurements
  const targetFromH = targetWrappers[0]!.getBoundingClientRect().height
  const targetToH = wasOpen ? 0 : measureExpandedHeight(itemEl)
  const targetHeightDelta = targetToH - targetFromH

  // Any item OTHER than the target that still has visible height — semantically
  // expanded OR mid-close from a rapid previous toggle — must also be animated
  // to 0. Tracking only `prevKey` (Vue state) misses items left stuck mid-close
  // when the user spam-clicks between items.
  interface ClosingItem { wrappers: HTMLElement[], fromH: number, index: number }
  const closing: ClosingItem[] = []
  itemRefs.value.forEach((it, i) => {
    if (i === index || !it)
      return
    const ws = getWrappers(it)
    const h = ws[0]?.getBoundingClientRect().height ?? 0
    if (h > 0.5)
      closing.push({ wrappers: ws, fromH: h, index: i })
  })

  // Re-centring scroll target: sum the heights of every closing item ABOVE the
  // target (they'll shrink → target moves up in viewport).
  const topDelta = closing
    .filter(c => c.index < index)
    .reduce((sum, c) => sum - c.fromH, 0)

  const rect = itemEl.getBoundingClientRect()
  const currentScroll = lenis.value?.scroll ?? window.scrollY
  const currentCenter = currentScroll + rect.top + rect.height / 2 - window.innerHeight / 2
  const targetScroll = currentCenter + topDelta + targetHeightDelta * 0.5

  // Freeze inline heights BEFORE Vue flushes the class change.
  for (const w of targetWrappers) w.style.height = `${targetFromH}px`
  for (const c of closing) {
    for (const w of c.wrappers) w.style.height = `${c.fromH}px`
  }

  expanded.value = wasOpen ? null : key

  if (!lenis.value) {
    for (const w of targetWrappers) w.style.height = ''
    for (const c of closing) {
      for (const w of c.wrappers) w.style.height = ''
    }
    return
  }

  // Height — single tween drives target + every closing item in lockstep.
  const heightProxy = { p: 0 }
  const heightTween = gsap.to(heightProxy, {
    p: 1,
    duration: HEIGHT_DURATION,
    ease: HEIGHT_EASE,
    onUpdate: () => {
      const p = heightProxy.p
      const tH = targetFromH + targetHeightDelta * p
      for (const w of targetWrappers) w.style.height = `${tH}px`
      for (const c of closing) {
        const h = c.fromH * (1 - p)
        for (const w of c.wrappers) w.style.height = `${h}px`
      }
    },
    onComplete: () => {
      // Hand control back to CSS — `.is-expanded` drives `height: auto` on the
      // opened wrapper (window-resize resilient); closed wrappers fall back to
      // the default `height: 0`.
      for (const w of targetWrappers) w.style.height = ''
      for (const c of closing) {
        for (const w of c.wrappers) w.style.height = ''
      }
    },
  })

  activeTweens = [heightTween]

  // Scroll — Lenis native scrollTo, interruptible by user wheel/touch.
  lenis.value.scrollTo(targetScroll, { duration: SCROLL_DURATION })
}

let unsubTempus: (() => void) | undefined

onMounted(() => {
  itemRefs.value.forEach((item, i) => {
    const bg = item.querySelector<HTMLElement>('.faq-item__bg')
    const bgContent = item.querySelector<HTMLElement>('.faq-item__bg-content')
    if (bg)
      bgSetters[i] = gsap.quickSetter(bg, 'yPercent') as (value: number) => void
    if (bgContent)
      bgContentSetters[i] = gsap.quickSetter(bgContent, 'yPercent') as (value: number) => void
  })
  // Run every frame via Tempus — independent of Lenis scroll events, so the
  // parallax never gets stuck on a stale value if Lenis stops emitting before
  // reaching its scrollTo target.
  unsubTempus = Tempus.add(updateParallax)
})

onUnmounted(() => {
  unsubTempus?.()
  bgSetters.length = 0
  bgContentSetters.length = 0
})
</script>

<template>
  <section class="app-elements-faq">
    <ol class="app-elements-faq__list">
      <li
        v-for="(item, index) in items"
        :key="item._key"
        ref="itemRefs"
        class="faq-item"
        @click="toggle(item._key, index)"
      >
        <!-- Main content -->
        <div class="faq-item__header">
          <TextsH3 :selectable="false" class="faq-item__question">
            {{ item.question }}
          </TextsH3>
          <div class="faq-item__icon" :class="{ 'is-open': expanded === item._key }">
            <SvgIconArrow color="black-100" />
          </div>
        </div>

        <div class="faq-item__answer-wrapper" :class="{ 'is-expanded': expanded === item._key }">
          <div class="faq-item__answer-inner">
            <TextsP2 :selectable="false" class="faq-item__answer-text">
              {{ item.answer }}
            </TextsP2>
          </div>
        </div>

        <!-- Black bg mask -->
        <div aria-hidden="true" class="faq-item__bg">
          <div class="faq-item__bg-content">
            <div class="faq-item__header">
              <TextsH3 :selectable="false" :animated="false" color="beige-100" class="faq-item__question">
                {{ item.question }}
              </TextsH3>
              <div class="faq-item__icon" :class="{ 'is-open': expanded === item._key }">
                <SvgIconArrow color="beige-100" />
              </div>
            </div>

            <div class="faq-item__answer-wrapper" :class="{ 'is-expanded': expanded === item._key }">
              <div class="faq-item__answer-inner">
                <TextsP2 :selectable="false" color="beige-100" class="faq-item__answer-text">
                  {{ item.answer }}
                </TextsP2>
              </div>
            </div>
          </div>
        </div>
      </li>
    </ol>
  </section>
</template>

<style lang="scss">
.app-elements-faq {
  width: 100%;
  padding: desktop-vw(24px);
  background: var(--c-beige-100);

  @include mobile {
    padding: mobile-vw(16px);
  }

  &__list {
    margin: 0;
    width: 100%;
  }
}

.faq-item {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  padding: 0 desktop-vw(16px);
  border-bottom: 3px solid var(--c-black-100);
  margin-top: -1px;

  @include mobile {
    padding: 0 mobile-vw(8px);
  }

  &:first-child {
    border-top: 3px solid var(--c-black-100);
    margin-top: 0;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: desktop-vw(64px);
    padding: desktop-vw(32px) 0;

    @include mobile {
      gap: mobile-vw(32px);
      padding: mobile-vw(12px) 0;
    }
  }

  &__question {
    flex: 1;
    min-width: 0;
  }

  &__icon {
    flex-shrink: 0;
    width: desktop-vw(52px);
    height: desktop-vw(52px);
    display: flex;
    align-items: center;
    justify-content: center;
    transform: rotate(-90deg);
    transition: transform 0.4s var(--ease-out-cubic);

    @include mobile {
      width: mobile-vw(40px);
      height: mobile-vw(40px);
    }

    &.is-open {
      transform: rotate(90deg);
    }

    .svg-logo {
      width: desktop-vw(28px);
      height: auto;

      @include mobile {
        width: mobile-vw(20px);
      }
    }
  }

  &__answer-wrapper {
    box-sizing: border-box;
    overflow: hidden;
    height: 0;

    &.is-expanded {
      height: auto;
    }
  }

  &__answer-inner {
    overflow: hidden;
    width: 72.5%;
    display: block;
    white-space: pre-wrap;
    padding-bottom: desktop-vw(32px);

    @include mobile {
      width: 100%;
      padding-bottom: mobile-vw(12px);
    }
  }

  &__answer-text {
    display: block;
    font-size: desktop-vw(26px);
    line-height: desktop-vw(30px);

    @include mobile {
      font-size: mobile-vw(12px);
      line-height: mobile-vw(16px);
    }
  }

  &__bg {
    position: absolute;
    inset: 0;
    bottom: -3px;
    background: var(--c-black-100);
    pointer-events: none;
    z-index: 1;
    overflow: hidden;
  }

  &:first-child &__bg {
    top: -3px;
  }

  &__bg-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0 desktop-vw(16px);

    @include mobile {
      padding: 0 mobile-vw(8px);
    }
  }
}
</style>
