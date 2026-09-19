<script lang="ts" setup>
import type { BioData } from '~/queries/bio'
import type { CatalogueCar } from '~/queries/catalogue'
import { BIO_QUERY } from '~/queries/bio'

const lang = useSanityLang()

const params = reactive({ lang: lang.value })
watch(lang, (v) => {
  params.lang = v
})

const { data: page } = await useSanityQuery<BioData>(BIO_QUERY, params)

const cars = computed<CatalogueCar[]>(() =>
  (page.value?.cars ?? []).filter((car): car is CatalogueCar => !!car),
)

usePageSeo(computed(() => page.value?.seo))

useMenuCtaSnap()
</script>

<template>
  <main v-menu-theme="'white'" class="page-bio">
    <PageBioListing :cars="cars" :whatsapp-template="page?.whatsappMessage" />

    <AppFooterMini theme="black" />
  </main>
</template>

<style lang="scss">
.page-bio {
  min-height: 100vh;
  background: var(--c-black);
}
</style>
