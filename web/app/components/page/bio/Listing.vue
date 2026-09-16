<script lang="ts" setup>
import type { CatalogueCar } from '~/queries/catalogue'
import type { SanityLink } from '~/queries/modules'

interface Props {
  title?: string
  description?: string
  quickLinks?: SanityLink[]
  cars: CatalogueCar[]
}

defineProps<Props>()
</script>

<template>
  <div v-menu-theme="'black'" class="page-bio-listing">
    <div class="page-bio-listing__header">
      <TextsH1 v-if="title" :animated="false" class="page-bio-listing__title">
        {{ title }}
      </TextsH1>

      <TextsP1 v-if="description" weight="medium" class="page-bio-listing__description">
        {{ description }}
      </TextsP1>

      <nav v-if="quickLinks?.length" class="page-bio-listing__links">
        <AtomsCTA
          v-for="link in quickLinks"
          :key="link._key"
          :to="link"
          theme="black"
          class="page-bio-listing__link"
        >
          {{ link.text }}
        </AtomsCTA>
      </nav>
    </div>

    <!-- Même carte que le catalogue : le clic est déjà tracké (trackCatalogueCarClick). -->
    <div v-if="cars.length" class="page-bio-listing__grid">
      <ElementsCatalogueCard
        v-for="(car, index) in cars"
        :key="car._id"
        :car="car"
        :position="index"
      />
    </div>
  </div>
</template>

<style lang="scss">
.page-bio-listing {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  &__header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 15px;
    padding: desktop-vw(160px) desktop-vw(24px) desktop-vw(24px);
    text-align: center;

    @include mobile {
      padding: mobile-vw(120px) mobile-vw(8px) mobile-vw(32px) mobile-vw(8px);
    }
  }

  &__title {
    width: 100%;
    max-width: desktop-vw(900px);

    @include mobile {
      max-width: none;
      font-size: mobile-vw(52px);
      line-height: mobile-vw(52px);
    }
  }

  &__description {
    width: 100%;
    max-width: desktop-vw(750px);
    white-space: pre-line;

    @include mobile {
      max-width: none;
    }
  }

  &__links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: desktop-vw(12px);
    margin-top: desktop-vw(16px);

    @include mobile {
      gap: mobile-vw(10px);
      margin-top: mobile-vw(12px);
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
      padding: mobile-vw(8px) mobile-vw(8px) mobile-vw(40px) mobile-vw(8px);
    }
  }
}
</style>
