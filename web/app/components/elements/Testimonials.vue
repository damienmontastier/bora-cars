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

const { t } = useI18n()

const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragFree: false, watchDrag: false })

const selectedIndex = ref(0)
const progress = ref(0)
const progressOrigin = ref<'left center' | 'right center'>('left center')
const progressFillRef = ref<HTMLElement | null>(null)

const currentItem = computed(() => props.items[selectedIndex.value] ?? null)

const visibleIndices = computed(() => {
  const total = props.items.length
  if (total === 0)
    return new Set<number>()
  const current = selectedIndex.value
  return new Set([
    current,
    (current + 1) % total,
    (current - 1 + total) % total,
  ])
})

function onSelect() {
  const api = emblaApi.value
  if (!api)
    return

  const newIndex = api.selectedScrollSnap()
  selectedIndex.value = newIndex

  const total = props.items.length
  if (total <= 1) {
    progress.value = 1
    return
  }

  const newProgress = (newIndex + 1) / total

  if (newProgress < progress.value) {
    // Loop wrap: fill to 1 (if not there), wipe out from left (origin: right),
    // then refill from left (origin: left). No invisible reset frame.
    const refill = () => {
      // We're at scaleX 0 (invisible). Switch origin back to left and animate to new.
      progressOrigin.value = 'left center'
      requestAnimationFrame(() => {
        progress.value = newProgress
      })
    }

    const wipeOut = () => {
      // Switch origin to right while scaleX is 1 (visually identical, full bar).
      progressOrigin.value = 'right center'
      const el = progressFillRef.value
      if (!el) {
        refill()
        return
      }
      const onEnd = () => {
        el.removeEventListener('transitionend', onEnd)
        refill()
      }
      el.addEventListener('transitionend', onEnd, { once: true })
      // Animate to 0: bar shrinks from the left edge inward
      requestAnimationFrame(() => {
        progress.value = 0
      })
    }

    if (progress.value >= 0.999) {
      wipeOut()
      return
    }

    const el = progressFillRef.value
    if (!el) {
      progress.value = newProgress
      return
    }

    const onEnd = () => {
      el.removeEventListener('transitionend', onEnd)
      wipeOut()
    }
    el.addEventListener('transitionend', onEnd, { once: true })
    progress.value = 1
  }
  else {
    progress.value = newProgress
  }
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

const sectionRef = ref<HTMLElement | null>(null)
usePointerSwipe(sectionRef, {
  threshold: 30,
  onSwipeEnd(_e, direction) {
    if (direction === 'left')
      scrollNext()
    else if (direction === 'right')
      scrollPrev()
  },
})
</script>

<template>
  <section ref="sectionRef" class="app-elements-testimonials">
    <div aria-hidden="true" class="app-elements-testimonials__backgrounds">
      <div
        v-for="(item, i) in items"
        :key="item._key"
        class="app-elements-testimonials__bg"
        :class="{ 'is-active': i === selectedIndex }"
      >
        <ElementsMedia
          v-if="item.backgroundImage?.imageUrl && visibleIndices.has(i)"
          class="app-elements-testimonials__bg-media"
          :src="item.backgroundImage.imageUrl"
          :alt="item.backgroundImage.imageAlt ?? ''"
          provider="sanity"
          :hotspot="item.backgroundImage.imageHotspot"
          :crop="item.backgroundImage.imageCrop"
          :lazy="false"
          :overlay="i === 0"
          sizes="sm:100vw xl:100vw"
        />
      </div>
      <div class="app-elements-testimonials__gradient" />
    </div>

    <div class="app-elements-testimonials__inner">
      <div class="app-elements-testimonials__left">
        <Transition name="t-fade" mode="out-in">
          <div :key="selectedIndex" class="app-elements-testimonials__author">
            <TextsP1 :selectable="false" color="beige-100" class="app-elements-testimonials__author-name">
              {{ currentItem?.authorName }}
            </TextsP1>
            <TextsP2 :selectable="false" color="beige-100" class="app-elements-testimonials__author-role">
              {{ currentItem?.authorRole }}<span v-if="currentItem?.car" class="app-elements-testimonials__author-car"><span class="app-elements-testimonials__author-sep">—</span>{{ currentItem.car.marque }} {{ currentItem.car.modele }}</span>
            </TextsP2>
          </div>
        </Transition>

        <div v-if="items.length > 1" class="app-elements-testimonials__nav">
          <button class="app-elements-testimonials__nav-btn" :aria-label="t('testimonials.prev')" @click="scrollPrev">
            <SvgIconArrow class="app-elements-testimonials__nav-icon" color="beige-100" aria-hidden="true" />
          </button>
          <button class="app-elements-testimonials__nav-btn app-elements-testimonials__nav-btn--next" :aria-label="t('testimonials.next')" @click="scrollNext">
            <SvgIconArrow class="app-elements-testimonials__nav-icon" color="beige-100" aria-hidden="true" />
          </button>
        </div>
      </div>

      <!-- Right: Embla quotes (mobile: car label sits above the quote) -->
      <div class="app-elements-testimonials__right">
        <TextsP1 :selectable="false" color="beige-100" class="app-elements-testimonials__car-label">
          {{ currentItem?.car ? `${currentItem.car.marque} ${currentItem.car.modele}` : '' }}
        </TextsP1>
        <div ref="emblaRef" class="app-elements-testimonials__embla">
          <div class="app-elements-testimonials__embla-container">
            <div
              v-for="item in items"
              :key="item._key"
              class="app-elements-testimonials__slide"
            >
              <div class="app-elements-testimonials__quote-wrap">
                <TextsH3 tag="p" :selectable="false" color="beige-100" class="app-elements-testimonials__quote">
                  &#8220;{{ item.quote }}&#8221;
                </TextsH3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div aria-hidden="true" class="app-elements-testimonials__progress">
      <div ref="progressFillRef" class="app-elements-testimonials__progress-fill" :style="{ transform: `scaleX(${progress})`, transformOrigin: progressOrigin }" />
    </div>
  </section>
</template>

<style lang="scss">
.app-elements-testimonials {
  position: relative;
  width: 100%;
  min-height: desktop-vw(720px);
  overflow: hidden;
  padding: desktop-vw(40px) desktop-vw(24px);
  display: flex;
  flex-direction: column;
  touch-action: pan-y;
  user-select: none;

  &__backgrounds {
    position: absolute;
    inset: 0;
  }

  &__bg {
    position: absolute;
    inset: 0;
    opacity: 0;
    will-change: opacity;
    transform: translateZ(0);
    transition: opacity 0.8s ease;

    &.is-active {
      opacity: 1;
    }
  }

  &__bg-media {
    width: 100%;
    height: 100%;
    transform: translateZ(0);
  }

  &__gradient {
    position: absolute;
    inset: 0;
    z-index: 1;
    background: linear-gradient(0deg, rgba(12, 12, 10, 0) 0%, #0c0c0a 100%);
    pointer-events: none;
  }

  &__inner {
    position: relative;
    z-index: 1;
    flex: 2;
    display: flex;
    gap: desktop-vw(72px);
  }

  &__left {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-self: flex-start;
    gap: desktop-vw(24px);
  }

  &__author {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  &__author-name,
  &__author-role {
    line-height: 1.2;
    font-size: desktop-vw(26px);
    line-height: desktop-vw(24px);
  }

  &__author-sep {
    display: inline-block;
    margin: 0 desktop-vw(8px);
  }

  // The car (marque + modèle) is appended to the role on desktop; on mobile it
  // moves above the quote (see &__car-label) so it is hidden here.
  &__author-car {
    @include mobile {
      display: none;
    }
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
    border: none;
    cursor: pointer;
    transition: background 0.2s var(--ease-out-cubic);

    @include hover {
      &:hover {
        background: var(--c-beige-20);
      }
    }
  }

  &__nav-icon {
    width: desktop-vw(18px);
    height: desktop-vw(18px);

    .app-elements-testimonials__nav-btn--next & {
      transform: rotate(180deg);
    }
  }

  &__right {
    flex: 0 0 desktop-vw(832px);
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    min-width: 0;
    justify-content: flex-start;
  }

  &__embla {
    overflow: hidden;
    width: 100%;
  }

  &__embla-container {
    display: flex;
    align-items: flex-start;
  }

  &__slide {
    flex: 0 0 100%;
    min-width: 0;
  }

  &__quote {
    display: inline;
  }

  // Car label above the quote — mobile only (on desktop the car lives in the role line).
  &__car-label {
    display: none;
  }

  &__progress {
    position: absolute;
    z-index: 1;
    width: 100%;
    height: 3px;
    background: var(--c-beige-10);
    bottom: 0;
    height: 5px;
    left: 0;
  }

  &__progress-fill {
    height: 100%;
    width: 100%;
    background: var(--c-beige-100);
    transition: transform 0.4s ease;
  }

  // ── Mobile ──────────────────────────────────────────────────────────────
  // Single column, space-between: car + quote on top, author + nav at the
  // bottom (column-reverse keeps the quote first in the DOM for Embla).
  @include mobile {
    min-height: mobile-vw(664px);
    padding: mobile-vw(40px) mobile-vw(24px);

    &__inner {
      flex: 1;
      flex-direction: column-reverse;
      justify-content: space-between;
      gap: mobile-vw(40px);
    }

    &__gradient {
      background: linear-gradient(-31deg, rgba(12, 12, 10, 0) 0%, #0c0c0a 100%);
    }

    // Bottom row: author on the left, nav on the right, both bottom-aligned.
    &__left {
      flex-direction: row;
      align-items: flex-end;
      align-self: stretch;
      width: 100%;
      gap: mobile-vw(16px);
    }

    &__author {
      flex: 1 1 auto;
      min-width: 0;
      gap: 0;
    }

    &__author-name {
      font-size: mobile-vw(20px);
      line-height: mobile-vw(24px);
    }

    &__author-role {
      font-size: mobile-vw(18px);
      line-height: mobile-vw(22px);
    }

    &__nav {
      flex: 0 0 auto;
      gap: mobile-vw(8px);
    }

    &__nav-btn {
      width: mobile-vw(52px);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }

    &__nav-icon {
      width: mobile-vw(18px);
      height: mobile-vw(18px);
    }

    // Top block: car label + quote, full width, left-aligned.
    &__right {
      flex: 0 1 auto;
      width: 100%;
      align-items: flex-start;
      gap: mobile-vw(8px);
    }

    &__car-label {
      display: block;
      font-family: var(--font-haas-grot-disp-regular);
      font-size: mobile-vw(18px);
      line-height: mobile-vw(22px);
    }

    &__quote {
      font-size: mobile-vw(32px);
      line-height: mobile-vw(40px);
    }

    &__progress {
      height: 3px;
    }
  }
}

.t-fade-enter-active,
.t-fade-leave-active {
  transition: opacity 0.3s ease;
}

.t-fade-enter-from,
.t-fade-leave-to {
  opacity: 0;
}
</style>
