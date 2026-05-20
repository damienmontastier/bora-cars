<script setup lang="ts">
import type { CarDetailData } from '~/queries/car'

const props = defineProps<{ car: CarDetailData }>()

const PAIEMENT_LABELS: Record<string, string> = {
  virement: 'Virement',
  carte: 'Carte',
  especes: 'Espèces',
}

const RENTAL_TYPE_LABELS: Record<string, string> = {
  'longue-duree': 'Longue durée',
  'professionnel': 'Professionnel',
  'courte-duree': 'Courte durée',
}

interface Row { label: string, value: string }

const conditionsRows = computed<Row[]>(() => {
  const c = props.car
  const rows: Row[] = []
  if (c.ageMinimum)
    rows.push({ label: 'Âge minimum', value: `${c.ageMinimum} ans` })
  if (c.anciennetePermis != null)
    rows.push({ label: 'Ancienneté permis', value: `${c.anciennetePermis} ans` })
  if (c.dureeMinimum)
    rows.push({ label: 'Durée minimum', value: `${c.dureeMinimum} jours` })
  if (c.kmJourInclus)
    rows.push({ label: 'Km / jour inclus', value: `${c.kmJourInclus} km` })
  return rows
})

const fraisRows = computed<Row[]>(() => {
  const c = props.car
  const rows: Row[] = []
  if (c.caution)
    rows.push({ label: 'Caution', value: `${new Intl.NumberFormat('fr-FR').format(c.caution)} €` })
  if (c.prixKmSupplementaire?.prix && c.prixKmSupplementaire?.km)
    rows.push({ label: 'Km supplémentaire', value: `${c.prixKmSupplementaire.prix} € / ${c.prixKmSupplementaire.km} km` })
  return rows
})

const paiements = computed<string[]>(() =>
  (props.car.paiementsAcceptes ?? []).map(p => PAIEMENT_LABELS[p] ?? p),
)

const rentalTypes = computed<string[]>(() =>
  (props.car.rentalTypes ?? []).map(t => RENTAL_TYPE_LABELS[t] ?? t),
)

const hasAny = computed(() =>
  conditionsRows.value.length > 0
  || fraisRows.value.length > 0
  || paiements.value.length > 0
  || rentalTypes.value.length > 0,
)
</script>

<template>
  <section v-if="hasAny" class="car-missing">
    <TextsP3 weight="bold" tag="h2" class="car-missing__title">
      Infos location <span class="car-missing__tag">(à intégrer au design)</span>
    </TextsP3>

    <div v-if="rentalTypes.length" class="car-missing__group">
      <TextsP2 color="black-70" class="car-missing__group-title">
        Types de location
      </TextsP2>
      <ul class="car-missing__pills">
        <li v-for="t in rentalTypes" :key="t" class="car-missing__pill">
          <TextsP1>{{ t }}</TextsP1>
        </li>
      </ul>
    </div>

    <div v-if="conditionsRows.length" class="car-missing__group">
      <TextsP2 color="black-70" class="car-missing__group-title">
        Conditions
      </TextsP2>
      <dl class="car-missing__rows">
        <div v-for="row in conditionsRows" :key="row.label" class="car-missing__row">
          <TextsP2 color="black-70" tag="dt">
            {{ row.label }}
          </TextsP2>
          <TextsP1 tag="dd">
            {{ row.value }}
          </TextsP1>
        </div>
      </dl>
    </div>

    <div v-if="fraisRows.length" class="car-missing__group">
      <TextsP2 color="black-70" class="car-missing__group-title">
        Frais
      </TextsP2>
      <dl class="car-missing__rows">
        <div v-for="row in fraisRows" :key="row.label" class="car-missing__row">
          <TextsP2 color="black-70" tag="dt">
            {{ row.label }}
          </TextsP2>
          <TextsP1 tag="dd">
            {{ row.value }}
          </TextsP1>
        </div>
      </dl>
    </div>

    <div v-if="paiements.length" class="car-missing__group">
      <TextsP2 color="black-70" class="car-missing__group-title">
        Paiements acceptés
      </TextsP2>
      <ul class="car-missing__pills">
        <li v-for="p in paiements" :key="p" class="car-missing__pill">
          <TextsP1>{{ p }}</TextsP1>
        </li>
      </ul>
    </div>
  </section>
</template>

<style lang="scss">
.car-missing {
  --stripe-size: #{desktop-vw(14px)};
  position: relative;
  display: flex;
  flex-direction: column;
  gap: desktop-vw(24px);
  padding: desktop-vw(24px);
  background-color: var(--c-white);
  border: 1px dashed var(--c-orange-40);
  border-radius: desktop-vw(12px);
  isolation: isolate;
  overflow: hidden;

  @include mobile {
    --stripe-size: #{mobile-vw(10px)};
    gap: mobile-vw(16px);
    padding: mobile-vw(16px);
    border-radius: mobile-vw(10px);
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: repeating-linear-gradient(
      135deg,
      var(--c-orange-10) 0,
      var(--c-orange-10) 1px,
      transparent 1px,
      transparent var(--stripe-size)
    );
    pointer-events: none;
    z-index: -1;
  }

  &__title {
    color: var(--c-black-100);
    display: flex;
    align-items: baseline;
    gap: desktop-vw(8px);
    flex-wrap: wrap;

    @include mobile {
      gap: mobile-vw(6px);
    }
  }

  &__tag {
    font-size: 0.7em;
    color: var(--c-orange);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__group {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(12px);

    @include mobile {
      gap: mobile-vw(8px);
    }
  }

  &__group-title {
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  &__rows {
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: desktop-vw(12px) desktop-vw(32px);

    @include mobile {
      grid-template-columns: 1fr;
      gap: mobile-vw(10px);
    }
  }

  &__row {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(4px);

    @include mobile {
      gap: mobile-vw(3px);
    }
  }

  &__pills {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: desktop-vw(8px);

    @include mobile {
      gap: mobile-vw(6px);
    }
  }

  &__pill {
    background: var(--c-black-10);
    padding: desktop-vw(8px) desktop-vw(16px);
    border-radius: desktop-vw(40px);
    color: var(--c-black-100);

    @include mobile {
      padding: mobile-vw(6px) mobile-vw(12px);
      border-radius: mobile-vw(40px);
    }
  }
}
</style>
