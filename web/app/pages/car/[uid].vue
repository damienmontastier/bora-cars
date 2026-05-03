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
  'particulier': 'Particulier',
}

usePageSeo(computed(() => car.value
  ? {
      title: `${car.value.marque} ${car.value.modele}`,
    }
  : undefined))
</script>

<template>
  <main class="page-car">
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

    <section v-menu-theme="'black'" class="page-car__content">
      <div class="page-car__info">
        <ul v-if="car?.rentalTypes?.length" class="page-car__tags">
          <li v-for="type in car.rentalTypes" :key="type" class="page-car__tag">
            <TextsCTA>{{ RENTAL_LABELS[type] ?? type }}</TextsCTA>
          </li>
        </ul>
      </div>

      <div v-if="car?.location" class="page-car__location">
        <TextsP1 v-if="car.location.city" class="page-car__location-city">
          {{ car.location.city }}
        </TextsP1>
        <TextsP2 v-if="car.location.address" class="page-car__location-address" color="black-40">
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

  &__content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: desktop-vw(24px);
    padding: desktop-vw(64px) desktop-vw(24px) desktop-vw(120px);

    @include mobile {
      grid-template-columns: 1fr;
      gap: mobile-vw(48px);
      padding: mobile-vw(48px) mobile-vw(20px) mobile-vw(80px);
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(24px);

    @include mobile {
      gap: mobile-vw(20px);
    }
  }

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

  &__location {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(12px);

    @include mobile {
      gap: mobile-vw(10px);
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
    gap: desktop-vw(8px);
    margin-top: desktop-vw(8px);

    @include mobile {
      gap: mobile-vw(8px);
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
}
</style>
