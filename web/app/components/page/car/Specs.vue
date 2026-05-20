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

interface Spec { key: string, label: string, value: string | number }

function buildSpec(key: string, car: CarDetailData): Spec | null {
  switch (key) {
    case 'teinteExterieure':
      return car.teinteExterieure ? { key, label: 'Teinte extérieure', value: car.teinteExterieure } : null
    case 'teinteInterieure':
      return car.teinteInterieure ? { key, label: 'Teintes intérieures & matière', value: car.teinteInterieure } : null
    case 'nombrePlaces':
      return car.nombrePlaces ? { key, label: 'Places', value: car.nombrePlaces } : null
    case 'nombrePortes':
      return car.nombrePortes ? { key, label: 'Portes', value: car.nombrePortes } : null
    case 'gamme':
      return car.gamme ? { key, label: 'Gamme', value: GAMME_LABELS[car.gamme] ?? car.gamme } : null
    case 'annee':
      return car.annee ? { key, label: 'Année', value: car.annee } : null
    case 'boiteVitesse':
      return car.boiteVitesse ? { key, label: 'Boîte', value: BOITE_LABELS[car.boiteVitesse] ?? car.boiteVitesse } : null
    case 'carburant':
      return car.carburant ? { key, label: 'Carburant', value: CARBURANT_LABELS[car.carburant] ?? car.carburant } : null
    default:
      return null
  }
}

const fixedSpecs = computed<Spec[]>(() =>
  (props.car.specsLayout?.fixed ?? [])
    .map(k => buildSpec(k, props.car))
    .filter((s): s is Spec => s !== null),
)

const listSpecs = computed<Spec[]>(() =>
  (props.car.specsLayout?.list ?? [])
    .map(k => buildSpec(k, props.car))
    .filter((s): s is Spec => s !== null),
)
</script>

<template>
  <div v-if="fixedSpecs.length || listSpecs.length" class="car-specs">
    <div v-if="fixedSpecs.length" class="car-specs__row car-specs__row--fixed">
      <div v-for="spec in fixedSpecs" :key="spec.key" class="car-specs__item">
        <TextsP2 class="car-specs__label">
          {{ spec.label }}
        </TextsP2>
        <TextsP1 class="car-specs__value">
          {{ spec.value }}
        </TextsP1>
      </div>
    </div>

    <hr v-if="fixedSpecs.length && listSpecs.length" class="car-specs__divider">

    <div v-if="listSpecs.length" class="car-specs__row car-specs__row--list">
      <div v-for="spec in listSpecs" :key="spec.key" class="car-specs__item">
        <TextsP2 color="black-70" class="car-specs__label">
          {{ spec.label }}
        </TextsP2>
        <TextsP1 class="car-specs__value">
          {{ spec.value }}
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
    flex-wrap: wrap;

    @include mobile {
      gap: mobile-vw(16px);
      padding: mobile-vw(16px) 0;
    }

    &--fixed > .car-specs__item {
      flex: 0 0 desktop-vw(250.67px);

      @include mobile {
        flex: 1 0 calc(50% - #{mobile-vw(8px)});
      }
    }

    &--list > .car-specs__item {
      flex: 0 0 calc((100% - #{desktop-vw(32px * 3)}) / 3);

      @include mobile {
        flex: 1 0 calc(50% - #{mobile-vw(8px)});
      }
    }
  }

  &__item {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: desktop-vw(8px);

    @include mobile {
      gap: mobile-vw(6px);
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
