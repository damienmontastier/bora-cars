<script setup lang="ts">
import type { BrandsSection } from '~/queries/home'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface Props { data: BrandsSection | null }

const props = defineProps<Props>()

const settings = useSettings()

const rootRef = ref<HTMLElement | null>(null)
const hoveredBrand = ref<string | null>(null)
let ctx: gsap.Context | null = null

onMounted(async () => {
  await nextTick()

  ctx = gsap.context(() => {
    let firstEnter = false
    let activeFade: gsap.core.Tween | null = null

    ScrollTrigger.create({
      trigger: rootRef.value,
      start: 'top bottom',
      end: 'bottom top',
      onLeave: () => activeFade?.reverse(),
      onLeaveBack: () => activeFade?.reverse(),
    })

    gsap.utils.toArray<HTMLElement>('.brand-item').forEach((el) => {
      const image = el.querySelector<HTMLElement>('.brand-item__cursor')
      if (!image)
        return

      gsap.set(image, { xPercent: -50, yPercent: -50 })

      const setX = gsap.quickTo(image, 'x', { duration: 0.4, ease: 'power3' })
      const setY = gsap.quickTo(image, 'y', { duration: 0.4, ease: 'power3' })

      function align(e: MouseEvent) {
        if (firstEnter) {
          setX(e.clientX, e.clientX)
          setY(e.clientY, e.clientY)
          firstEnter = false
        }
        else {
          setX(e.clientX)
          setY(e.clientY)
        }
      }

      const startFollow = () => document.addEventListener('mousemove', align)
      const stopFollow = () => document.removeEventListener('mousemove', align)

      const brandName = el.dataset.brand ?? null

      const fade = gsap.to(image, {
        autoAlpha: 1,
        ease: 'none',
        paused: true,
        duration: 0.1,
        onReverseComplete: () => {
          stopFollow()
          activeFade = null
          if (hoveredBrand.value === brandName)
            hoveredBrand.value = null
        },
      })

      el.addEventListener('mouseenter', (e) => {
        hoveredBrand.value = el.dataset.brand ?? null
        firstEnter = true
        activeFade = fade
        fade.play()
        startFollow()
        align(e as MouseEvent)
      })

      el.addEventListener('mouseleave', () => fade.reverse())
    })
  }, rootRef.value ?? undefined)
})

console.log('data', props.data)

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <section ref="rootRef" v-menu-theme="'white'" class="app-elements-brands-section">
    <div class="app-elements-brands-section__inner">
      <ul class="app-elements-brands-section__list">
        <li
          v-for="(car, i) in data?.carsLeft"
          :key="`left-${i}`"
          class="brand-item"
          :data-brand="`left-${i}`"
          :class="{ 'is-hovered': hoveredBrand === `left-${i}` }"
        >
          <NuxtImg v-if="car.imageUrl" class="brand-item__cursor" :src="car.imageUrl" :alt="`${car.marque} ${car.modele}`" provider="sanity" loading="eager" />
          <div v-else class="brand-item__cursor" />
          <TextsH3 :selectable="false" :color="hoveredBrand === `left-${i}` ? 'orange' : 'beige-100'">
            {{ car.marque }} {{ car.modele }}
          </TextsH3>
        </li>
      </ul>

      <div class="app-elements-brands-section__divider" aria-hidden="true" />

      <ul class="app-elements-brands-section__list">
        <li
          v-for="(car, i) in data?.carsRight"
          :key="`right-${i}`"
          class="brand-item"
          :data-brand="`right-${i}`"
          :class="{ 'is-hovered': hoveredBrand === `right-${i}` }"
        >
          <NuxtImg v-if="car.imageUrl" class="brand-item__cursor" :src="car.imageUrl" :alt="`${car.marque} ${car.modele}`" provider="sanity" loading="eager" />
          <div v-else class="brand-item__cursor" />
          <TextsH3 :selectable="false" :color="hoveredBrand === `right-${i}` ? 'orange' : 'beige-100'">
            {{ car.marque }} {{ car.modele }}
          </TextsH3>
        </li>
      </ul>

      <TextsP2 v-if="data?.description" class="app-elements-brands-section__description" color="beige-100">
        {{ data.description }}
      </TextsP2>
    </div>

    <div class="app-elements-brands-section__text">
      <div class="app-elements-brands-section__text-content">
        <div class="app-elements-brands-section__text-headline">
          <TextsP2 v-if="data?.surtitle" color="beige-100">
            {{ data.surtitle }}
          </TextsP2>
          <TextsH3 v-if="data?.heading" color="beige-100">
            {{ data.heading }}
          </TextsH3>
        </div>

        <AtomsCTA v-if="settings?.contactLink?.text" theme="white" :tiret-after="0" :to="settings.contactLink">
          {{ settings.contactLink.text }}
        </AtomsCTA>
      </div>
    </div>
  </section>
</template>

<style lang="scss">
.app-elements-brands-section {
  width: 100%;
  background: var(--c-black-100);

  &__inner {
    display: flex;
    align-items: flex-start;
    gap: desktop-vw(36px);
    padding: desktop-vw(40px) desktop-vw(24px);
  }

  &__list {
    flex: 1;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  &__divider {
    flex-shrink: 0;
    width: 3px;
    align-self: stretch;
    background: var(--c-beige-100);
  }

  &__description {
    flex-shrink: 0;
    width: desktop-vw(312px);
  }

  &__text {
    display: flex;
    justify-content: flex-end;
    padding: desktop-vw(80px) desktop-vw(24px);

    &-content {
      width: 60%;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: desktop-vw(32px);
    }

    &-headline {
      width: 100%;

      .P2,
      .H3 {
        display: inline;
      }

      .P2 {
        margin-right: desktop-vw(16px);
      }
    }
  }
}

.brand-item {
  position: relative;
  cursor: pointer;

  &__cursor {
    position: fixed;
    top: 0;
    left: 0;
    width: desktop-vw(350px);
    height: desktop-vw(350px);
    aspect-ratio: 1 / 1;
    z-index: 9;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    object-fit: cover;
  }

  &.is-hovered .H3 {
    position: relative;
    z-index: 10;
  }
}
</style>
