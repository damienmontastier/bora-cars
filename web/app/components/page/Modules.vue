<script setup lang="ts">
import type { PageModule } from '~/queries/modules'

interface Props {
  modules: PageModule[]
  cardsColumnTheme?: 'black' | 'white'
}

const props = withDefaults(defineProps<Props>(), {
  cardsColumnTheme: 'black',
})

const heroModule = computed(() =>
  props.modules.find(m => m._type === 'hero') ?? null,
)
const otherModules = computed(() =>
  props.modules.filter(m => m._type !== 'hero'),
)
</script>

<template>
  <ElementsHero :data="heroModule" />

  <template v-for="module in otherModules" :key="module._key">
    <ElementsServicesCards v-if="module._type === 'serviceCards'" :cards="module.cards" />
    <ElementsPitch v-else-if="module._type === 'pitch'" :data="module" />
    <ElementsProcessSteps v-else-if="module._type === 'process'" :steps="module.steps" />
    <ElementsBrandsSection v-else-if="module._type === 'brandsSection'" :data="module" />
    <ElementsFullscreenMarquee v-else-if="module._type === 'fullscreenMarquee'" :data="module" />
    <ElementsTitle v-else-if="module._type === 'title'" :eyebrow="module.eyebrow" :heading="module.heading" />
    <ElementsText v-else-if="module._type === 'textBlock'" :eyebrow="module.eyebrow" :body="module.body" />
    <ElementsFaq v-else-if="module._type === 'faq'" :items="module.items" />
    <ElementsCardsColumn
      v-else-if="module._type === 'cardsColumn'"
      :heading="module.heading"
      :subtext="module.subtext"
      :cards="module.cards"
      :theme="cardsColumnTheme"
    />
    <ElementsTestimonials v-else-if="module._type === 'testimonials'" :items="module.items" />
  </template>
</template>
