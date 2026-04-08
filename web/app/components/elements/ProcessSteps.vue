<script setup lang="ts">
import gsap from 'gsap'
import { useLenis } from 'lenis/vue'

const items = [
  { number: '(A)', label: 'Prise de contact', description: 'Vous nous exposez votre besoin et le contexte.' },
  { number: '(B)', label: 'Accompagnement & sélection', description: 'Gestion administrative' },
  { number: '(C)', label: 'Validation', description: 'Maîtrise de l’usage & du contexte' },
  { number: '(D)', label: 'Confirmation', description: 'Suivi & restitution du véhicule' },
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
      distanceThreshold: '10%',
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
        },
      })

      tl.fromTo(bg, { yPercent: -100 }, { yPercent: 100, ease: 'none' }, 0)
      tl.fromTo(bgContent, { yPercent: 100 }, { yPercent: -100, ease: 'none' }, 0)

      // Label ↔ description swap
      let swapTl: gsap.core.Timeline | null = null
      let leaving = false

      const showDescription = () => {
        if (leaving)
          return
        swapTl?.kill()
        swapTl = gsap.timeline()
          .to(labels, { yPercent: -100, duration: 0.35, ease: 'power2.in' }, 0)
          .fromTo(descriptions, { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: 'power2.out' }, 0.25)
      }

      const showLabel = () => {
        leaving = true
        swapTl?.kill()
        swapTl = gsap.timeline()
          .to(descriptions, { yPercent: 100, duration: 0.3, ease: 'power2.in' }, 0)
          .to(labels, { yPercent: 0, duration: 0.4, ease: 'power2.out' }, 0.2)
          .call(() => { leaving = false })
      }

      gsap.timeline({
        scrollTrigger: {
          trigger: item,
          start: 'center-=25% center',
          end: 'center+=25% center',
          onEnter: showDescription,
          onEnterBack: showDescription,
          onLeave: showLabel,
          onLeaveBack: showLabel,
        },
      })
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
        <TextsH3 class="process-step__number" color="orange-100">
          {{ step.number }}
        </TextsH3>

        <div class="process-step__main">
          <TextsH3 tag="span" class="process-step__label" color="orange-100">
            {{ step.label }}
          </TextsH3>
          <TextsH3 tag="span" class="process-step__description" color="orange-100">
            {{ step.description }}
          </TextsH3>
        </div>

        <div aria-hidden="true" class="process-step__bg">
          <div class="process-step__bg-content">
            <TextsH3 class="process-step__number" color="beige-100">
              {{ step.number }}
            </TextsH3>
            <div class="process-step__main">
              <TextsH3 tag="span" class="process-step__label" color="beige-100">
                {{ step.label }}
              </TextsH3>
              <TextsH3 tag="span" class="process-step__description" color="beige-100">
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
