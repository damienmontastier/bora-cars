<script lang="ts" setup>
import type { BioData } from '~/queries/bio'
import type { CatalogueCar } from '~/queries/catalogue'
import { BIO_QUERY } from '~/queries/bio'

// Page « link in bio » : destination du lien en bio Instagram, elle liste les
// voitures citées dans les posts / stories (liste ordonnée à la main côté Studio).
//
// La page est en `noindex, follow` (+ exclue du sitemap) — la règle est déclarée
// dans `nuxt.config.ts` → `routeRules`, PAS ici : Nuxt 4 scanne les métas de page
// après le hook où @nuxtjs/robots collecte `definePageMeta({ robots })`, donc une
// déclaration locale serait silencieusement ignorée.

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

// Message pré-rempli pour les CTA WhatsApp de cette page (injecté par BaseLink) —
// sert à repérer les contacts venus d'Instagram.
provideWhatsappMessage(computed(() => page.value?.whatsappMessage))

// Page sans hero : sans ça le CTA du menu reste masqué (il est normalement
// « libéré » par l'animation du hero).
useMenuCtaSnap()
</script>

<template>
  <main class="page-bio">
    <PageBioListing
      :title="page?.title"
      :description="page?.description"
      :quick-links="page?.quickLinks"
      :cars="cars"
    />
  </main>
</template>
