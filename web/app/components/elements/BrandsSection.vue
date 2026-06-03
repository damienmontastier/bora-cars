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
    const mm = gsap.matchMedia()

    mm.add('(min-width: 800px)', () => {
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

        const onEnter = (e: Event) => {
          hoveredBrand.value = el.dataset.brand ?? null
          firstEnter = true
          activeFade = fade
          fade.play()
          startFollow()
          align(e as MouseEvent)
        }
        const onLeave = () => fade.reverse()

        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)

        return () => {
          el.removeEventListener('mouseenter', onEnter)
          el.removeEventListener('mouseleave', onLeave)
          stopFollow()
        }
      })
    })

    mm.add('(max-width: 799px)', () => {
      gsap.utils.toArray<HTMLElement>('.brand-item').forEach((el) => {
        const image = el.querySelector<HTMLElement>('.brand-item__cursor')
        if (!image)
          return

        const brandName = el.dataset.brand ?? null

        gsap.set(image, { autoAlpha: 0 })

        const fadeIn = () => {
          hoveredBrand.value = brandName
          gsap.to(image, { autoAlpha: 1, duration: 0.4, ease: 'power2.out', overwrite: true })
        }
        const fadeOut = () => {
          if (hoveredBrand.value === brandName)
            hoveredBrand.value = null
          gsap.to(image, { autoAlpha: 0, duration: 0.4, ease: 'power2.out', overwrite: true })
        }

        ScrollTrigger.create({
          trigger: el,
          start: 'top center',
          end: 'bottom center',
          onEnter: fadeIn,
          onLeave: fadeOut,
          onEnterBack: fadeIn,
          onLeaveBack: fadeOut,
        })
      })
    })
  }, rootRef.value ?? undefined)
})

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
          <NuxtImg v-if="car.imageUrl" class="brand-item__cursor" :src="car.imageUrl" :alt="`${car.marque} ${car.modele}`" provider="sanity" sizes="56vw sm:35vw xl:35vw" loading="eager" />
          <div v-else class="brand-item__cursor" />
          <UtilsBaseLink :to="{ name: 'car-uid', params: { uid: car.slug } }">
            <TextsH3 :selectable="false" :color="hoveredBrand === `left-${i}` ? 'orange' : 'beige-100'">
              {{ car.marque }} {{ car.modele }}
            </TextsH3>
          </UtilsBaseLink>
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
          <NuxtImg v-if="car.imageUrl" class="brand-item__cursor" :src="car.imageUrl" :alt="`${car.marque} ${car.modele}`" provider="sanity" sizes="56vw sm:20vw xl:20vw" loading="eager" />
          <div v-else class="brand-item__cursor" />
          <UtilsBaseLink :to="{ name: 'car-uid', params: { uid: car.slug } }">
            <TextsH3 :selectable="false" :color="hoveredBrand === `right-${i}` ? 'orange' : 'beige-100'">
              {{ car.marque }} {{ car.modele }}
            </TextsH3>
          </UtilsBaseLink>
        </li>
      </ul>

      <div class="app-elements-brands-section__cta-block">
        <TextsP2 v-if="data?.description" class="app-elements-brands-section__description" color="beige-100">
          {{ data.description }}
        </TextsP2>
        <AtomsCTA v-if="data?.cta?.text" theme="white" :tiret-after="0" :to="data.cta">
          {{ data.cta.text }}
        </AtomsCTA>
      </div>
    </div>

    <div class="app-elements-brands-section__text">
      <div class="app-elements-brands-section__text-content">
        <div class="app-elements-brands-section__text-headline">
          <TextsH3 v-if="data?.heading" color="beige-100">
            <TextsP2 v-if="data?.surtitle" tag="span" color="beige-100">
              {{ data.surtitle }}
            </TextsP2>
            {{ data.heading }}
          </TextsH3>
          <TextsP2 v-else-if="data?.surtitle" color="beige-100">
            {{ data.surtitle }}
          </TextsP2>
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

  *::selection {
    background-color: var(--c-beige-40);
    color: var(--c-beige-100);
  }

  &__inner {
    display: flex;
    align-items: flex-start;
    gap: desktop-vw(36px);
    padding: desktop-vw(40px) desktop-vw(24px);

    @include mobile {
      flex-direction: column;
      gap: 0px;
      padding: mobile-vw(70px) mobile-vw(16px);
      overflow: hidden;
    }
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

    @include mobile {
      display: none;
    }
  }

  &__cta-block {
    flex-shrink: 0;
    width: desktop-vw(312px);
    display: flex;
    flex-direction: column;
    gap: desktop-vw(24px);

    @include mobile {
      width: 85%;
      gap: mobile-vw(16px);
      align-self: flex-end;
      margin-top: mobile-vw(48px);
      align-items: flex-end;
    }

    .P2 {
      @include mobile {
        text-align: right;
        width: 65%;
        align-self: flex-end;
      }
    }
  }

  &__text {
    display: flex;
    justify-content: flex-end;
    padding: desktop-vw(80px) desktop-vw(24px);

    @include mobile {
      padding: mobile-vw(24px) mobile-vw(16px);
    }

    &-content {
      width: 55%;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: desktop-vw(32px);

      @include mobile {
        width: 100%;
        gap: mobile-vw(40px);
      }
    }

    &-headline {
      width: 85%;
      margin-right: desktop-vw(80px);

      @include mobile {
        width: 100%;
        margin-right: 0;
      }

      .H3 {
        white-space: pre-line;
      }

      .H3 .P2 {
        margin-right: desktop-vw(16px);

        @include mobile {
          display: block;
          margin-right: 0;
          margin-bottom: mobile-vw(8px);
        }
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

    @include mobile {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(0%, -50%);
      width: mobile-vw(231px);
      height: auto;
      max-inline-size: none;
      max-block-size: none;
      aspect-ratio: 231 / 151;
    }
  }

  &.is-hovered .H3 {
    position: relative;
    z-index: 10;
  }
}
</style>
