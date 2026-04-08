<script lang="ts" setup>
import type { ProprietaireData } from '~/queries/proprietaire'
import { PROPRIETAIRE_QUERY } from '~/queries/proprietaire'

const { data: page } = await useSanityQuery<ProprietaireData>(PROPRIETAIRE_QUERY)
</script>

<template>
  <main class="page-proprietaire">
    <ElementsHero :data="page?.hero ?? null" />

    <ElementsProcessSteps :steps="page?.process?.steps ?? []" />

    <div class="app-debug-wip" style="width: 100%;height: 300vh;background-color: var(--c-beige-20);">
      <TextsH1 v-for="i in 3" :key="i">
        ...WIP...
      </TextsH1>
    </div>

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
