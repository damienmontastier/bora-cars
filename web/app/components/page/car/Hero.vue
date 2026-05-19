<script setup lang="ts">
import type { CarDetailData } from '~/queries/car'

const props = defineProps<{ car: CarDetailData }>()

const slides = computed(() => {
  const c = props.car
  const out: { url: string, alt: string, hotspot?: any, crop?: any }[] = []
  if (c.imageUrl) {
    out.push({ url: c.imageUrl, alt: `${c.marque} ${c.modele}`, hotspot: c.imageHotspot, crop: c.imageCrop })
  }
  c.images?.forEach((img, i) => {
    if (img.imageUrl) {
      out.push({
        url: img.imageUrl,
        alt: img.imageAlt ?? `${c.marque} ${c.modele} ${i + 2}`,
        hotspot: img.imageHotspot,
        crop: img.imageCrop,
      })
    }
  })
  return out
})

const activeSlide = ref(0)
watch(slides, () => {
  activeSlide.value = 0
})
</script>

<template>
  <section class="car-hero">
    <div class="car-hero__media">
      <template v-for="(slide, i) in slides" :key="i">
        <ElementsMedia
          v-show="i === activeSlide"
          :src="slide.url"
          :alt="slide.alt"
          provider="sanity"
          :hotspot="slide.hotspot"
          :crop="slide.crop"
          :lazy="i !== 0"
          :preload="i === 0 ? { fetchPriority: 'high' } : false"
          :overlay="i === 0"
          overlay-color="beige"
        />
      </template>
      <div v-if="!slides.length" class="car-hero__placeholder" />
    </div>

    <UtilsBaseLink to="/catalogue" class="car-hero__back" aria-label="Retour au catalogue">
      <SvgIconArrow color="white" />
    </UtilsBaseLink>

    <div v-if="slides.length > 1" class="car-hero__dots">
      <button
        v-for="(_, i) in slides"
        :key="i"
        type="button"
        class="car-hero__dot"
        :class="{ 'car-hero__dot--active': i === activeSlide }"
        :aria-label="`Image ${i + 1}`"
        @click="activeSlide = i"
      />
    </div>
  </section>
</template>

<style lang="scss">
.car-hero {
  position: relative;
  width: 100%;
  height: desktop-vw(800px);
  overflow: hidden;
  background: var(--c-beige-20);

  @include mobile {
    height: mobile-vw(500px);
  }

  &__media {
    position: absolute;
    inset: 0;

    .app-elements-media {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }
  }

  &__placeholder {
    position: absolute;
    inset: 0;
    background: var(--c-beige-20);
  }

  &__back {
    position: absolute;
    top: desktop-vw(16px);
    left: desktop-vw(16px);
    width: desktop-vw(48px);
    height: desktop-vw(48px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;

    .svg-logo {
      width: 100%;
      height: 100%;
    }

    @include mobile {
      top: mobile-vw(12px);
      left: mobile-vw(12px);
      width: mobile-vw(40px);
      height: mobile-vw(40px);
    }
  }

  &__dots {
    position: absolute;
    bottom: desktop-vw(24px);
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: desktop-vw(8px);
    padding: desktop-vw(24px);
    z-index: 2;

    @include mobile {
      bottom: mobile-vw(16px);
      gap: mobile-vw(6px);
      padding: mobile-vw(16px);
    }
  }

  &__dot {
    width: desktop-vw(14px);
    height: desktop-vw(14px);
    border-radius: 50%;
    background: var(--c-white-40);
    border: none;
    padding: 0;
    cursor: pointer;
    transition: background 0.25s ease;

    &--active {
      background: var(--c-white);
    }

    @include hover {
      &:hover {
        background: var(--c-white);
      }
    }

    @include mobile {
      width: mobile-vw(10px);
      height: mobile-vw(10px);
    }
  }
}
</style>
