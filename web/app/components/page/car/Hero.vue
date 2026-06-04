<script setup lang="ts">
import type { CarDetailData } from '~/queries/car'
import useEmblaCarousel from 'embla-carousel-vue'

const props = defineProps<{ car: CarDetailData }>()

const { t } = useI18n()

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

const hasGallery = computed(() => slides.value.length > 1)

const emblaOptions = computed(() => ({
  loop: hasGallery.value,
  align: 'center' as const,
  watchDrag: hasGallery.value,
  duration: 24,
}))
const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions)

const activeSlide = ref(0)

// On monte TOUTES les slides (pas de gating ±buffer) : en loop, démonter/remonter une
// slide recrée l'overlay et rejoue le reveal sur une image déjà chargée. Le variant
// `panel` (pas de backdrop-filter) + l'auto-unmount de l'overlay gardent ça peu coûteux,
// donc chaque image ne se révèle qu'une seule fois. La slide 0 charge en priorité haute,
// les autres en `low` (préchargées sans bloquer le LCP).

const analytics = useAnalytics()
function onSelect() {
  const api = emblaApi.value
  if (!api)
    return
  const i = api.selectedScrollSnap()
  if (i === activeSlide.value)
    return
  activeSlide.value = i
  analytics.trackCarGalleryBrowse({
    car_id: props.car._id,
    car_brand: props.car.marque,
    car_model: props.car.modele,
    image_index: i,
    total: slides.value.length,
  })
}

watch(emblaApi, (api) => {
  if (!api)
    return
  api.on('select', onSelect)
  api.on('reInit', onSelect)
})

// Re-measure Embla when the slide set changes (e.g. lang switch refetch).
watch(slides, () => {
  activeSlide.value = 0
  nextTick(() => emblaApi.value?.reInit())
})

function scrollTo(i: number) {
  emblaApi.value?.scrollTo(i)
}
</script>

<template>
  <section class="car-hero" :class="{ 'car-hero--draggable': hasGallery }">
    <div ref="emblaRef" class="car-hero__embla">
      <div class="car-hero__embla-container">
        <div
          v-for="(slide, i) in slides"
          :key="i"
          class="car-hero__slide"
        >
          <ElementsMedia
            :src="slide.url"
            :alt="slide.alt"
            provider="sanity"
            :hotspot="slide.hotspot"
            :crop="slide.crop"
            :lazy="false"
            :fetch-priority="i === 0 ? 'high' : 'low'"
            :preload="i === 0 ? { fetchPriority: 'high' } : false"
            :overlay="{ variant: 'panel', color: 'orange-100', duration: 0.5 }"
            :modifiers="{ quality: 80 }"
            sizes="sm:100vw xl:100vw"
          />
        </div>
      </div>
      <div v-if="!slides.length" class="car-hero__placeholder" />
    </div>

    <UtilsBaseLink :to="{ name: 'catalogue' }" class="car-hero__back" :aria-label="t('car.hero.backToCatalogue')">
      <SvgIconComplexArrow />
    </UtilsBaseLink>

    <div v-if="hasGallery" class="car-hero__dots">
      <button
        v-for="(_, i) in slides"
        :key="i"
        type="button"
        class="car-hero__dot"
        :class="{ 'car-hero__dot--active': i === activeSlide }"
        :aria-label="t('car.hero.imageNumber', { n: i + 1 })"
        @click="scrollTo(i)"
      />
    </div>
  </section>
</template>

<style lang="scss">
.car-hero {
  position: relative;
  width: 100%;
  height: desktop-vw(950px);
  max-height: 85dvh;
  overflow: hidden;
  background: var(--c-beige-20);

  @include mobile {
    height: mobile-vw(680px);
  }

  &--draggable {
    .car-hero__embla {
      cursor: grab;

      &:active {
        cursor: grabbing;
      }
    }
  }

  &__embla {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  &__embla-container {
    display: flex;
    height: 100%;
    user-select: none;
    touch-action: pan-y;
  }

  &__slide {
    position: relative;
    flex: 0 0 100%;
    min-width: 0;
    height: 100%;

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
    position: fixed;
    top: desktop-vw(16px);
    left: desktop-vw(16px);
    padding: desktop-vw(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;

    @include mobile {
      display: none;
    }

    .svg-icon-complex-arrow {
      width: desktop-vw(48px);
      height: desktop-vw(48px);
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
    gap: desktop-vw(12px);
    padding: desktop-vw(24px);
    z-index: 2;
  }

  &__dot {
    width: desktop-vw(18px);
    height: desktop-vw(18px);
    border-radius: 50%;
    background: var(--c-white-60);
    border: none;
    padding: 0;
    cursor: pointer;
    box-shadow: 0 desktop-vw(1px) desktop-vw(6px) rgba(0, 0, 0, 0.45);
    transition: background 0.25s ease;

    &--active {
      background: var(--c-white);
    }

    @include hover {
      &:hover {
        background: var(--c-white);
      }
    }
  }
}
</style>
