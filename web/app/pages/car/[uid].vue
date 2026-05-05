<script lang="ts" setup>
import type { CarDetailData } from '~/queries/car'
import { CAR_QUERY } from '~/queries/car'

const route = useRoute()
const lang = useSanityLang()

const params = reactive({ lang: lang.value, uid: route.params.uid as string })
watch(lang, (v) => { params.lang = v })

const { data: car } = await useSanityQuery<CarDetailData>(CAR_QUERY, params)

if (!car.value) {
  throw createError({ statusCode: 404, statusMessage: 'Voiture introuvable' })
}

const RENTAL_LABELS: Record<string, string> = {
  'longue-duree': 'Longue durée',
  'professionnel': 'Pro',
  'courte-duree': 'Courte durée',
  'particulier': 'Particulier',
}

const CARBURANT_LABELS: Record<string, string> = {
  'essence': 'Essence',
  'electrique': 'Électrique',
  'diesel': 'Diesel',
  'hybride-rechargeable': 'Hybride Rechargeable',
}

const BOITE_LABELS: Record<string, string> = {
  'automatique': 'Automatique',
  'manuelle': 'Manuelle',
}

const PAIEMENT_LABELS: Record<string, string> = {
  'virement': 'Virement',
  'carte': 'Carte bancaire',
  'especes': 'Espèces',
}

const GAMME_LABELS: Record<string, string> = {
  'suv': 'SUV',
  'sportive': 'Sportive',
  'berline': 'Berline',
  'citadine': 'Citadine',
  'compacte': 'Compacte',
  'break': 'Break',
}

const specs = computed(() => {
  const c = car.value
  if (!c) return []
  return [
    c.annee && { label: 'Année', value: c.annee },
    c.gamme && { label: 'Gamme', value: GAMME_LABELS[c.gamme] ?? c.gamme },
    c.carburant && { label: 'Carburant', value: CARBURANT_LABELS[c.carburant] ?? c.carburant },
    c.boiteVitesse && { label: 'Boîte', value: BOITE_LABELS[c.boiteVitesse] ?? c.boiteVitesse },
    c.nombrePlaces && { label: 'Places', value: `${c.nombrePlaces}` },
    c.puissance && { label: 'Puissance', value: `${c.puissance} CV` },
  ].filter(Boolean) as { label: string, value: string }[]
})

usePageSeo(computed(() => car.value
  ? { title: `${car.value.marque} ${car.value.modele}`, image: car.value.ogImageUrl }
  : undefined))
</script>

