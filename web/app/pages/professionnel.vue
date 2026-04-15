<script lang="ts" setup>
import type { ProfessionnelData } from '~/queries/professionnel'
import { PROFESSIONNEL_QUERY } from '~/queries/professionnel'

const { data: page } = await useSanityQuery<ProfessionnelData>(PROFESSIONNEL_QUERY)
</script>

<template>
  <main class="page-professionnel">
    <ElementsHero :data="page?.hero ?? null" />

    <ElementsCardsColumn
      :heading="page?.cardsColumn?.heading"
      :subtext="page?.cardsColumn?.subtext"
      :cards="page?.cardsColumn?.cards ?? []"
    />

    <div class="app-debug-wip" style="width: 100%;height: 100vh;background-color: var(--c-beige-20);">
      <TextsH2 v-for="i in 3" :key="i">
        ...FULLSCREEN — MARQUEE...
      </TextsH2>
    </div>

    <ElementsTitle
      :eyebrow="page?.title?.eyebrow"
      :heading="page?.title?.heading"
    />

    <ElementsFaq :items="page?.faq?.items ?? []" />

    <ElementsText
      :eyebrow="page?.textBlock?.eyebrow"
      :body="page?.textBlock?.body"
    />

    <AppFooter />
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
  background: var(--c-black-100);
}
</style>
