<script setup lang="ts">
import type { ServiceCard } from '~/queries/home'

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
</script>

<template>
  <UtilsBaseLink
    :to="card.link"
    :style="gridStyle"
    class="app-elements-service-card"
    :class="`app-elements-service-card--${card.cardType}`"
  >
    <div class="app-elements-service-card__media">
      <ElementsMedia
        v-if="card.media?.imageUrl"
        :src="card.media.imageUrl"
        :alt="card.media.imageAlt ?? card.categoryLabel"
      />
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

    .app-elements-media {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }
  }

  &__label {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: desktop-vw(12px);
    padding: desktop-vw(14px) desktop-vw(16px);
  }

  &__category {
    white-space: nowrap;
  }

  &__divider {
    display: block;
    width: desktop-vw(28px);
    height: 2px;
    background: var(--c-black-100);
    flex-shrink: 0;
  }

  &__subtitle {
    white-space: nowrap;
  }

  // ─── Aspect ratio de l'image ──────────────────────
  &--xxl &__media {
    aspect-ratio: 706 / 706;
  }
  &--xl &__media {
    aspect-ratio: 706 / 400;
  }
  &--l &__media {
    aspect-ratio: 347 / 528;
  }
  &--m &__media {
    aspect-ratio: 347 / 347;
  }
}
</style>
