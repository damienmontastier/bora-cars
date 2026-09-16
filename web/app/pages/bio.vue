<script lang="ts" setup>
import type { BioData } from '~/queries/bio'
import type { CatalogueCar } from '~/queries/catalogue'
import { BIO_QUERY } from '~/queries/bio'

// Page « link in bio » : destination du lien en bio Instagram (maquette Figma
// « piste C · Stories ») — une story plein cadre par voiture citée dans les posts,
// avec WhatsApp et fiche sur chaque carte.
//
// La page est en `noindex, follow` (+ exclue du sitemap) — la règle est déclarée
// dans `nuxt.config.ts` → `routeRules`, PAS ici : Nuxt 4 scanne les métas de page
// après le hook où @nuxtjs/robots collecte `definePageMeta({ robots })`, donc une
// déclaration locale serait silencieusement ignorée.
//
// Pas de `provideWhatsappMessage` ici : chaque story construit son propre message
// (gabarit `whatsappMessage` rempli avec SA voiture), que le message de page
// écraserait dans `BaseLink`.

const lang = useSanityLang()

const params = reactive({ lang: lang.value })
watch(lang, (v) => {
  params.lang = v
})

const { data: page } = await useSanityQuery<BioData>(BIO_QUERY, params)

// Une référence vers une voiture supprimée / dépubliée revient à `null`.
const cars = computed<CatalogueCar[]>(() =>
  (page.value?.cars ?? []).filter((car): car is CatalogueCar => !!car),
)

usePageSeo(computed(() => page.value?.seo))

// Page sans hero : sans ça le CTA du menu reste masqué (il est normalement
// « libéré » par l'animation du hero).
useMenuCtaSnap()
</script>

<template>
  <main v-menu-theme="'white'" class="page-bio">
    <PageBioListing :cars="cars" :whatsapp-template="page?.whatsappMessage" />

    <!-- Footer réduit : le menu couvre déjà la navigation (cf. AppFooterMini). -->
    <AppFooterMini theme="black" />
  </main>
</template>

<style lang="scss">
.page-bio {
  min-height: 100vh;
  background: var(--c-black);
}
</style>
