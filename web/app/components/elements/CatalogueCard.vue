<script setup lang="ts">
import type { CatalogueCar } from '~/queries/catalogue'

interface Props {
  car: CatalogueCar
}

const { car } = defineProps<Props>()

const RENTAL_LABELS: Record<string, string> = {
  'longue-duree': 'Longue durée',
  'professionnel': 'Pro',
  'particulier': 'Particulier',
}
</script>

<template>
  <UtilsBaseLink
    :to="{ name: 'car-uid', params: { uid: car.slug } }"
    class="app-elements-catalogue-card"
    :class="{ 'app-elements-catalogue-card--linked': !!car.slug }"
  >
    <div class="app-elements-catalogue-card__media">
      <ElementsMedia
        v-if="car.imageUrl"
        :src="car.imageUrl"
        :alt="`${car.marque} ${car.modele}`"
        provider="sanity"
        :hotspot="car.imageHotspot"
        :crop="car.imageCrop"
        sizes="sm:100vw md:33vw"
        overlay-color="beige"
      />
      <div v-else class="app-elements-catalogue-card__placeholder" />
    </div>

    <div class="app-elements-catalogue-card__info">
      <div class="app-elements-catalogue-card__name">
        <TextsLabel class="app-elements-catalogue-card__marque">
          À partir de 2 350€/jours
        </TextsLabel>
        <TextsH4 class="app-elements-catalogue-card__modele" color="black-100">
          {{ car.marque }} — {{ car.modele }}
        </TextsH4>
      </div>
    </div>
  </UtilsBaseLink>
</template>

<style lang="scss">
.app-elements-catalogue-card {
  display: flex;
  flex-direction: column;
  gap: desktop-vw(8px);
  text-decoration: none;

  &--linked &__media {
    overflow: hidden;

    .app-elements-media {
      transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
  }

  @include hover {
    &--linked:hover &__media .app-elements-media {
      transform: scale(1.03);
    }
  }

  &__media {
    position: relative;
    width: 100%;
    aspect-ratio: 466 / 466;
    overflow: hidden;
    background: var(--c-beige-20);
  }

  &__placeholder {
    width: 100%;
    height: 100%;
    background: var(--c-beige-20);
  }

  &__info {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: desktop-vw(12px);
  }

  &__name {
    display: flex;
    flex-direction: column;
    width: 70%;
  }
}
</style>
