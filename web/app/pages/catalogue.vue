<script lang="ts" setup>
import { CATALOGUE_CARS_QUERY, CATALOGUE_QUERY } from '~/queries/catalogue'

const { page, cars, isLoading } = await useCatalogueListing(CATALOGUE_QUERY, CATALOGUE_CARS_QUERY)

usePageSeo(computed(() => page.value?.seo))

// Message pré-rempli pour tous les CTA WhatsApp de cette page (injecté par BaseLink)
provideWhatsappMessage(computed(() => page.value?.whatsappMessage))

useMenuCtaSnap()
</script>

<template>
  <main class="page-catalogue">
    <ElementsCatalogueListing
      :title="page?.title"
      :description="page?.description"
      :cars="cars"
      :is-loading="isLoading"
      :content-pre-footer="page?.contentPreFooter"
    />
  </main>
</template>
