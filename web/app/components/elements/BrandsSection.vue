<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import gsap from 'gsap'

const brandsLeft = [
  { name: 'Ferrari', image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=700&h=700&fit=crop' },
  { name: 'Lamborghini', image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=700&h=700&fit=crop' },
  { name: 'McLaren', image: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=700&h=700&fit=crop' },
  { name: 'Aston Martin', image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=700&h=700&fit=crop' },
  { name: 'Alfa Romeo', image: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=700&h=700&fit=crop' },
  { name: 'Jaguar', image: 'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?w=700&h=700&fit=crop' },
  { name: 'Chevrolet Corvette', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=700&h=700&fit=crop' },
  { name: 'Dodge', image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=700&h=700&fit=crop' },
  { name: 'Mustang', image: 'https://images.unsplash.com/photo-1547744152-14d985cb937f?w=700&h=700&fit=crop' },
  { name: 'Koenigsegg', image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=700&h=700&fit=crop' },
  { name: 'Pagani', image: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=700&h=700&fit=crop' },
]

const brandsRight = [
  { name: 'Mercedes-Benz', image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=700&h=700&fit=crop' },
  { name: 'Audi', image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=700&h=700&fit=crop' },
  { name: 'Bentley', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=700&h=700&fit=crop' },
  { name: 'Rolls-Royce', image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=700&h=700&fit=crop' },
  { name: 'Maserati', image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=700&h=700&fit=crop' },
  { name: 'Lexus', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=700&h=700&fit=crop' },
  { name: 'Nissan GT-R', image: 'https://images.unsplash.com/photo-1611566026373-c6c8da0ea861?w=700&h=700&fit=crop' },
  { name: 'Toyota Supra', image: 'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=700&h=700&fit=crop' },
  { name: 'Honda NSX', image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=700&h=700&fit=crop' },
  { name: 'Mazda RX-7', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&h=700&fit=crop' },
  { name: '50+', image: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=700&h=700&fit=crop' },
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
    if (!image) return

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
          <TextsH3 :color="hoveredBrand === brand.name ? 'orange' : 'beige-100'">
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
          <TextsH3 :color="hoveredBrand === brand.name ? 'orange' : 'beige-100'">
            {{ brand.name }}
          </TextsH3>
        </li>
      </ul>

      <TextsP2 class="app-elements-brands-section__description" color="beige-100">
        Une collection soigneusement sélectionnée.
      </TextsP2>
    </div>
  </section>
</template>

<style lang="scss">
.app-elements-brands-section {
  width: 100%;
  background: var(--c-black-100);
  padding: desktop-vw(40px) desktop-vw(24px);

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
}

.brand-item {
  cursor: pointer;

  &.is-hovered {
    position: relative;
    z-index: 10;
  }
}
</style>
