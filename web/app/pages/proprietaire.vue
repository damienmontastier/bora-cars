<script lang="ts" setup>
import type { ProprietaireData } from '~/queries/proprietaire'
import { PROPRIETAIRE_QUERY } from '~/queries/proprietaire'

const { data: page } = await useSanityQuery<ProprietaireData>(PROPRIETAIRE_QUERY)
</script>

<template>
  <main class="page-proprietaire">
    <ElementsHero :data="page?.hero ?? null" />

    <ElementsPitch :data="page?.pitch ?? null" />

    <ElementsProcessSteps :steps="page?.process?.steps ?? []" />

    <AppFooter />
  </main>
</template>

<style lang="scss">
.page-proprietaire {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 0px;
}
</style>
