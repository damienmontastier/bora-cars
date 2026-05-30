<script setup lang="ts">
import type { HeroData } from '~/queries/home'
import { useEventBus } from '@vueuse/core'
import gsap from 'gsap'

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
const heroCTABus = useEventBus('hero-cta')

const route = useRoute()
const heroSource = computed(() => {
  const path = route.path.replace(/^\/(?:fr|en)\/?/, '').replace(/\/$/, '')
  return `${path || 'home'}_hero`
})

const mainRef = useTemplateRef('mainRef')

let ctx: gsap.Context

onMounted(() => {
  ctx = gsap.context(() => {
  }, mainRef.value as HTMLElement)
})

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

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <div ref="mainRef" v-menu-theme="'white'" class="app-elements-hero-2">
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

          <AtomsCTA v-if="settings?.contactLink?.text" :theme="ctaTheme" class="app-elements-hero-2__cta" :to="settings.contactLink" :tracking-extra="{ source: heroSource }">
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

    @include mobile {
      padding: mobile-vw(16px);
    }

    &-content {
      margin-left: auto;
      display: flex;
      flex-direction: column;
      gap: desktop-vw(24px);
      margin-top: auto;
      width: desktop-vw(320px);

      @include mobile {
        margin-top: mobile-vw(50px);
        gap: mobile-vw(24px);
        align-items: flex-end;
        width: 65%;
      }
    }

    .P2 {
      width: 75%;

      @include mobile {
        text-align: right;
        width: 70%;
      }
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

      @include mobile {
        width: 80%;
        align-self: flex-start;
        max-width: 100%;
        margin-right: 0px;
      }
    }
  }

  &__bottom {
    padding: desktop-vw(24px);
    display: flex;
    justify-content: flex-end;
    height: 100vh;
    align-items: center;

    @include mobile {
      padding: mobile-vw(16px);
    }

    .H2 {
      flex: 0 0 auto;
      max-width: desktop-vw(720px);
      margin-right: desktop-vw(60px);

      @include mobile {
        width: 100%;
        max-width: initial;
        margin-right: 0;
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
