<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis } from 'lenis/vue'

interface FaqItem {
  _key: string
  question: string
  answer?: string
}

const props = defineProps<{ items: FaqItem[] }>()

const rootRef = ref<HTMLElement | null>(null)
const itemRefs = ref<HTMLElement[]>([])
const isSnapping = ref(false)
const expanded = ref<string | null>(null)

const lenis = useLenis()

let ctx: gsap.Context | null = null
const itemTimelines: gsap.core.Timeline[] = []

// Debounce ST refresh to after the CSS transition (0.4s) to avoid per-frame
// refresh thrash that causes yPercent jumps on the bg during accordion animation.
let refreshTimer: ReturnType<typeof setTimeout> | null = null

useResizeObserver(itemRefs, () => {
  if (refreshTimer)
    clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => {
    ScrollTrigger.refresh()
    refreshTimer = null
  }, 420)
})

function toggle(key: string, index: number) {
  if (isSnapping.value)
    return

  const wasOpen = expanded.value === key
  const prevKey = expanded.value
  const itemEl = itemRefs.value[index]
  const answerInner = itemEl?.querySelector<HTMLElement>('.faq-item__answer-inner')

  // When closing: use integer offsetHeight diff (exact — avoids float pb rounding error).
  // When opening: predict from scrollHeight + pb (fallback formula, float — ST correction handles residual).
  const headerEl = itemEl?.querySelector<HTMLElement>('.faq-item__header')
  const expansion = wasOpen
    ? (itemEl?.offsetHeight ?? 0) - (headerEl?.offsetHeight ?? 0)
    : (answerInner?.scrollHeight ?? 0) + 32 * window.innerWidth / 1920
  const heightDelta = wasOpen ? -expansion : expansion

  // If a different item was open ABOVE, its collapse shifts the current item up.
  // Use the same integer-based measurement for the previous item's expansion.
  let topDelta = 0
  if (prevKey && prevKey !== key) {
    const prevIndex = props.items.findIndex(i => i._key === prevKey)
    if (prevIndex !== -1 && prevIndex < index) {
      const prevEl = itemRefs.value[prevIndex]
      const prevHeader = prevEl?.querySelector<HTMLElement>('.faq-item__header')
      topDelta = -((prevEl?.offsetHeight ?? 0) - (prevHeader?.offsetHeight ?? 0))
    }
  }

  expanded.value = wasOpen ? null : key

  const stale = itemTimelines[index]?.scrollTrigger
  if (!lenis.value || !stale)
    return

  isSnapping.value = true
  lenis.value.scrollTo(stale.start + (stale.end - stale.start) * 0.5 + topDelta + heightDelta * 0.5, { duration: 1 })

  setTimeout(() => {
    ScrollTrigger.refresh()
    const fresh = itemTimelines[index]?.scrollTrigger
    if (fresh && lenis.value)
      lenis.value.scrollTo(fresh.start + (fresh.end - fresh.start) * 0.5, { duration: 0.5 })
    isSnapping.value = false
  }, 450)
}

onMounted(() => {
  ctx = gsap.context(() => {
    itemRefs.value.forEach((item, i) => {
      const bg = item.querySelector<HTMLElement>('.faq-item__bg')
      const bgContent = item.querySelector<HTMLElement>('.faq-item__bg-content')

      itemTimelines[i] = gsap.timeline({
        scrollTrigger: {
          trigger: item,
          start: 'top-=12.5% center',
          end: 'bottom+=12.5% center',
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
        .fromTo(bg, { yPercent: -100 }, { yPercent: 100, ease: 'none' }, 0)
        .fromTo(bgContent, { yPercent: 100 }, { yPercent: -100, ease: 'none' }, 0)
    })
  }, rootRef.value ?? undefined)
})

onUnmounted(() => {
  if (refreshTimer)
    clearTimeout(refreshTimer)
  ctx?.revert()
  itemTimelines.length = 0
})
</script>

<template>
  <section ref="rootRef" class="app-elements-faq" :class="{ 'is-snapping': isSnapping }">
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
              <TextsH3 :selectable="false" color="beige-100" class="faq-item__question">
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

  &:first-child {
    border-top: 3px solid var(--c-black-100);
    margin-top: 0;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: desktop-vw(64px);
    padding: desktop-vw(32px) 0;
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

    &.is-open {
      transform: rotate(90deg);
    }

    .svg-logo {
      width: desktop-vw(28px);
      height: auto;
    }
  }

  &__answer-wrapper {
    display: grid;
    grid-template-rows: 0fr;
    overflow: hidden;
    transition:
      grid-template-rows 0.4s var(--ease-out-cubic),
      padding-bottom 0.4s var(--ease-out-cubic);

    &.is-expanded {
      grid-template-rows: 1fr;
      padding-bottom: desktop-vw(32px);
    }
  }

  &__answer-inner {
    overflow: hidden;
    width: 72.5%;
    display: block;
    white-space: pre-wrap;
  }

  &__answer-text {
    display: block;
    font-size: desktop-vw(26px);
    line-height: desktop-vw(30px);
  }

  &__bg {
    position: absolute;
    inset: 0;
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
  }
}
</style>
