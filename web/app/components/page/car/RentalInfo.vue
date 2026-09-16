<script setup lang="ts">
import type { CarDetailData } from '~/queries/car'

const props = defineProps<{ car: CarDetailData }>()

const { t, te, locale } = useI18n()

const numberLocale = computed(() => locale.value === 'fr' ? 'fr-FR' : 'en-GB')

interface Cell { key: string, label: string, value: string }

function tEnum(group: 'type' | 'payment', value: string): string {
  const key = `car.rental.${group}.${value}`
  return te(key) ? t(key) : value
}

// Les forfaits mensuels atteignent des milliers de km → séparateur de milliers localisé.
function formatKm(value: number): string {
  return new Intl.NumberFormat(numberLocale.value).format(value)
}

// Caution et prix au km suivent le sélecteur de devise de la fiche (cf. useCurrency) :
// les montants sont stockés en euros dans Sanity et convertis à l'affichage.
const { formatPrice } = useCurrency()

const rentalTypes = computed<string[]>(() =>
  (props.car.rentalTypes ?? []).map(v => tEnum('type', v)),
)

const paiements = computed<string[]>(() =>
  (props.car.paiementsAcceptes ?? []).map(p => tEnum('payment', p)),
)

// Assurance — natif sur toutes les voitures : valeur Sanity sinon fallback i18n
const assuranceTitle = computed(() => props.car.assuranceTitre || t('car.rental.insuranceLabel'))
const assuranceValue = computed(() => props.car.assuranceSousTitre || t('car.rental.insuranceValue'))

const hasPills = computed(() =>
  Boolean(assuranceValue.value) || rentalTypes.value.length > 0 || paiements.value.length > 0,
)

const conditionsCells = computed<Cell[]>(() => {
  const c = props.car
  const items: Cell[] = []
  if (c.ageMinimum)
    items.push({ key: 'age', label: t('car.rental.ageMinimum'), value: `${c.ageMinimum} ${t('car.rental.units.years')}` })
  if (c.anciennetePermis != null)
    items.push({ key: 'anciennete', label: t('car.rental.anciennetePermis'), value: `${c.anciennetePermis} ${t('car.rental.units.years')}` })
  if (c.dureeMinimum) {
    // Unité optionnelle côté Sanity : les fiches existantes (sans valeur) restent en jours.
    const scale = c.dureeMinimumUnite === 'mois' ? 'month' : 'day'
    const unit = t(`car.rental.units.${scale}${c.dureeMinimum > 1 ? 's' : ''}`)
    items.push({ key: 'duree', label: t('car.rental.dureeMinimum'), value: `${c.dureeMinimum} ${unit}` })
  }
  return items
})

const fraisCells = computed<Cell[]>(() => {
  const c = props.car
  const items: Cell[] = []
  if (c.kmJourInclus)
    items.push({ key: 'km', label: t('car.rental.kmJourInclus'), value: `${formatKm(c.kmJourInclus)} ${t('car.rental.units.km')}` })
  if (c.kmMoisInclus)
    items.push({ key: 'km-mois', label: t('car.rental.kmMoisInclus'), value: `${formatKm(c.kmMoisInclus)} ${t('car.rental.units.km')}` })
  if (c.caution)
    items.push({ key: 'caution', label: t('car.rental.caution'), value: formatPrice(c.caution) })
  if (c.prixKmSupplementaire?.prix && c.prixKmSupplementaire?.km) {
    const { prix, km } = c.prixKmSupplementaire
    // Tarif au km : 2 décimales (souvent < 1 €), contrairement aux montants ronds.
    const price = formatPrice(prix, 2)
    items.push({
      key: 'km-supp',
      label: t('car.rental.kmSupplementaire'),
      value: km > 1 ? `${price}/${km} ${t('car.rental.units.km')}` : `${price}/${t('car.rental.units.km')}`,
    })
  }
  return items
})

const hasAny = computed(() =>
  hasPills.value || conditionsCells.value.length > 0 || fraisCells.value.length > 0,
)
</script>

<template>
  <div v-if="hasAny" class="car-rental">
    <TextsP3 weight="bold" tag="h2" class="car-rental__title">
      {{ t('car.rental.title') }}
    </TextsP3>

    <div class="car-rental__content">
      <div v-if="hasPills" class="car-rental__row car-rental__row--pills">
        <div v-if="rentalTypes.length" class="car-rental__group">
          <TextsP2 color="black-70" class="car-rental__group-label">
            {{ t('car.rental.typeLabel') }}
          </TextsP2>
          <ul class="car-rental__pills">
            <li v-for="rt in rentalTypes" :key="rt" class="car-rental__pill">
              <TextsP1>{{ rt }}</TextsP1>
            </li>
          </ul>
        </div>

        <div class="car-rental__group">
          <TextsP2 color="black-70" class="car-rental__group-label">
            {{ assuranceTitle }}
          </TextsP2>
          <ul class="car-rental__pills">
            <li class="car-rental__pill">
              <TextsP1>{{ assuranceValue }}</TextsP1>
            </li>
          </ul>
        </div>

        <div v-if="paiements.length" class="car-rental__group">
          <TextsP2 color="black-70" class="car-rental__group-label">
            {{ t('car.rental.paymentsLabel') }}
          </TextsP2>
          <ul class="car-rental__pills">
            <li v-for="p in paiements" :key="p" class="car-rental__pill">
              <TextsP1>{{ p }}</TextsP1>
            </li>
          </ul>
        </div>
      </div>

      <hr v-if="hasPills && conditionsCells.length" class="car-rental__divider">

      <div v-if="conditionsCells.length" class="car-rental__row car-rental__row--cells">
        <div v-for="cell in conditionsCells" :key="cell.key" class="car-rental__cell">
          <TextsP2 color="black-70" class="car-rental__cell-label">
            {{ cell.label }}
          </TextsP2>
          <TextsP1 class="car-rental__cell-value">
            {{ cell.value }}
          </TextsP1>
        </div>
      </div>

      <hr v-if="(hasPills || conditionsCells.length) && fraisCells.length" class="car-rental__divider">

      <div v-if="fraisCells.length" class="car-rental__row car-rental__row--cells">
        <div v-for="cell in fraisCells" :key="cell.key" class="car-rental__cell">
          <TextsP2 color="black-70" class="car-rental__cell-label">
            {{ cell.label }}
          </TextsP2>
          <TextsP1 class="car-rental__cell-value">
            {{ cell.value }}
          </TextsP1>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.car-rental {
  display: flex;
  flex-direction: column;
  gap: desktop-vw(24px);

  @include mobile {
    gap: mobile-vw(16px);
  }

  &__title {
    color: var(--c-black-100);
  }

  &__content {
    display: flex;
    flex-direction: column;
  }

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

    &--pills > .car-rental__group {
      flex: 1 0 0;
      min-width: 0;

      @include mobile {
        flex: 1 0 100%;
      }
    }

    &--cells > .car-rental__cell {
      flex: 0 0 calc((100% - #{desktop-vw(32px * 2)}) / 3);

      @include mobile {
        flex: 1 0 calc(50% - #{mobile-vw(8px)});
      }
    }
  }

  &__group {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(8px);

    @include mobile {
      gap: mobile-vw(6px);
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
    padding: desktop-vw(16px) desktop-vw(24px);
    border-radius: desktop-vw(40px);
    color: var(--c-black-100);

    @include mobile {
      padding: mobile-vw(12px) mobile-vw(18px);
      border-radius: mobile-vw(40px);
    }
  }

  &__cell {
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
