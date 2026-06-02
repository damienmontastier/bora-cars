<script lang="ts" setup>
import { CATALOGUE_PRO_CARS_QUERY, CATALOGUE_PRO_QUERY } from '~/queries/catalogue'

const { page, cars, isLoading } = await useCatalogueListing(CATALOGUE_PRO_QUERY, CATALOGUE_PRO_CARS_QUERY)

usePageSeo(computed(() => page.value?.seo))

// Message pré-rempli pour tous les CTA WhatsApp de cette page (injecté par BaseLink)
provideWhatsappMessage(computed(() => page.value?.whatsappMessage))

useMenuCtaSnap()

const { t } = useI18n()
</script>

<template>
  <ElementsCatalogueListing
    :title="page?.title"
    :description="t('catalogueProfessionnel.description')"
    :cars="cars"
    :is-loading="isLoading"
    :content-pre-footer="page?.contentPreFooter"
  />
</template>
