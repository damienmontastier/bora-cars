<script lang="ts" setup>
import type { ProfessionnelData } from '~/queries/professionnel'
import { PROFESSIONNEL_QUERY } from '~/queries/professionnel'

const lang = useSanityLang()
const params = reactive({ lang: lang.value })
watch(lang, (v) => {
  params.lang = v
})

const { data: page } = await useSanityQuery<ProfessionnelData>(PROFESSIONNEL_QUERY, params)

// Message pré-rempli pour tous les CTA WhatsApp de cette page (injecté par BaseLink)
provideWhatsappMessage(computed(() => page.value?.whatsappMessage))

usePageSeo(computed(() => page.value?.seo))

useMenuCtaSnap()
</script>

<template>
  <main v-menu-theme="'white'" class="page-professionnel">
    <PageModules :modules="page?.modules ?? []" cards-column-theme="white" />
    <ElementsPartners />
    <AppFooter theme="black" />
  </main>
</template>

<style lang="scss">
.page-professionnel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 0px;
  background: var(--c-beige-100);
}
</style>
