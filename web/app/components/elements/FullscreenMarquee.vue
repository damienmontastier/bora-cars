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

const sharedMarqueeProps = computed(() => ({
  duration: 30,
  repeat: 4,
  animatedOnMobile: true,
  scrollVelocity: true,
  scrollVelocitySpeed: 1.25,
  trigger: rootRef.value,
}))

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
          sizes="sm:100vw xl:100vw"
        />
        <ElementsVideo
          v-else-if="data.backgroundMedia.mediaType === 'video' && data.backgroundMedia.videoUrl"
          class="app-elements-fullscreen-marquee__background--video"
          :src="data.backgroundMedia.videoUrl"
          :aria-label="data.backgroundMedia.videoAlt ?? ''"
        />
      </UtilsParallax>
    </div>

    <div class="app-elements-fullscreen-marquee__overlay" />

    <div ref="rowsRef" class="app-elements-fullscreen-marquee__rows">
      <ElementsMarquee
        v-bind="sharedMarqueeProps"
        class="app-elements-fullscreen-marquee__row"
      >
        <div class="app-elements-fullscreen-marquee__row-wrapper">
          <UtilsBaseLink
            v-for="item in row1Items"
            :key="item._key"
            :to="item.slug ? { name: 'car-uid', params: { uid: item.slug } } : undefined"
            class="app-elements-fullscreen-marquee__link"
          >
            <TextsH1
              color="beige-100"
              class="app-elements-fullscreen-marquee__item"
            >
              {{ item.label }}
            </TextsH1>
          </UtilsBaseLink>
        </div>
      </ElementsMarquee>

      <ElementsMarquee
        v-bind="sharedMarqueeProps"
        :reversed="true"
        class="app-elements-fullscreen-marquee__row"
      >
        <div class="app-elements-fullscreen-marquee__row-wrapper">
          <UtilsBaseLink
            v-for="item in row2Items"
            :key="item._key"
            :to="item.slug ? { name: 'car-uid', params: { uid: item.slug } } : undefined"
            class="app-elements-fullscreen-marquee__link"
          >
            <TextsH1
              color="beige-100"
              class="app-elements-fullscreen-marquee__item"
            >
              {{ item.label }}
            </TextsH1>
          </UtilsBaseLink>
        </div>
      </ElementsMarquee>

      <AtomsCTA
        v-if="data.cta?.text"
        :to="data.cta"
        theme="white"
        class="app-elements-fullscreen-marquee__cta"
      >
        {{ data.cta.text }}
      </AtomsCTA>
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

  &__overlay {
    position: absolute;
    inset: 0;
    background-color: var(--c-black-50);
    z-index: 1;
    pointer-events: none;
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
    z-index: 2;
    display: flex;
    flex-direction: column;
    will-change: transform;
  }

  &__row {
    padding-block: 15px;
    margin-block: -15px;

    .app-elements-marquee__inner {
      gap: desktop-vw(64px);
      padding-right: desktop-vw(64px);

      @include mobile {
        gap: mobile-vw(32px);
        padding-right: mobile-vw(32px);
      }
    }

    &-wrapper {
      display: flex;
      flex-shrink: 0;
      gap: desktop-vw(64px);

      @include mobile {
        gap: mobile-vw(32px);
      }
    }
  }

  &__link {
    display: block;
    flex-shrink: 0;
    text-decoration: none;
    color: inherit;
  }

  &__item {
    display: block !important;
    white-space: nowrap;
    flex-shrink: 0;
    user-select: none;
  }

  &__cta {
    z-index: 2;
    align-self: flex-end;
    margin-top: desktop-vw(16px);
    margin-right: desktop-vw(24px);

    @include mobile {
      margin-top: mobile-vw(16px);
      margin-right: mobile-vw(16px);
    }
  }
}
</style>
