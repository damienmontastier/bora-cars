<script setup lang="ts">
import type UtilsParallax from '~/components/utils/Parallax.vue'
import type { ServiceCard } from '~/queries/home'

type ParallaxProps = InstanceType<typeof UtilsParallax>['$props']

interface Props {
  card: ServiceCard
}

const { card } = defineProps<Props>()

const gridStyle = computed(() => {
  if (!card.grid)
    return {}
  return {
    gridColumn: `${card.grid.x + 1} / span ${card.grid.w}`,
    gridRowStart: card.grid.y + 1,
  }
})

// Tell the browser the real rendered width so it picks a right-sized srcset
// candidate. On desktop (≥800px) a card spans `grid.w` of the 12-col grid, so
// its SLOT width ≈ grid.w / 12 of the viewport — but the media RENDERS WIDER
// than that slot, so sizing to the slot under-fetches (soft images even on a
// ≤1920 retina laptop). Two compounding reasons, both from `UtilsParallax`:
//
//   1. Parallax overscan — the parallax target is TALLER than the slot
//      (`height: 100% + offset*2`) and the <img> is `object-fit: cover`, so to
//      cover the taller box the image scales up and renders ~8–12% WIDER than
//      the slot (the extra width is cropped off the sides).
//   2. End scale — the parallax tween zooms `scale: 1.02–1.03` at end of scroll.
//
// Combined that's roughly a ×1.15 headroom; we use 1.2 for retina rounding
// margin. This is honest sizing, not over-fetching: the image really is painted
// that wide. `@nuxt/image` derives every srcset candidate as
// `vw × screenWidth × density`, so the declared vw is exactly what bounds the
// candidates — under-declaring by ~15% makes them ~15% too small. Keep this at
// ~1.2: pushing it higher to "force" sharpness just over-fetches every screen;
// the `xxl` key below is the clean way to serve >1920 displays (see sizes note).
//
// On mobile (<800px) every card is forced to `span 6` (full width → 100vw) and
// the parallax is disabled (default `disableOnMobile`), so there's no overscan:
// the leading bare `100vw` (the mobile rule) takes no headroom.
//
// Each key generates a candidate `desktopVw% × screen × density`: `sm` (800) is
// kept only to hold the mobile↔desktop boundary at 800px; `xl` (1920) is the
// candidate a standard retina laptop lands on; `xxl` (2560) raises the ceiling
// for >1920 displays (4K/5K/2560 externals). The browser only fetches the `xxl`
// candidate when the card actually needs it, so ≤1920 screens aren't bloated
// (the 1w/2w junk candidate from the bare 100vw is ignored — see
// project_nuxt_image_sizes memory).
const PARALLAX_HEADROOM = 1.65

const mediaSizes = computed(() => {
  const span = card.grid?.w
  const base = span ? (span / 12) * 100 : 50
  const desktopVw = Math.min(100, Math.ceil(base * PARALLAX_HEADROOM))
  return `100vw sm:${desktopVw}vw xl:${desktopVw}vw xxl:${desktopVw}vw`
})

const parallaxProps = computed((): Partial<ParallaxProps> => {
  switch (card.cardType) {
    case 'xxl': return { speed: 0.2, scale: 1.03 }
    case 'xl': return { speed: 0.15, scale: 1.02, reversed: true }
    case 'l': return { speed: 0.2, scale: 1.02 }
    case 'm': return { speed: 0.15, scale: 1.02, reversed: true }
    default: return { speed: 0.25, scale: 1.03 }
  }
})
</script>

<template>
  <UtilsBaseLink
    :to="card.link"
    :style="gridStyle"
    class="app-elements-service-card"
    :class="`app-elements-service-card--${card.cardType}`"
  >
    <div class="app-elements-service-card__media">
      <UtilsParallax v-bind="parallaxProps">
        <ElementsMedia
          v-if="card.media?.imageUrl"
          :src="card.media.imageUrl"
          :alt="card.media.imageAlt ?? card.categoryLabel"
          provider="sanity"
          :hotspot="card.media.imageHotspot"
          :crop="card.media.imageCrop"
          :sizes="mediaSizes"
        />
      </UtilsParallax>
    </div>

    <div class="app-elements-service-card__label">
      <TextsCTA class="app-elements-service-card__category">
        {{ card.categoryLabel }}
      </TextsCTA>
      <template v-if="card.subtitle">
        <span class="app-elements-service-card__divider" aria-hidden="true" />
        <TextsP2 class="app-elements-service-card__subtitle">
          {{ card.subtitle }}
        </TextsP2>
      </template>
    </div>
  </UtilsBaseLink>
</template>

<style lang="scss">
.app-elements-service-card {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  overflow: hidden;
  align-self: flex-end;

  &__media {
    position: relative;
    width: 100%;
    overflow: hidden;

    .utils-parallax {
      position: absolute;
      inset: 0;
    }
  }

  &__label {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: desktop-vw(12px);
    padding: desktop-vw(12px) desktop-vw(16px) 0 desktop-vw(16px);
    min-width: 0;

    @include mobile {
      flex-direction: column;
      gap: mobile-vw(0px);
      padding: mobile-vw(4px) mobile-vw(8px);
    }
  }

  &__category {
    white-space: nowrap;

    @include mobile {
      white-space: normal;
      min-width: 0;
    }
  }

  &__divider {
    display: block;
    width: desktop-vw(28px);
    height: 2px;
    background: var(--c-black-100);
    flex-shrink: 0;

    @include mobile {
      display: none;
    }
  }

  &__subtitle {
    white-space: nowrap;
    min-width: 0;

    @include mobile {
      white-space: normal;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  &--xxl &__media {
    aspect-ratio: 706 / 706;

    @include mobile {
      aspect-ratio: 377 / 377;
    }
  }

  &--xl &__media {
    aspect-ratio: 706 / 400;

    @include mobile {
      aspect-ratio: 377 / 400;
    }
  }
  &--l &__media {
    aspect-ratio: 347 / 528;

    @include mobile {
      aspect-ratio: 377 / 377;
    }
  }
  &--m &__media {
    aspect-ratio: 347 / 347;

    @include mobile {
      aspect-ratio: 377 / 377;
    }
  }

  @include mobile {
    grid-column: span 6 !important;
    grid-row: auto !important;
  }
}
</style>
