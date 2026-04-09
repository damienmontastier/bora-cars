<script setup lang="ts">
import type { ServiceCard } from '~/queries/home'

interface Props {
  cards: ServiceCard[]
}

defineProps<Props>()
</script>

<template>
  <section class="app-elements-services-cards">
    <div class="app-elements-services-cards__grid">
      <ElementsServiceCard
        v-for="card in cards"
        :key="card._key"
        :card="card"
      />
    </div>
  </section>
</template>

<style lang="scss">
.app-elements-services-cards {
  width: 100%;
  background: var(--c-beige-100);
  padding: desktop-vw(8px) desktop-vw(8px) desktop-vw(40px);
  align-self: flex-end;

  &__grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-auto-rows: auto;
    gap: desktop-vw(12px);
    width: 100%;
  }
}
</style>
