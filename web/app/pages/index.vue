<script lang="ts" setup>
import type { HomepageData } from '~/queries/home'
import { HOMEPAGE_QUERY } from '~/queries/home'

const lang = useSanityLang()
const params = reactive({ lang: lang.value })
watch(lang, (v) => {
  params.lang = v
})

const { data: homepage } = await useSanityQuery<HomepageData>(HOMEPAGE_QUERY, params)

usePageSeo(computed(() => homepage.value?.seo))

// Accueil : la marque MÈNE le title (`BORA CARS — {texte}`), à l'inverse du template
// global de app.vue (`{texte} — BORA CARS`). Override per-page via useHead — il prime
// sur le template global tant que l'accueil est monté ; à la navigation le composant
// se démonte et app.vue reprend la main.
const { name: siteName, separator } = useSiteConfig()
useHead({
  titleTemplate: chunk => chunk ? `${siteName ?? 'BORA CARS'} ${separator ?? '—'} ${chunk}` : (siteName ?? 'BORA CARS'),
})
</script>

<template>
  <main v-menu-theme="'orange'" class="page-main">
    <PageModules :modules="homepage?.modules ?? []" />
    <ElementsPartners />
    <AppFooter />
  </main>
</template>

<style lang="scss">
.page-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 0px;
}
</style>