<template>
  <main class="page-car">
    <!-- Hero -->
    <div v-menu-theme="'white'" class="page-car__hero">
      <div class="page-car__hero-media">
        <ElementsMedia
          v-if="car?.imageUrl"
          :src="car.imageUrl"
          :alt="`${car?.marque} ${car?.modele}`"
          provider="sanity"
          :hotspot="car?.imageHotspot"
          :crop="car?.imageCrop"
          :lazy="false"
          :preload="{ fetchPriority: 'high' }"
          :overlay="false"
        />
      </div>
      <div v-if="!car?.imageUrl" class="page-car__hero-placeholder" />

      <div class="page-car__hero-overlay">
        <UtilsBaseLink to="/catalogue" class="page-car__back">
          ← Catalogue
        </UtilsBaseLink>
        <div class="page-car__hero-title">
          <TextsH1 class="page-car__marque">
            {{ car?.marque }}
          </TextsH1>
          <TextsH2 class="page-car__modele">
            {{ car?.modele }}
          </TextsH2>
        </div>
      </div>
    </div>

    <!-- Specs bar -->
    <div v-if="specs.length" v-menu-theme="'black'" class="page-car__specs">
      <dl class="page-car__specs-list">
        <div v-for="spec in specs" :key="spec.label" class="page-car__spec">
          <dt class="page-car__spec-label">
            <TextsCTA>{{ spec.label }}</TextsCTA>
          </dt>
          <dd class="page-car__spec-value">
            <TextsP1>{{ spec.value }}</TextsP1>
          </dd>
        </div>
      </dl>
    </div>

    <!-- Main content -->
    <section v-menu-theme="'black'" class="page-car__content">
      <!-- Left: prix + conditions -->
      <div class="page-car__col page-car__col--left">
        <!-- Pricing -->
        <div v-if="car?.prixJournalier || car?.caution" class="page-car__block">
          <TextsH3 class="page-car__block-title">
            Tarifs
          </TextsH3>
          <dl class="page-car__dl">
            <div v-if="car?.prixJournalier" class="page-car__dl-row">
              <dt><TextsP2 color="black-40">Prix / jour</TextsP2></dt>
              <dd><TextsP1>{{ car.prixJournalier }} €</TextsP1></dd>
            </div>
            <div v-if="car?.caution" class="page-car__dl-row">
              <dt><TextsP2 color="black-40">Caution</TextsP2></dt>
              <dd><TextsP1>{{ car.caution }} €</TextsP1></dd>
            </div>
            <div v-if="car?.prixKmSupplementaire?.prix && car?.prixKmSupplementaire?.km" class="page-car__dl-row">
              <dt><TextsP2 color="black-40">Km supplémentaire</TextsP2></dt>
              <dd><TextsP1>{{ car.prixKmSupplementaire.prix }} € / {{ car.prixKmSupplementaire.km }} km</TextsP1></dd>
            </div>
            <div v-if="car?.kmJourInclus" class="page-car__dl-row">
              <dt><TextsP2 color="black-40">Km / jour inclus</TextsP2></dt>
              <dd><TextsP1>{{ car.kmJourInclus }} km</TextsP1></dd>
            </div>
            <div v-if="car?.dureeMinimum" class="page-car__dl-row">
              <dt><TextsP2 color="black-40">Durée minimum</TextsP2></dt>
              <dd><TextsP1>{{ car.dureeMinimum }} jour{{ car.dureeMinimum > 1 ? 's' : '' }}</TextsP1></dd>
            </div>
          </dl>
        </div>

        <!-- Rental conditions -->
        <div v-if="car?.ageMinimum || car?.anciennetePermis" class="page-car__block">
          <TextsH3 class="page-car__block-title">
            Conditions
          </TextsH3>
          <dl class="page-car__dl">
            <div v-if="car?.ageMinimum" class="page-car__dl-row">
              <dt><TextsP2 color="black-40">Âge minimum</TextsP2></dt>
              <dd><TextsP1>{{ car.ageMinimum }} ans</TextsP1></dd>
            </div>
            <div v-if="car?.anciennetePermis !== undefined && car?.anciennetePermis !== null" class="page-car__dl-row">
              <dt><TextsP2 color="black-40">Permis minimum</TextsP2></dt>
              <dd><TextsP1>{{ car.anciennetePermis }} an{{ car.anciennetePermis > 1 ? 's' : '' }}</TextsP1></dd>
            </div>
          </dl>
        </div>

        <!-- Types de location -->
        <div v-if="car?.rentalTypes?.length" class="page-car__block">
          <TextsH3 class="page-car__block-title">
            Types de location
          </TextsH3>
          <ul class="page-car__tags">
            <li v-for="type in car.rentalTypes" :key="type" class="page-car__tag">
              <TextsCTA>{{ RENTAL_LABELS[type] ?? type }}</TextsCTA>
            </li>
          </ul>
        </div>

        <!-- Paiements -->
        <div v-if="car?.paiementsAcceptes?.length" class="page-car__block">
          <TextsH3 class="page-car__block-title">
            Paiements acceptés
          </TextsH3>
          <ul class="page-car__tags">
            <li v-for="mode in car.paiementsAcceptes" :key="mode" class="page-car__tag">
              <TextsCTA>{{ PAIEMENT_LABELS[mode] ?? mode }}</TextsCTA>
            </li>
          </ul>
        </div>
      </div>

      <!-- Right: location + équipements -->
      <div class="page-car__col page-car__col--right">
        <!-- Location -->
        <div v-if="car?.location" class="page-car__block">
          <TextsH3 class="page-car__block-title">
            Lieu
          </TextsH3>
          <div class="page-car__location">
            <TextsP1 v-if="car.location.city" class="page-car__location-city">
              {{ car.location.city }}
            </TextsP1>
            <TextsP2 v-if="car.location.address" color="black-40" class="page-car__location-address">
              {{ car.location.address }}
            </TextsP2>
            <div class="page-car__location-cta">
              <UtilsBaseLink
                v-if="car.location.phone?.phone"
                :to="{ type: 'phone', phone: car.location.phone.phone, text: car.location.phone.text }"
                class="page-car__contact-link"
              >
                {{ car.location.phone.text || car.location.phone.phone }}
              </UtilsBaseLink>
              <UtilsBaseLink
                v-if="car.location.email?.email"
                :to="{ type: 'email', email: car.location.email.email, text: car.location.email.text }"
                class="page-car__contact-link"
              >
                {{ car.location.email.text || car.location.email.email }}
              </UtilsBaseLink>
            </div>
          </div>
        </div>

        <!-- Équipements -->
        <div v-if="car?.equipements?.length" class="page-car__block">
          <TextsH3 class="page-car__block-title">
            Équipements
          </TextsH3>
          <ul class="page-car__equipements">
            <li v-for="eq in car.equipements" :key="eq" class="page-car__equipement">
              <TextsP2>{{ eq }}</TextsP2>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Gallery -->
    <section v-if="car?.images?.length" v-menu-theme="'black'" class="page-car__gallery">
      <TextsH3 class="page-car__gallery-title">
        Photos
      </TextsH3>
      <div class="page-car__gallery-grid">
        <div v-for="(img, i) in car.images" :key="i" class="page-car__gallery-item">
          <ElementsMedia
            :src="img.imageUrl"
            :alt="img.imageAlt ?? `${car?.marque} ${car?.modele} ${i + 1}`"
            provider="sanity"
            :hotspot="img.imageHotspot"
            :crop="img.imageCrop"
            sizes="sm:100vw md:50vw"
            overlay-color="beige"
          />
        </div>
      </div>
    </section>

    <AppFooter />
  </main>
