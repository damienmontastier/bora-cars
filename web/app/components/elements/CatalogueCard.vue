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
        <TextsP1 class="app-elements-catalogue-card__marque">
          {{ car.marque }}
        </TextsP1>
        <TextsP2 class="app-elements-catalogue-card__modele" color="black-40">
          {{ car.modele }}
        </TextsP2>
      </div>

      <ul v-if="car.rentalTypes?.length" class="app-elements-catalogue-card__tags">
        <li v-for="type in car.rentalTypes" :key="type" class="app-elements-catalogue-card__tag">
          <TextsCTA>{{ RENTAL_LABELS[type] ?? type }}</TextsCTA>
        </li>
      </ul>
    </div>
  </UtilsBaseLink>
</template>

<style lang="scss">
.app-elements-catalogue-card {
  display: flex;
  flex-direction: column;
  gap: desktop-vw(16px);
  text-decoration: none;
  color: inherit;

  @include mobile {
    gap: mobile-vw(12px);
  }

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
    aspect-ratio: 4 / 3;
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

    @include mobile {
      gap: mobile-vw(8px);
    }
  }

  &__name {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(4px);

    @include mobile {
      gap: mobile-vw(4px);
    }
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: desktop-vw(6px);
    list-style: none;
    margin: 0;
    padding: 0;
    justify-content: flex-end;
    flex-shrink: 0;

    @include mobile {
      gap: mobile-vw(4px);
    }
  }

  &__tag {
    border: 1px solid var(--c-black-20);
    padding: desktop-vw(4px) desktop-vw(10px);
    border-radius: 999px;

    @include mobile {
      padding: mobile-vw(3px) mobile-vw(8px);
    }
  }
}
</style>
