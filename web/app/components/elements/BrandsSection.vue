<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import gsap from 'gsap'

const brandsLeft = [
  { name: 'Ferrari', image: '/img/placeholder/brands/ferrari.jpg' },
  { name: 'Lamborghini', image: '/img/placeholder/brands/lamborghini.jpg' },
  { name: 'McLaren', image: '/img/placeholder/brands/mclaren.jpg' },
  { name: 'Aston Martin', image: '/img/placeholder/brands/aston-martin.jpg' },
  { name: 'Alfa Romeo', image: '/img/placeholder/brands/alfa-romeo.jpg' },
  { name: 'Jaguar', image: '/img/placeholder/brands/jaguar.jpg' },
  { name: 'Chevrolet Corvette', image: '/img/placeholder/brands/corvette.jpg' },
  { name: 'Dodge', image: '/img/placeholder/brands/dodge.jpg' },
  { name: 'Mustang', image: '/img/placeholder/brands/mustang.jpg' },
  { name: 'Koenigsegg', image: '/img/placeholder/brands/koenigsegg.jpg' },
  { name: 'Pagani', image: '/img/placeholder/brands/pagani.jpg' },
]

const brandsRight = [
  { name: 'Mercedes-Benz', image: '/img/placeholder/brands/mercedes.jpg' },
  { name: 'Audi', image: '/img/placeholder/brands/audi.jpg' },
  { name: 'Bentley', image: '/img/placeholder/brands/bentley.jpg' },
  { name: 'Rolls-Royce', image: '/img/placeholder/brands/rolls-royce.jpg' },
  { name: 'Maserati', image: '/img/placeholder/brands/maserati.jpg' },
  { name: 'Lexus', image: '/img/placeholder/brands/lexus.jpg' },
  { name: 'Nissan GT-R', image: '/img/placeholder/brands/nissan-gtr.jpg' },
  { name: 'Toyota Supra', image: '/img/placeholder/brands/toyota-supra.jpg' },
  { name: 'Honda NSX', image: '/img/placeholder/brands/honda-nsx.jpg' },
  { name: 'Mazda RX-7', image: '/img/placeholder/brands/mazda-rx7.jpg' },
  { name: '50+', image: '/img/placeholder/brands/collection.jpg' },
]

const allBrands = [...brandsLeft, ...brandsRight]

const rootRef = ref<HTMLElement | null>(null)
const cursorImageRef = ref<{ $el: HTMLElement } | null>(null)
const hoveredBrand = ref<string | null>(null)

const cursorSrc = computed(
  () => allBrands.find(b => b.name === hoveredBrand.value)?.image ?? '',
)

let setX: gsap.QuickToFunc | null = null
let setY: gsap.QuickToFunc | null = null
let fade: gsap.core.Tween | null = null
let stopFollow: (() => void) | null = null
let firstEnter = false
let ctx: gsap.Context | null = null

function align(e: MouseEvent) {
  if (firstEnter) {
    setX?.(e.clientX, e.clientX)
    setY?.(e.clientY, e.clientY)
    firstEnter = false
  }
  else {
    setX?.(e.clientX)
    setY?.(e.clientY)
  }
}

function onBrandEnter(name: string, e: MouseEvent) {
  hoveredBrand.value = name
  firstEnter = true
  fade?.play()
  stopFollow = useEventListener(document, 'mousemove', align)
  align(e)
}

function onBrandLeave() {
  hoveredBrand.value = null
  fade?.reverse()
}

onMounted(async () => {
  await nextTick()

  ctx = gsap.context(() => {
    const image = cursorImageRef.value?.$el
    if (!image)
      return

    gsap.set(image, { xPercent: -50, yPercent: -50 })

    setX = gsap.quickTo(image, 'x', { duration: 0.4, ease: 'power3' })
    setY = gsap.quickTo(image, 'y', { duration: 0.4, ease: 'power3' })

    fade = gsap.to(image, {
      autoAlpha: 1,
      ease: 'none',
      paused: true,
      duration: 0.1,
      onReverseComplete: () => {
        stopFollow?.()
        stopFollow = null
      },
    })
  }, rootRef.value ?? undefined)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <section ref="rootRef" class="app-elements-brands-section">
    <ElementsMedia
      ref="cursorImageRef"
      class="app-elements-brands-section__cursor"
      :src="cursorSrc"
    />

    <div class="app-elements-brands-section__inner">
      <ul class="app-elements-brands-section__list">
        <li
          v-for="brand in brandsLeft"
          :key="brand.name"
          class="brand-item"
          :class="{ 'is-hovered': hoveredBrand === brand.name }"
          @mouseenter="(e) => onBrandEnter(brand.name, e)"
          @mouseleave="onBrandLeave"
        >
          <TextsH3 :selectable="false" :color="hoveredBrand === brand.name ? 'orange' : 'beige-100'">
            {{ brand.name }}
          </TextsH3>
        </li>
      </ul>

      <div class="app-elements-brands-section__divider" aria-hidden="true" />

      <ul class="app-elements-brands-section__list">
        <li
          v-for="brand in brandsRight"
          :key="brand.name"
          class="brand-item"
          :class="{ 'is-hovered': hoveredBrand === brand.name }"
          @mouseenter="(e) => onBrandEnter(brand.name, e)"
          @mouseleave="onBrandLeave"
        >
          <TextsH3 :selectable="false" :color="hoveredBrand === brand.name ? 'orange' : 'beige-100'">
            {{ brand.name }}
          </TextsH3>
        </li>
      </ul>

      <TextsP2 class="app-elements-brands-section__description" color="beige-100">
        Une collection soigneusement sélectionnée.
      </TextsP2>
    </div>

    <div class="app-elements-brands-section__text">
      <div class="app-elements-brands-section__text-content">
        <div class="app-elements-brands-section__text-headline">
          <TextsP2 color="beige-100">
            (de A à Z)
          </TextsP2>
          <TextsH3 color="beige-100">
            Chaque réservation est prise en charge par un conseiller dédié.
          </TextsH3>
        </div>

        <TextsH3 color="beige-100">
          Nous orchestrons l'ensemble de la prestation pour vous garantir une expérience fluide, précise et sans compromis.
        </TextsH3>

        <AtomsCTA theme="white" :tiret-after="0">
          Contacter un conseiller
        </AtomsCTA>
      </div>
    </div>
  </section>
</template>

<style lang="scss">
.app-elements-brands-section {
  width: 100%;
  background: var(--c-black-100);

  &__cursor {
    position: fixed;
    top: 0;
    left: 0;
    width: desktop-vw(350px);
    height: desktop-vw(350px);
    z-index: 9;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
  }

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
  cursor: pointer;

  &.is-hovered {
    position: relative;
    z-index: 10;
  }
}
</style>
