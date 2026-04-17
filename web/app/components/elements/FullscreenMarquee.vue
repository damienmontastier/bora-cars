<script setup lang="ts">
import type { FullscreenMarqueeData, MarqueeItem } from '~/queries/home'
import gsap from 'gsap'

interface Props {
  data: FullscreenMarqueeData
}

const props = defineProps<Props>()

const rootRef = useTemplateRef<HTMLElement>('rootRef')
const rowsRef = useTemplateRef<HTMLElement>('rowsRef')

const allItems = computed(() => props.data.items ?? [])

const row1Items = computed<MarqueeItem[]>(() => {
  const half = Math.ceil(allItems.value.length / 2)
  return allItems.value.slice(0, half)
})

const row2Items = computed<MarqueeItem[]>(() => {
  const half = Math.ceil(allItems.value.length / 2)
  return allItems.value.slice(half)
})

// ─── Shared marquee props ─────────────────────────────────────────────────────

const sharedMarqueeProps = computed(() => ({
  duration: 30,
  repeat: 4,
  animatedOnMobile: true,
  pauseOnHover: true,
  scrollVelocity: true,
  scrollVelocitySpeed: 1.5,
  trigger: rootRef.value,
}))

// ─── Scroll: rows translate from top to bottom of section ────────────────────

let ctx: gsap.Context | null = null

onMounted(async () => {
  await nextTick()

  ctx = gsap.context(() => {
    gsap.fromTo(
      rowsRef.value,
      { y: 0 },
      {
        y: () => rootRef.value!.offsetHeight - rowsRef.value!.offsetHeight,
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.value,
          start: 'top bottom-=10%',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
    )
  }, rootRef.value!)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <section ref="rootRef" class="app-elements-fullscreen-marquee">
    <!-- Background -->
    <div class="app-elements-fullscreen-marquee__background-wrapper">
      <UtilsParallax
        v-if="data.backgroundMedia"
        class="app-elements-fullscreen-marquee__background"
        :speed="0.65"
        :scale="1.1"
      >
        <ElementsMedia
          v-if="data.backgroundMedia.mediaType === 'image'"
          :src="data.backgroundMedia.imageUrl"
          :alt="data.backgroundMedia.imageAlt ?? ''"
          provider="sanity"
          :hotspot="data.backgroundMedia.imageHotspot"
          :crop="data.backgroundMedia.imageCrop"
        />
        <ElementsVideo
          v-else-if="data.backgroundMedia.mediaType === 'video' && data.backgroundMedia.videoUrl"
          class="app-elements-fullscreen-marquee__background--video"
          :src="data.backgroundMedia.videoUrl"
          :aria-label="data.backgroundMedia.videoAlt ?? ''"
        />
      </UtilsParallax>
    </div>

    <!-- Marquee rows -->
    <div ref="rowsRef" class="app-elements-fullscreen-marquee__rows">
      <!-- Row 1 — first half, scrolls left -->
      <ElementsMarquee
        v-bind="sharedMarqueeProps"
        class="app-elements-fullscreen-marquee__row"
      >
        <div class="app-elements-fullscreen-marquee__row-wrapper">
          <TextsH1
            v-for="item in row1Items"
            :key="item._key"
            color="beige-100"
            class="app-elements-fullscreen-marquee__item"
          >
            {{ item.label }}
          </TextsH1>
          <AtomsCTA
            v-if="data.cta?.text"
            :to="data.cta"
            theme="white"
            class="app-elements-fullscreen-marquee__cta-item"
          >
            {{ data.cta.text }}
          </AtomsCTA>
        </div>
      </ElementsMarquee>

      <!-- Row 2 — second half + CTA, scrolls right -->
      <ElementsMarquee
        v-bind="sharedMarqueeProps"
        :reversed="true"
        class="app-elements-fullscreen-marquee__row"
      >
        <div class="app-elements-fullscreen-marquee__row-wrapper">
          <TextsH1
            v-for="item in row2Items"
            :key="item._key"
            color="beige-100"
            class="app-elements-fullscreen-marquee__item"
          >
            {{ item.label }}
          </TextsH1>
          <AtomsCTA
            v-if="data.cta?.text"
            :to="data.cta"
            theme="white"
            class="app-elements-fullscreen-marquee__cta-item"
          >
            {{ data.cta.text }}
          </AtomsCTA>
        </div>
      </ElementsMarquee>
    </div>
  </section>
</template>

<style lang="scss">
.app-elements-fullscreen-marquee {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;

  &__background-wrapper {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  &__background {
    width: 100%;
    height: 100%;
  }

  &__background--video {
    width: 100%;
    height: 100%;
  }

  &__rows {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1;
    display: flex;
    flex-direction: column;
    will-change: transform;
  }

  &__row {
    .app-elements-marquee__inner {
      gap: desktop-vw(64px);
      padding-right: desktop-vw(64px);
    }

    &-wrapper {
      display: flex;
      flex-shrink: 0;
      gap: desktop-vw(64px);
    }
  }

  &__item {
    display: block !important;
    white-space: nowrap;
    flex-shrink: 0;
    user-select: none;
  }

  &__cta-item {
    flex-shrink: 0;
    align-self: center;
  }
}
</style>
