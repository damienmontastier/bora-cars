<script lang="ts" setup>
import type { CatalogueCar } from '~/queries/catalogue'

interface Props {
  cars: CatalogueCar[]
  whatsappTemplate?: string
}

const props = defineProps<Props>()

const { t } = useI18n()

const countLabel = computed(() => {
  const n = props.cars.length
  return t('bio.header.count', { count: String(n).padStart(2, '0') }, n)
})
</script>

<template>
  <div class="page-bio-listing">
    <header class="page-bio-listing__header">
      <div class="page-bio-listing__heading">
        <TextsP2 color="beige-100" class="page-bio-listing__eyebrow">
          {{ t('bio.header.eyebrow') }}
        </TextsP2>
        <TextsH2 tag="h1" color="beige-100" :animated="false" class="page-bio-listing__title">
          {{ t('bio.header.title') }}
        </TextsH2>
      </div>

      <TextsLabel v-if="cars.length" color="beige-40" class="page-bio-listing__count">
        {{ countLabel }}
      </TextsLabel>
    </header>

    <div v-if="cars.length" class="page-bio-listing__stories">
      <PageBioStory
        v-for="(car, index) in cars"
        :key="car._id"
        :car="car"
        :index="index"
        :total="cars.length"
        :whatsapp-template="whatsappTemplate"
      />
    </div>

    <section class="page-bio-listing__end">
      <div class="page-bio-listing__end-inner">
        <TextsP2 color="beige-100" class="page-bio-listing__end-eyebrow">
          {{ t('bio.end.eyebrow') }}
        </TextsP2>
        <TextsH3 tag="p" color="beige-100" class="page-bio-listing__end-text">
          {{ t('bio.end.text') }}
        </TextsH3>
        <AtomsCTA
          :to="{ name: 'catalogue' }"
          theme="beige"
          :tiret-after="1"
          class="page-bio-listing__end-cta"
        >
          {{ t('bio.end.cta') }}
        </AtomsCTA>
      </div>
    </section>
  </div>
</template>

<style lang="scss">
.page-bio-listing {
  display: flex;
  flex-direction: column;

  &__header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: desktop-vw(24px);
    padding: desktop-vw(148px) desktop-vw(8px) desktop-vw(40px);

    @include mobile {
      padding: mobile-vw(96px) mobile-vw(8px) mobile-vw(24px);
    }
  }

  &__heading {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(8px);
    max-width: desktop-vw(1000px);

    @include mobile {
      gap: mobile-vw(8px);
      max-width: none;
    }
  }

  &__eyebrow {
    @include mobile {
      font-size: mobile-vw(12px);
      line-height: mobile-vw(16px);
    }
  }

  &__title {
    @include mobile {
      font-size: mobile-vw(64px);
      line-height: mobile-vw(64px);
    }
  }

  &__count {
    flex-shrink: 0;
    white-space: nowrap;

    @include mobile {
      display: none;
    }
  }

  &__stories {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: desktop-vw(8px);
    padding: 0 desktop-vw(8px);

    @include mobile {
      grid-template-columns: 1fr;
      gap: mobile-vw(8px);
      padding: 0 mobile-vw(8px);
    }
  }

  &__end {
    padding: desktop-vw(160px) desktop-vw(24px) desktop-vw(160px) desktop-vw(584px);

    @include mobile {
      padding: mobile-vw(48px) mobile-vw(8px);
    }
  }

  &__end-inner {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: desktop-vw(32px);
    max-width: desktop-vw(832px);

    @include mobile {
      gap: mobile-vw(16px);
      max-width: none;
    }
  }

  &__end-eyebrow {
    @include mobile {
      display: none;
    }
  }

  &__end-text {
    @include mobile {
      font-family: var(--font-haas-grot-disp-regular);
      font-size: mobile-vw(20px);
      line-height: mobile-vw(26px);
      font-weight: 500;
    }
  }

  &__end-cta {
    @include mobile {
      width: 100%;
    }
  }
}
</style>
