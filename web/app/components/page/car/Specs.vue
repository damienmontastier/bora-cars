<script setup lang="ts">
import type { CarDetailData } from '~/queries/car'

const props = defineProps<{ car: CarDetailData }>()

const CARBURANT_LABELS: Record<string, string> = {
  'essence': 'Essence',
  'electrique': 'Électrique',
  'diesel': 'Diesel',
  'hybride-rechargeable': 'Hybride Rechargeable',
}

const BOITE_LABELS: Record<string, string> = {
  automatique: 'Automatique',
  manuelle: 'Manuelle',
}

const GAMME_LABELS: Record<string, string> = {
  suv: 'SUV',
  sportive: 'Sportive',
  berline: 'Berline',
  citadine: 'Citadine',
  compacte: 'Compacte',
  break: 'Break',
}

const hasTeinte = computed(() => !!props.car.teinteExterieure || !!props.car.teinteInterieure)
const hasInfo = computed(() => !!props.car.nombrePlaces || !!props.car.nombrePortes || !!props.car.gamme)
const hasPerf = computed(() => !!props.car.puissance || !!props.car.annee || !!props.car.boiteVitesse)
const hasCarburant = computed(() => !!props.car.carburant)
</script>

<template>
  <div class="car-specs">
    <div v-if="hasTeinte" class="car-specs__row car-specs__row--fixed">
      <div v-if="car.teinteExterieure" class="car-specs__item">
        <TextsP2 class="car-specs__label">
          Teinte extérieure
        </TextsP2>
        <TextsP1 class="car-specs__value">
          {{ car.teinteExterieure }}
        </TextsP1>
      </div>
      <div v-if="car.teinteInterieure" class="car-specs__item">
        <TextsP2 class="car-specs__label">
          Teintes intérieures & matière
        </TextsP2>
        <TextsP1 class="car-specs__value">
          {{ car.teinteInterieure }}
        </TextsP1>
      </div>
    </div>

    <hr v-if="hasTeinte && hasInfo" class="car-specs__divider">

    <div v-if="hasInfo" class="car-specs__row">
      <div v-if="car.nombrePlaces" class="car-specs__item">
        <TextsP2 color="black-70" class="car-specs__label">
          Places
        </TextsP2>
        <TextsP1 class="car-specs__value">
          {{ car.nombrePlaces }}
        </TextsP1>
      </div>
      <div v-if="car.nombrePortes" class="car-specs__item">
        <TextsP2 color="black-70" class="car-specs__label">
          Portes
        </TextsP2>
        <TextsP1 class="car-specs__value">
          {{ car.nombrePortes }}
        </TextsP1>
      </div>
      <div v-if="car.gamme" class="car-specs__item">
        <TextsP2 color="black-70" class="car-specs__label">
          Gamme
        </TextsP2>
        <TextsP1 class="car-specs__value">
          {{ GAMME_LABELS[car.gamme] ?? car.gamme }}
        </TextsP1>
      </div>
    </div>

    <hr v-if="hasInfo && hasPerf" class="car-specs__divider">

    <div v-if="hasPerf" class="car-specs__row">
      <div v-if="car.puissance" class="car-specs__item">
        <TextsP2 color="black-70" class="car-specs__label">
          Puissance (ch)
        </TextsP2>
        <TextsP1 class="car-specs__value">
          {{ car.puissance }} ch
        </TextsP1>
      </div>
      <div v-if="car.annee" class="car-specs__item">
        <TextsP2 color="black-70" class="car-specs__label">
          Année
        </TextsP2>
        <TextsP1 class="car-specs__value">
          {{ car.annee }}
        </TextsP1>
      </div>
      <div v-if="car.boiteVitesse" class="car-specs__item">
        <TextsP2 color="black-70" class="car-specs__label">
          Boîte
        </TextsP2>
        <TextsP1 class="car-specs__value">
          {{ BOITE_LABELS[car.boiteVitesse] ?? car.boiteVitesse }}
        </TextsP1>
      </div>
    </div>

    <hr v-if="hasPerf && hasCarburant" class="car-specs__divider">

    <div v-if="hasCarburant" class="car-specs__row">
      <div class="car-specs__item car-specs__item--full">
        <TextsP2 color="black-70" class="car-specs__label">
          Carburant
        </TextsP2>
        <TextsP1 class="car-specs__value">
          {{ CARBURANT_LABELS[car.carburant!] ?? car.carburant }}
        </TextsP1>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.car-specs {
  display: flex;
  flex-direction: column;

  &__row {
    display: flex;
    gap: desktop-vw(32px);
    padding: desktop-vw(24px) 0;
    align-items: flex-start;

    @include mobile {
      gap: mobile-vw(16px);
      padding: mobile-vw(16px) 0;
      flex-wrap: wrap;
    }

    &--fixed > .car-specs__item {
      flex: 0 0 desktop-vw(250.67px);

      @include mobile {
        flex: 1 0 calc(50% - #{mobile-vw(8px)});
      }
    }
  }

  &__item {
    flex: 1 0 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: desktop-vw(8px);

    @include mobile {
      gap: mobile-vw(6px);
    }

    &--full {
      flex: 1 0 100%;
    }
  }

  &__divider {
    width: 100%;
    height: 0;
    border: 0;
    border-top: 1px solid var(--c-black-10);
    margin: 0;
  }
}
</style>
