<script setup>
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

defineProps({
  steps: {
    type: Array,
    default: () => [
      { number: '(A)', label: 'Recherche du véhicule' },
      { number: '(B)', label: 'Sélection & validation' },
      { number: '(C)', label: 'Prise en charge' },
      { number: '(D)', label: 'Livraison' },
    ],
  },
})

const rootRef = ref(null)
let ctx = null

onMounted(() => {
  ctx = gsap.context(() => {
    const items = gsap.utils.toArray('.process-step', rootRef.value)

    items.forEach((item) => {
      const bg = item.querySelector('.process-step__bg')
      const bgContent = item.querySelector('.process-step__bg-content')

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: item,
          start: 'top-=15% center',
          end: 'bottom+=15% center',
          scrub: true,
          markers: true,
        },
      })

      // bg slides down, content counter-slides up → text stays fixed in viewport
      tl.fromTo(bg, { yPercent: -100 }, { yPercent: 100, ease: 'none' }, 0)
      tl.fromTo(bgContent, { yPercent: 100 }, { yPercent: -100, ease: 'none' }, 0)
    })
  }, rootRef.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <section ref="rootRef" class="app-elements-process-steps">
    <ol class="app-elements-process-steps__list">
      <li
        v-for="step in steps"
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

        <!-- Sliding bg — text inside counter-animates to stay aligned with base text -->
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
  border-top: 1px solid var(--c-black-20);
  position: relative;
  overflow: hidden;
  color: var(--c-black-30);
  gap: desktop-vw(64px);

  &:last-child {
    border-bottom: 1px solid var(--c-black-20);
  }

  &__bg {
    position: absolute;
    inset: 0;
    background: var(--c-orange);
    color: var(--c-beige);
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
