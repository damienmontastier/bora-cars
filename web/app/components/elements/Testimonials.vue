<script setup lang="ts">
import useEmblaCarousel from 'embla-carousel-vue'

interface BackgroundImage {
  imageUrl?: string
  imageAlt?: string
  imageHotspot?: { x: number, y: number, width: number, height: number }
  imageCrop?: { top: number, bottom: number, left: number, right: number }
}

interface TestimonialItem {
  _key: string
  authorName: string
  authorRole?: string
  car?: { marque: string, modele: string }
  quote: string
  backgroundImage?: BackgroundImage
}

interface Props {
  items: TestimonialItem[]
}

const props = defineProps<Props>()

const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragFree: false })

const selectedIndex = ref(0)
const progress = ref(0)

const currentItem = computed(() => props.items[selectedIndex.value] ?? null)

function onSelect() {
  const api = emblaApi.value
  if (!api)
    return
  selectedIndex.value = api.selectedScrollSnap()
  progress.value = props.items.length > 1
    ? selectedIndex.value / (props.items.length - 1)
    : 1
}

watch(emblaApi, (api) => {
  if (!api)
    return
  api.on('select', onSelect)
  api.on('reInit', onSelect)
  onSelect()
})

function scrollPrev() {
  emblaApi.value?.scrollPrev()
}

function scrollNext() {
  emblaApi.value?.scrollNext()
}
</script>

<template>
  <section class="app-elements-testimonials">
    <!-- Backgrounds (crossfade) -->
    <div aria-hidden="true" class="testimonials__backgrounds">
      <div
        v-for="(item, i) in items"
        :key="item._key"
        class="testimonials__bg"
        :class="{ 'is-active': i === selectedIndex }"
      >
        <ElementsMedia
          v-if="item.backgroundImage?.imageUrl"
          class="testimonials__bg-media"
          :src="item.backgroundImage.imageUrl"
          :alt="item.backgroundImage.imageAlt ?? ''"
          provider="sanity"
          :hotspot="item.backgroundImage.imageHotspot"
          :crop="item.backgroundImage.imageCrop"
          :lazy="false"
        />
      </div>
      <div class="testimonials__gradient" />
    </div>

    <!-- Content -->
    <div class="testimonials__inner">
      <!-- Left: author + nav -->
      <div class="testimonials__left">
        <Transition name="t-fade" mode="out-in">
          <div :key="selectedIndex" class="testimonials__author">
            <TextsP1 :selectable="false" color="beige-100" class="testimonials__author-name">
              {{ currentItem?.authorName }}
            </TextsP1>
            <TextsP2 :selectable="false" color="beige-100" class="testimonials__author-role">
              {{ currentItem?.authorRole }}
            </TextsP2>
          </div>
        </Transition>

        <div v-if="items.length > 1" class="testimonials__nav">
          <button class="testimonials__nav-btn" aria-label="Témoignage précédent" @click="scrollPrev">
            <SvgIconArrow color="beige-100" aria-hidden="true" />
          </button>
          <button class="testimonials__nav-btn testimonials__nav-btn--next" aria-label="Témoignage suivant" @click="scrollNext">
            <SvgIconArrow color="beige-100" aria-hidden="true" />
          </button>
        </div>
      </div>

      <!-- Right: Embla quotes -->
      <div class="testimonials__right">
        <div ref="emblaRef" class="testimonials__embla">
          <div class="testimonials__embla-container">
            <div
              v-for="item in items"
              :key="item._key"
              class="testimonials__slide"
            >
              <div class="testimonials__quote-wrap">
                <TextsP2 v-if="item.car" :selectable="false" color="beige-100" class="testimonials__car-model">
                  {{ item.car.marque }} {{ item.car.modele }}
                </TextsP2>
                <TextsH3 tag="p" :selectable="false" color="beige-100" class="testimonials__quote">
                  {{ item.quote }}
                </TextsH3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress bar -->
    <div aria-hidden="true" class="testimonials__progress">
      <div class="testimonials__progress-fill" :style="{ width: `${progress * 100}%` }" />
    </div>
  </section>
</template>

<style lang="scss">
.app-elements-testimonials {
  position: relative;
  width: 100%;
  min-height: desktop-vw(800px);
  overflow: hidden;
  padding: desktop-vw(40px) desktop-vw(24px);
  display: flex;
  flex-direction: column;
}

.testimonials {
  &__backgrounds {
    position: absolute;
    inset: 0;
  }

  &__bg {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.8s ease;

    &.is-active {
      opacity: 1;
    }
  }

  &__bg-media {
    width: 100%;
    height: 100%;
  }

  &__gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, var(--c-black) 0%, transparent 60%);
    pointer-events: none;
  }

  &__inner {
    position: relative;
    z-index: 1;
    flex: 1;
    display: flex;
    gap: desktop-vw(72px);
  }

  &__left {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-self: flex-start;
    gap: desktop-vw(16px);
  }

  &__author {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  &__author-name {
    line-height: 1.2;
  }

  &__author-role {
    line-height: 1.2;
  }

  &__nav {
    display: flex;
    gap: desktop-vw(8px);
    align-items: center;
  }

  &__nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: desktop-vw(52px);
    height: auto;
    aspect-ratio: 1 / 1;
    border-radius: 4px;
    background: var(--c-beige-10);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: none;
    cursor: pointer;
    transition: background 0.2s var(--ease-out-cubic);

    .svg-logo {
      width: desktop-vw(18px);
      height: desktop-vw(18px);
    }

    &--next .svg-logo {
      transform: rotate(180deg);
    }

    &:hover {
      background: var(--c-beige-20);
    }
  }

  &__right {
    flex: 0 0 desktop-vw(832px);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-end;
    min-width: 0;
  }

  &__embla {
    overflow: hidden;
    width: 100%;
  }

  &__embla-container {
    display: flex;
    align-items: flex-end;
  }

  &__slide {
    flex: 0 0 100%;
    min-width: 0;
  }

  &__quote-wrap {
  }

  &__car-model {
    display: inline;
    margin-right: desktop-vw(16px);
  }

  &__quote {
    display: inline;

    &::before {
      content: '\201C';
    }

    &::after {
      content: '\201D';
    }
  }

  &__progress {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 3px;
    background: var(--c-beige-20);
    margin-top: desktop-vw(40px);
  }

  &__progress-fill {
    height: 100%;
    background: var(--c-beige-100);
    transition: width 0.4s ease;
  }
}

// Author fade transition
.t-fade-enter-active,
.t-fade-leave-active {
  transition: opacity 0.3s ease;
}

.t-fade-enter-from,
.t-fade-leave-to {
  opacity: 0;
}
</style>
