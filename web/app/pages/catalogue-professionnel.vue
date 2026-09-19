<script lang="ts" setup>
import { CATALOGUE_PRO_CARS_QUERY, CATALOGUE_PRO_FACETS_QUERY, CATALOGUE_PRO_QUERY } from '~/queries/catalogue'

const { page, cars, isLoading, facets, filters, setFilter, resetFilters, hasActiveFilters } = await useCatalogueListing(
  CATALOGUE_PRO_QUERY,
  CATALOGUE_PRO_CARS_QUERY,
  CATALOGUE_PRO_FACETS_QUERY,
)

usePageSeo(computed(() => page.value?.seo))

provideWhatsappMessage(computed(() => page.value?.whatsappMessage))

useMenuCtaSnap()
</script>

<template>
  <main class="page-catalogue-professionnel">
    <ElementsCatalogueListing
      :title="page?.title"
      :description="page?.description"
      :cars="cars"
      :is-loading="isLoading"
      :content-pre-footer="page?.contentPreFooter"
      :facets="facets"
      :filters="filters"
      :has-active-filters="hasActiveFilters"
      pro-contact-link
      @update-filter="setFilter"
      @reset-filters="resetFilters"
    />
  </main>
</template>

<style lang="scss">
.page-catalogue-professionnel {
  .app-elements-catalogue-listing__header-title {
    max-width: desktop-vw(1000px);

    @include mobile {
      max-width: mobile-vw(100%);
    }
  }
}
</style>
