<script lang="ts" setup>
import type { ProfessionnelData } from '~/queries/professionnel'
import { PROFESSIONNEL_QUERY } from '~/queries/professionnel'

const lang = useSanityLang()
const params = reactive({ lang: lang.value })
watch(lang, (v) => {
  params.lang = v
})

const { data: page } = await useSanityQuery<ProfessionnelData>(PROFESSIONNEL_QUERY, params)
</script>

<template>
  <main v-menu-theme="'white'" class="page-professionnel">
    <ElementsHero :data="page?.hero ?? null" />

    <ElementsCardsColumn
      :heading="page?.cardsColumn?.heading"
      :subtext="page?.cardsColumn?.subtext"
      :cards="page?.cardsColumn?.cards ?? []"
      theme="white"
    />

    <ElementsFullscreenMarquee
      v-if="page?.fullscreenMarquee"
      :data="page.fullscreenMarquee"
    />

    <ElementsTitle
      :eyebrow="page?.title?.eyebrow"
      :heading="page?.title?.heading"
    />

    <ElementsFaq :items="page?.faq?.items ?? []" />

    <ElementsText
      :eyebrow="page?.textBlock?.eyebrow"
      :body="page?.textBlock?.body"
    />

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