</template>

<style lang="scss">
.page-car {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  &__hero {
    position: relative;
    width: 100%;
    height: 90vh;
    overflow: hidden;

    @include mobile {
      height: 70vh;
    }
  }

  &__hero-media {
    position: absolute;
    inset: 0;

    .app-elements-media {
      width: 100%;
      height: 100%;
    }
  }

  &__hero-placeholder {
    position: absolute;
    inset: 0;
    background: var(--c-beige-20);
  }

  &__hero-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: desktop-vw(100px) desktop-vw(24px) desktop-vw(48px);
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.1) 0%,
      transparent 30%,
      transparent 60%,
      rgba(0, 0, 0, 0.5) 100%
    );

    @include mobile {
      padding: mobile-vw(80px) mobile-vw(20px) mobile-vw(32px);
    }
  }

  &__back {
    display: inline-flex;
    align-items: center;
    color: var(--c-white);
    text-decoration: none;
    font-size: desktop-vw(14px);
    letter-spacing: 0.05em;
    opacity: 0.8;
    transition: opacity 0.2s;

    @include hover {
      &:hover {
        opacity: 1;
      }
    }

    @include mobile {
      font-size: mobile-vw(13px);
    }
  }

  &__hero-title {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(8px);

    @include mobile {
      gap: mobile-vw(6px);
    }
  }

  &__marque {
    color: var(--c-white);
  }

  &__modele {
    color: var(--c-white-60);
  }

  // Specs bar
  &__specs {
    border-bottom: 1px solid var(--c-black-10);
    padding: desktop-vw(32px) desktop-vw(24px);
    overflow-x: auto;

    @include mobile {
      padding: mobile-vw(24px) mobile-vw(20px);
    }
  }

  &__specs-list {
    display: flex;
    gap: desktop-vw(48px);
    margin: 0;
    min-width: min-content;

    @include mobile {
      gap: mobile-vw(32px);
    }
  }

  &__spec {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(6px);
    white-space: nowrap;

    @include mobile {
      gap: mobile-vw(4px);
    }
  }

  &__spec-label {
    color: var(--c-black-40);
  }

  &__spec-value {
    margin: 0;
  }

  // Main content grid
  &__content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: desktop-vw(80px);
    padding: desktop-vw(80px) desktop-vw(24px) desktop-vw(120px);

    @include mobile {
      grid-template-columns: 1fr;
      gap: mobile-vw(0);
      padding: mobile-vw(48px) mobile-vw(20px) mobile-vw(80px);
    }
  }

  &__col {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(56px);

    @include mobile {
      gap: mobile-vw(40px);

      &--right {
        border-top: 1px solid var(--c-black-10);
        padding-top: mobile-vw(40px);
      }
    }
  }

  &__block {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(20px);

    @include mobile {
      gap: mobile-vw(16px);
    }
  }

  &__block-title {
    padding-bottom: desktop-vw(12px);
    border-bottom: 1px solid var(--c-black-10);

    @include mobile {
      padding-bottom: mobile-vw(10px);
    }
  }

  // Definition list
  &__dl {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(12px);
    margin: 0;

    @include mobile {
      gap: mobile-vw(10px);
    }
  }

  &__dl-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: desktop-vw(16px);

    dt,
    dd {
      margin: 0;
    }

    @include mobile {
      gap: mobile-vw(12px);
    }
  }

  // Tags
  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: desktop-vw(8px);
    list-style: none;
    margin: 0;
    padding: 0;

    @include mobile {
      gap: mobile-vw(6px);
    }
  }

  &__tag {
    border: 1px solid var(--c-black-20);
    padding: desktop-vw(8px) desktop-vw(16px);
    border-radius: 999px;

    @include mobile {
      padding: mobile-vw(6px) mobile-vw(14px);
    }
  }

  // Location
  &__location {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(8px);

    @include mobile {
      gap: mobile-vw(6px);
    }
  }

  &__location-city {
    font-weight: 600;
  }

  &__location-address {
    white-space: pre-line;
  }

  &__location-cta {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(6px);
    margin-top: desktop-vw(8px);

    @include mobile {
      gap: mobile-vw(6px);
      margin-top: mobile-vw(8px);
    }
  }

  &__contact-link {
    display: inline-flex;
    align-items: center;
    color: var(--c-orange);
    text-decoration: none;
    font-size: desktop-vw(14px);

    @include hover {
      &:hover {
        text-decoration: underline;
      }
    }

    @include mobile {
      font-size: mobile-vw(14px);
    }
  }

  // Équipements
  &__equipements {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(10px);
    list-style: none;
    margin: 0;
    padding: 0;

    @include mobile {
      gap: mobile-vw(8px);
    }
  }

  &__equipement {
    display: flex;
    align-items: center;
    gap: desktop-vw(10px);
    padding-bottom: desktop-vw(10px);
    border-bottom: 1px solid var(--c-black-5);

    &::before {
      content: '';
      display: block;
      width: desktop-vw(4px);
      height: desktop-vw(4px);
      border-radius: 50%;
      background: var(--c-orange);
      flex-shrink: 0;

      @include mobile {
        width: mobile-vw(4px);
        height: mobile-vw(4px);
      }
    }

    @include mobile {
      gap: mobile-vw(8px);
      padding-bottom: mobile-vw(8px);
    }
  }

  // Gallery
  &__gallery {
    padding: desktop-vw(80px) desktop-vw(24px) desktop-vw(120px);
    border-top: 1px solid var(--c-black-10);
    display: flex;
    flex-direction: column;
    gap: desktop-vw(40px);

    @include mobile {
      padding: mobile-vw(48px) mobile-vw(20px) mobile-vw(80px);
      gap: mobile-vw(24px);
    }
  }

  &__gallery-title {
    // intentionally empty — just positions the title
  }

  &__gallery-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: desktop-vw(16px);

    @include mobile {
      grid-template-columns: 1fr;
      gap: mobile-vw(12px);
    }
  }

  &__gallery-item {
    aspect-ratio: 16 / 9;
    overflow: hidden;

    .app-elements-media {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
