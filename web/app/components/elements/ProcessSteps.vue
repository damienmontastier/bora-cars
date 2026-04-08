<script setup lang="ts">
import gsap from 'gsap'
import { useLenis } from 'lenis/vue'

const items = [
  { number: '(A)', label: 'Prise de contact' },
  { number: '(B)', label: 'Accompagnement & sélection' },
  { number: '(C)', label: 'Validation' },
  { number: '(D)', label: 'Confirmation' },
]

const rootRef = ref<HTMLElement | null>(null)
const lenis = useLenis()
let ctx: gsap.Context | null = null
let snap: { destroy: () => void } | null = null

onMounted(async () => {
  const { default: LenisSnap } = await import('lenis/snap')

  if (lenis.value && rootRef.value) {
    snap = new LenisSnap(lenis.value, {
      type: 'proximity',
      distanceThreshold: '15%',
      debounce: 650,
    })

    snap.addElements(
      rootRef.value.querySelectorAll('.process-step'),
      { align: ['center'] },
    )
  }

  ctx = gsap.context(() => {
    const items = gsap.utils.toArray<HTMLElement>('.process-step', rootRef.value)

    items.forEach((item) => {
      const bg = item.querySelector<HTMLElement>('.process-step__bg')
      const bgContent = item.querySelector<HTMLElement>('.process-step__bg-content')

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: item,
          start: 'top-=12.5% center',
          end: 'bottom+=12.5% center',
          scrub: true,
        },
      })

      tl.fromTo(bg, { yPercent: -100 }, { yPercent: 100, ease: 'none' }, 0)
      tl.fromTo(bgContent, { yPercent: 100 }, { yPercent: -100, ease: 'none' }, 0)
    })
  }, rootRef.value)
})

onUnmounted(() => {
  snap?.destroy()
  ctx?.revert()
})
</script>

<template>
  <section ref="rootRef" class="app-elements-process-steps">
    <ol class="app-elements-process-steps__list">
      <li
        v-for="step in items"
        :key="step.number"
        class="process-step"
      >
        <!-- Dim text, always visible beneath -->
        <TextsH3 class="process-step__number" color="orange-100">
          {{ step.number }}
        </TextsH3>
        <TextsH3 tag="span" class="process-step__label" color="orange-100">
          {{ step.label }}
        </TextsH3>

        <div aria-hidden="true" class="process-step__bg">
          <div class="process-step__bg-content">
            <TextsH3 class="process-step__number" color="beige-100">
              {{ step.number }}
            </TextsH3>
            <TextsH3 tag="span" class="process-step__label" color="beige-100">
              {{ step.label }}
            </TextsH3>
          </div>
        </div>
      </li>
    </ol>
  </section>
</template>

<style lang="scss">
.app-elements-process-steps {
  width: 100%;
  padding: 0 desktop-vw(24px);

  @include mobile {
    padding: 0 mobile-vw(24px);
  }

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
}
</style>
