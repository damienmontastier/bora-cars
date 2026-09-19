<script setup lang="ts">
import type { CatalogueCar } from '~/queries/catalogue'

interface Props {
  car: CatalogueCar
  position?: number
}

const { car, position } = defineProps<Props>()

// Première rangée de la grille (3 colonnes en desktop) : visible au chargement, elle
// porte le LCP du catalogue → chargée d'emblée, la 1re carte préchargée en priorité
// haute. Les suivantes restent en lazy. `sizes` : une colonne ≈ 32,6vw en desktop
// (3 colonnes, marges et gouttières déduites), toute la largeur en mobile.
const aboveFold = computed(() => position != null && position < 3)

const { t } = useI18n()

// La carte suit le sélecteur de devise de la fiche voiture (état partagé, cf.
// useCurrency) : un visiteur passé en CHF ne doit pas retomber sur des euros en
// revenant au catalogue.
const { formatPrice } = useCurrency()

// Le schéma Sanity garantit qu'un seul des deux prix est renseigné.
// On privilégie le mensuel s'il existe, sinon le journalier.
const priceLabel = computed(() => {
  const value = car.prixMensuel ?? car.prixJournalier ?? null
  if (value == null)
    return null
  const price = formatPrice(value)
  return car.prixMensuel != null
    ? t('catalogue.card.startingFromMonthly', { price })
    : t('catalogue.card.startingFrom', { price })
})

const analytics = useAnalytics()
function onClick() {
  analytics.trackCatalogueCarClick({
    car_id: car._id,
    car_slug: car.slug ?? undefined,
    car_brand: car.marque,
    car_model: car.modele,
    position,
  })
}
</script>

<template>
  <UtilsBaseLink
    :to="{ name: 'car-uid', params: { uid: car.slug } }"
    class="app-elements-catalogue-card"
    :class="{ 'app-elements-catalogue-card--linked': !!car.slug }"
    @click="onClick"
  >
    <div class="app-elements-catalogue-card__media">
      <ElementsMedia
        v-if="car.imageUrl"
        :src="car.imageUrl"
        :alt="`${car.marque} ${car.modele}`"
        provider="sanity"
        :hotspot="car.imageHotspot"
        :crop="car.imageCrop"
        :modifiers="{ quality: 95 }"
        :lazy="!aboveFold"
        :preload="position === 0 ? { fetchPriority: 'high' } : false"
        :overlay="{ variant: 'panel', color: 'orange-100' }"
        sizes="96vw sm:34vw md:34vw lg:34vw xl:34vw xxl:34vw"
      />
      <div v-else class="app-elements-catalogue-card__placeholder" />
    </div>

    <div class="app-elements-catalogue-card__info">
      <div class="app-elements-catalogue-card__name">
        <TextsLabel v-if="priceLabel" class="app-elements-catalogue-card__marque">
          {{ priceLabel }}
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

  @include mobile {
    gap: mobile-vw(8px);
  }

  &--linked &__media {
    overflow: hidden;

    .app-elements-media {
      transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      will-change: transform;
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

    @include mobile {
      gap: mobile-vw(12px);
    }
  }

  &__name {
    display: flex;
    flex-direction: column;
    width: 70%;

    @include mobile {
      width: 90%;
    }
  }
}
</style>
