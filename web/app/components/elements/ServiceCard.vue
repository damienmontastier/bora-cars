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
// candidate instead of the full-width (~1920px) default. On mobile (<800px)
// every card is forced to `span 6` (full width → 100vw); on desktop (≥800px)
// a card spans `grid.w` of the 12-col grid, so its width ≈ grid.w / 12 of the
// viewport. Rounding up keeps a touch of headroom so we never under-fetch.
const mediaSizes = computed(() => {
  const span = card.grid?.w
  const desktopVw = span ? Math.min(100, Math.ceil((span / 12) * 100)) : 50
  return `100vw sm:${desktopVw}vw`
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
