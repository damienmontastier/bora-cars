<script setup lang="ts">
import type { HeroData } from '~/queries/home'
import gsap from 'gsap'

interface Props {
  data: HeroData | null
  clipPath?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  clipPath: true,
})

const settings = useSettings()
const { menuTheme } = storeToRefs(useAppStore())
const ctaTheme = computed(() => menuTheme.value === 'black' ? 'white' : menuTheme.value)

const mainRef = useTemplateRef('mainRef')

let ctx: gsap.Context

onMounted(() => {
  ctx = gsap.context(() => {
  }, mainRef.value as HTMLElement)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <div ref="mainRef" class="app-elements-hero-2">
    <div class="app-elements-hero-2__overlay" />

    <div class="app-elements-hero-2__background-wrapper">
      <UtilsParallax
        v-if="data?.backgroundMedia"
        id="hero-bg"
        class="app-elements-hero-2__background"
        position="top"
        :trigger="mainRef"
        :speed="0.5"
        :scale="1.02"
        :reversed="true"
      >
        <ElementsMedia
          v-if="data.backgroundMedia.mediaType === 'image'"
          :src="data.backgroundMedia.imageUrl"
          :alt="data.backgroundMedia.imageAlt ?? ''"
          provider="sanity"
          :hotspot="data.backgroundMedia.imageHotspot"
          :crop="data.backgroundMedia.imageCrop"
          :lazy="false"
          :preload="{ fetchPriority: 'high' }"
        />
        <ElementsVideo
          v-else-if="data.backgroundMedia.mediaType === 'video' && data.backgroundMedia.videoUrl"
          class="app-elements-hero-2__background--video"
          :src="data.backgroundMedia.videoUrl"
          :aria-label="data.backgroundMedia.videoAlt ?? ''"
        />
      </UtilsParallax>
    </div>

    <div class="app-elements-hero-2__content">
      <div class="app-elements-hero-2__top">
        <TextsH2 v-if="data?.heading" color="beige-100">
          {{ data.heading }}
        </TextsH2>

        <div class="app-elements-hero-2__top-content">
          <TextsP2 v-if="data?.subtext" color="beige-100">
            {{ data.subtext }}
          </TextsP2>

          <AtomsCTA v-if="settings?.contactLink?.text" :theme="ctaTheme" class="app-elements-hero-2__cta" :to="settings.contactLink">
            {{ settings.contactLink.text }}
          </AtomsCTA>
        </div>
      </div>

      <div class="app-elements-hero-2__bottom">
        <TextsH2 v-if="data?.tagline" color="beige-100">
          {{ data.tagline }}
        </TextsH2>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.app-elements-hero-2 {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  position: relative;

  &__overlay {
    position: absolute;
    inset: 0;
    background-color: var(--c-black-50);
    z-index: 1;
    pointer-events: none;
  }

  &__background-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    .app-elements-media,
    .app-elements-video {
    }
  }

  &__content {
    position: relative;
    z-index: 2;
    width: 100%;
  }

  &__top {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    padding: desktop-vw(24px);
    flex-direction: column;

    &-content {
      margin-left: auto;
      display: flex;
      flex-direction: column;
      gap: desktop-vw(24px);
      margin-top: auto;
    }

    .P2 {
      width: 75%;
    }

    .app-atoms-cta {
      align-self: flex-end;
      width: 100%;
    }

    .H2 {
      margin-top: auto;
      flex: 0 0 auto;
      max-width: desktop-vw(720px);
      margin-right: desktop-vw(60px);
    }
  }

  &__bottom {
    padding: desktop-vw(24px);
    display: flex;
    justify-content: flex-end;
    height: 100vh;
    align-items: center;

    .H2 {
      flex: 0 0 auto;
      max-width: desktop-vw(720px);
      margin-right: desktop-vw(60px);
    }
  }

  &__background .utils-parallax__target {
    transform-origin: center top;
  }

  &__background.app-elements-media,
  &__background.utils-parallax {
    position: sticky;
    top: 0;
    width: 100%;
    height: 100vh;
  }

  &__background--video {
    width: 100%;
    height: 100%;
  }
}
</style>
