<script lang="ts" setup>
import type { CatalogueCar, CatalogueTextBlock } from '~/queries/catalogue'

interface Props {
  title?: string
  description?: string
  cars: CatalogueCar[]
  isLoading?: boolean
  contentPreFooter?: CatalogueTextBlock
}

defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <div v-menu-theme="'black'" class="app-elements-catalogue-listing">
    <div v-menu-theme="'black'" class="app-elements-catalogue-listing__header">
      <TextsH1 v-if="title" class="app-elements-catalogue-listing__header-title">
        {{ title }}
      </TextsH1>

      <TextsP2 v-if="description" weight="regular" class="app-elements-catalogue-listing__header-description">
        {{ description }}
      </TextsP2>
    </div>

    <DevOnly>
      <div class="app-elements-catalogue-listing__filters">
        {{ t('catalogue.filtersPlaceholder') }}
      </div>
    </DevOnly>

    <div class="app-elements-catalogue-listing__grid">
      <ElementsCatalogueCard
        v-for="(car, index) in cars"
        :key="car._id"
        :car="car"
        :position="index"
      />
    </div>

    <div v-if="isLoading" class="app-elements-catalogue-listing__loader" aria-hidden="true">
      <span class="app-elements-catalogue-listing__loader-dot" />
      <span class="app-elements-catalogue-listing__loader-dot" />
      <span class="app-elements-catalogue-listing__loader-dot" />
    </div>

    <ElementsText
      v-if="contentPreFooter"
      :eyebrow="contentPreFooter.eyebrow"
      :body="contentPreFooter.body"
    />

    <AppFooter />
  </div>
</template>

<style lang="scss">
.app-elements-catalogue-listing {
  display: flex;
  flex-direction: column;

  &__header {
    padding: desktop-vw(160px) desktop-vw(24px) desktop-vw(24px);
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 15px;

    @include mobile {
      padding: mobile-vw(120px) mobile-vw(8px) mobile-vw(40px) mobile-vw(8px);
    }
  }

  &__header-title {
    max-width: desktop-vw(900px);
    width: 100%;

    @include mobile {
      max-width: none;
    }
  }

  &__filters {
    padding: desktop-vw(24px) desktop-vw(24px);
    background-color: red;
  }

  &__header-description {
    max-width: desktop-vw(750px);
    width: 100%;
    white-space: pre-line;

    @include mobile {
      max-width: none;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: desktop-vw(40px) desktop-vw(12px);
    padding: desktop-vw(24px) desktop-vw(8px) desktop-vw(64px) desktop-vw(8px);

    @include mobile {
      grid-template-columns: 1fr;
      gap: mobile-vw(12px);
      padding: mobile-vw(8px);
    }
  }

  &__loader {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: desktop-vw(8px);
    padding-bottom: desktop-vw(80px);
  }

  &__loader-dot {
    width: desktop-vw(8px);
    height: desktop-vw(8px);
    border-radius: 50%;
    background: var(--c-orange);
    animation: catalogue-dot-pulse 1.2s ease-in-out infinite;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    &:nth-child(3) {
      animation-delay: 0.4s;
    }

    @include mobile {
      width: mobile-vw(8px);
      height: mobile-vw(8px);
    }
  }
}

@keyframes catalogue-dot-pulse {
  0%,
  80%,
  100% {
    opacity: 0.2;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
