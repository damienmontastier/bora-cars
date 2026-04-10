<script setup lang="ts">
import gsap from 'gsap'
import { useLenis } from 'lenis/vue'

interface ProcessStep {
  _key: string
  title: string
  description?: string
}

interface Props { steps: ProcessStep[] }

const props = defineProps<Props>()

const items = computed(() =>
  props.steps.map((step, index) => ({
    ...step,
    number: `(${String.fromCharCode(65 + index)})`,
  })),
)

// 'click' = snap au click uniquement | 'scroll' = snap au scroll + click
const SNAP_MODE: 'click' | 'scroll' = 'click'

const rootRef = ref<HTMLElement | null>(null)
const isSnapping = ref(false)
const lenis = useLenis()
let ctx: gsap.Context | null = null
let snap: { destroy: () => void, goTo: (index: number) => void, stop: () => void, start: () => void, addElements: (elements: HTMLElement[], options?: object) => void } | null = null

function snapToStep(index: number) {
  isSnapping.value = true
  snap?.goTo(index)
}

onMounted(async () => {
  const { default: LenisSnap } = await import('lenis/snap')

  if (lenis.value && rootRef.value) {
    snap = new LenisSnap(lenis.value, {
      type: 'proximity',
      distanceThreshold: '15%',
      debounce: 300,
      onSnapStart: () => { isSnapping.value = true },
      onSnapComplete: () => {
        isSnapping.value = false
        if (SNAP_MODE === 'click')
          snap?.stop()
      },
    })

    snap.addElements(
      Array.from(rootRef.value.querySelectorAll<HTMLElement>('.process-step')),
      { align: ['center'] },
    )

    if (SNAP_MODE === 'click')
      snap.stop()
  }

  ctx = gsap.context(() => {
    const items = gsap.utils.toArray<HTMLElement>('.process-step', rootRef.value)

    items.forEach((item) => {
      const bg = item.querySelector<HTMLElement>('.process-step__bg')
      const bgContent = item.querySelector<HTMLElement>('.process-step__bg-content')
      const labels = item.querySelectorAll<HTMLElement>('.process-step__label')
      const descriptions = item.querySelectorAll<HTMLElement>('.process-step__description')

      gsap.set(descriptions, { yPercent: 100 })
      gsap.set(labels, { yPercent: 0 })

      // Background mask sweep
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: item,
          start: 'top-=12.5% center',
          end: 'bottom+=12.5% center',
          scrub: true,
          invalidateOnRefresh: true,
        },
      })

      tl.fromTo(bg, { yPercent: -100 }, { yPercent: 100, ease: 'none' }, 0)
      tl.fromTo(bgContent, { yPercent: 100 }, { yPercent: -100, ease: 'none' }, 0)

      // Label ↔ description swap
      let swapTl: gsap.core.Timeline | null = null

      const showDescription = () => {
        swapTl?.kill()
        swapTl = gsap.timeline()
          .to(labels, { yPercent: -100, duration: 0.35, ease: 'power2.in' }, 0)
          .to(descriptions, { yPercent: 0, duration: 0.5, ease: 'power2.out' }, 0.25)
      }

      const showLabel = () => {
        swapTl?.kill()
        swapTl = gsap.timeline()
          .to(descriptions, { yPercent: 100, duration: 0.3, ease: 'power2.in' }, 0)
          .to(labels, { yPercent: 0, duration: 0.4, ease: 'power2.out' }, 0.2)
      }

      gsap.timeline({
        scrollTrigger: {
          trigger: item,
          start: 'center-=35% center',
          end: 'center+=50% center',
          onEnter: showDescription,
          onEnterBack: showDescription,
          onLeave: showLabel,
          onLeaveBack: showLabel,
          fastScrollEnd: true,
          preventOverlaps: true,
        },
      })
    })
  }, rootRef.value ?? undefined)
})

onUnmounted(() => {
  snap?.destroy()
  ctx?.revert()
})
</script>

<template>
  <section ref="rootRef" v-menu-theme="'orange'" class="app-elements-process-steps" :class="{ 'is-snapping': isSnapping }">
    <ol class="app-elements-process-steps__list">
      <li
        v-for="(step, index) in items"
        :key="step._key"
        class="process-step"
        @click="snapToStep(index)"
      >
        <TextsH3 :selectable="false" class="process-step__number" color="orange-100">
          {{ step.number }}
        </TextsH3>

        <div class="process-step__main">
          <TextsH3 tag="span" :selectable="false" class="process-step__label" color="orange-100">
            {{ step.title }}
          </TextsH3>
          <TextsH3 tag="span" :selectable="false" class="process-step__description" color="orange-100">
            {{ step.description }}
          </TextsH3>
        </div>

        <div aria-hidden="true" class="process-step__bg">
          <div class="process-step__bg-content">
            <TextsH3 :selectable="false" class="process-step__number" color="beige-100">
              {{ step.number }}
            </TextsH3>
            <div class="process-step__main">
              <TextsH3 tag="span" :selectable="false" class="process-step__label" color="beige-100">
                {{ step.title }}
              </TextsH3>
              <TextsH3 tag="span" :selectable="false" class="process-step__description" color="beige-100">
                {{ step.description }}
              </TextsH3>
            </div>
          </div>
        </div>
      </li>
    </ol>
  </section>
</template>

<style lang="scss">
.app-elements-process-steps {
  width: 100%;
  padding: desktop-vw(24px) desktop-vw(24px);

  &__list {
    width: 100%;
    list-style: none;
    margin: 0;
    padding: 0;
  }
}

.process-step {
  display: flex;
  align-items: center;
  padding: desktop-vw(32px) 0;
  position: relative;
  overflow: hidden;
  gap: desktop-vw(64px);
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--c-orange-100);
    pointer-events: none;
    z-index: 2;
    mix-blend-mode: screen;
  }

  &__bg {
    position: absolute;
    top: -3px;
    bottom: -3px;
    left: 0;
    right: 0;
    background: var(--c-orange);
    pointer-events: none;
    z-index: 1;
    overflow: hidden;
  }

  &__bg-content {
    display: flex;
    align-items: center;
    padding: desktop-vw(32px) 0;
    height: 100%;
    gap: desktop-vw(64px);
  }

  &__number {
    flex-shrink: 0;
  }

  &__main {
    position: relative;
    flex: 1;
    overflow: hidden;
  }

  &__label,
  &__description {
    display: block;
  }

  &__description {
    position: absolute;
    top: 0;
    left: 0;
  }
}
</style>
