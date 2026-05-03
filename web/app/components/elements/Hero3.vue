<script setup lang="ts">
import type { HeroData } from '~/queries/home'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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
const logoColor = computed(() => menuTheme.value === 'white' ? 'beige-100' : `${menuTheme.value}-100`)

const mainRef = useTemplateRef('mainRef')

let ctx: gsap.Context

onMounted(async () => {
  await nextTick()

  ctx = gsap.context(() => {
    const absolute = mainRef.value!.querySelector<HTMLElement>('.app-elements-hero-3__absolute')!
    const bottom = mainRef.value!.querySelector<HTMLElement>('.app-elements-hero-3__bottom')!

    gsap.fromTo(
      absolute,
      { y: 0 },
      {
        y: () => bottom.getBoundingClientRect().bottom - absolute.getBoundingClientRect().bottom,
        ease: 'none',
        scrollTrigger: {
          trigger: mainRef.value,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
    )
  }, mainRef.value as HTMLElement)

  ScrollTrigger.refresh()
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <div ref="mainRef" class="app-elements-hero-3">
    <div class="app-elements-hero-3__overlay" />

    <div class="app-elements-hero-3__background-wrapper">
      <UtilsParallax
        v-if="data?.backgroundMedia"
        id="hero-bg"
        class="app-elements-hero-3__background"
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
          class="app-elements-hero-3__background--video"
          :src="data.backgroundMedia.videoUrl"
          :aria-label="data.backgroundMedia.videoAlt ?? ''"
        />
      </UtilsParallax>
    </div>

    <div class="app-elements-hero-3__content">
      <div class="app-elements-hero-3__middle">
        <TextsH1 v-if="data?.heading" color="beige-100">
          {{ data.heading }}
        </TextsH1>

        <div class="app-elements-hero-3__absolute">
          <TextsP2 v-if="data?.subtext" color="beige-100">
            {{ data.subtext }}
          </TextsP2>

          <AtomsCTA v-if="settings?.contactLink?.text" :theme="ctaTheme" class="app-elements-hero-3__cta" :to="settings.contactLink">
            {{ settings.contactLink.text }}
          </AtomsCTA>
        </div>
      </div>

      <div class="app-elements-hero-3__bottom">
        <TextsH3 v-if="data?.tagline" color="beige-100">
          {{ data.tagline }}
        </TextsH3>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.app-elements-hero-3 {
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

  &__middle {
    width: 100%;
    height: 100vh;
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    gap: desktop-vw(72px);
    padding: desktop-vw(24px);

    .P2 {
      width: 75%;
    }

    .app-atoms-cta {
      align-self: flex-end;
      width: 100%;
    }

    .H1 {
      flex: 0 0 auto;
      max-width: desktop-vw(945px);
    }
  }

  &__absolute {
    position: absolute;
    right: desktop-vw(24px);
    bottom: desktop-vw(24px);
    width: desktop-vw(310px);
    display: flex;
    flex-direction: column;
    gap: desktop-vw(24px);
  }

  &__bottom {
    margin-top: desktop-vw(170px);
    margin-bottom: desktop-vw(105px);
    padding: desktop-vw(24px) desktop-vw(24px) desktop-vw(24px) desktop-vw(24px);
    display: flex;
    justify-content: flex-start;
    margin-left: 175px;

    .H3 {
      width: 50%;
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
