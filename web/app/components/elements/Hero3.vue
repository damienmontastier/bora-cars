<script setup lang="ts">
import type { HeroData } from '~/queries/home'
import { useEventBus } from '@vueuse/core'
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
const { menuTheme, menuOpen } = storeToRefs(useAppStore())
const ctaTheme = computed(() => menuTheme.value === 'black' ? 'white' : menuTheme.value)
const logoColor = computed(() => menuTheme.value === 'white' ? 'beige-100' : `${menuTheme.value}-100`)
const heroCTABus = useEventBus('hero-cta')

const route = useRoute()
const heroSource = computed(() => {
  const path = route.path.replace(/^\/(?:fr|en)\/?/, '').replace(/\/$/, '')
  return `${path || 'home'}_hero`
})

const mainRef = useTemplateRef('mainRef')

let ctx: gsap.Context

// Show the menu pill CTA only while the menu is open.
// Snap the clip to its full width (CTA lands at its final position with no X
// movement) and reveal the CTA via a clip-path mask animation. On close, mask
// it back, then collapse the clip via the bus.
watch(menuOpen, (open) => {
  const menuCtaEl = document.querySelector<HTMLElement>('.app-menu__cta')
  if (!menuCtaEl)
    return

  if (open) {
    heroCTABus.emit('enter:snap')
    gsap.set(menuCtaEl, { opacity: 1 })
    // Delay so the pill is mostly settled (power3.inOut → ~94% of motion done
    // by t=0.3 of the 0.5s Flip) before revealing — keeps X translation on
    // the CTA imperceptible without dragging the open animation too long.
    gsap.fromTo(
      menuCtaEl,
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', duration: 0.4, ease: 'power3.inOut', delay: 0.3 },
    )
  }
  else {
    const clipEl = document.querySelector<HTMLElement>('.app-menu__main-clip')
    // closeMenu has a 0.3s delay before its Flip morph — fit the clip-path hide
    // inside that window so the CTA finishes hiding BEFORE the pill morph starts
    // (no X translation visible).
    gsap.to(menuCtaEl, {
      clipPath: 'inset(0 0 0 100%)',
      duration: 0.3,
      ease: 'power3.inOut',
      onComplete: () => {
        // Snap the clip to 0 so the pill's natural width matches savedClipWidth
        // when closeMenu's clearProps fires — avoids the jump that an animated
        // collapseMain would cause.
        if (clipEl)
          gsap.set(clipEl, { width: 0 })
        gsap.set(menuCtaEl, { display: 'none', opacity: 0 })
      },
    })
  }
})

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
  <div ref="mainRef" v-menu-theme="'white'" class="app-elements-hero-3">
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
          :overlay="false"
          sizes="sm:100vw xl:100vw"
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

          <AtomsCTA v-if="settings?.contactLink?.text" :theme="ctaTheme" class="app-elements-hero-3__cta" :to="settings.contactLink" :tracking-extra="{ source: heroSource }">
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
    padding: desktop-vw(35px) desktop-vw(24px);

    @include mobile {
      gap: mobile-vw(0px);
      padding: mobile-vw(35px) mobile-vw(16px) mobile-vw(200px) mobile-vw(16px);
      margin-bottom: mobile-vw(50px);
    }

    .P2 {
      width: 75%;

      @include mobile {
        width: 50%;
        text-align: right;
      }
    }

    .app-atoms-cta {
      align-self: flex-end;
      width: 100%;

      @include mobile {
        align-self: flex-end;
        width: auto;
      }
    }

    .H1 {
      flex: 0 0 auto;
      max-width: desktop-vw(1280px);

      @include mobile {
        width: 100%;
        max-width: none;
        overflow-wrap: break-word;
        word-wrap: break-word;
        hyphens: auto;
      }
    }
  }

  &__absolute {
    position: absolute;
    right: desktop-vw(24px);
    bottom: desktop-vw(35px);
    width: desktop-vw(310px);
    display: flex;
    flex-direction: column;
    gap: desktop-vw(24px);

    @include mobile {
      width: calc(100% - #{mobile-vw(32px)});
      gap: mobile-vw(24px);
      right: mobile-vw(16px);
      bottom: mobile-vw(16px);
      align-items: flex-end;
    }
  }

  &__bottom {
    margin-top: desktop-vw(170px);
    margin-bottom: desktop-vw(120px);
    margin-right: desktop-vw(24px);
    display: flex;
    justify-content: flex-start;
    margin-left: desktop-vw(175px + 24px);

    @include mobile {
      margin-top: mobile-vw(105px);
      margin-left: mobile-vw(16px);
      margin-right: mobile-vw(16px);
      margin-bottom: mobile-vw(16px);
      padding-bottom: mobile-vw(150px);
    }

    .H3 {
      width: 50%;

      @include mobile {
        width: 100%;
      }
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
