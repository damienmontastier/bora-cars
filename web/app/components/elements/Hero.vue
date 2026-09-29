<script setup lang="ts">
import type { HeroData } from '~/queries/home'

interface Props {
  data: HeroData | null
  clipPath?: boolean
  variant?: 'variant-1' | 'variant-2' | 'variant-3'
}

const props = withDefaults(defineProps<Props>(), {
  clipPath: true,
  variant: 'variant-1',
})
</script>

<template>
  <ElementsHero1 v-if="props.variant === 'variant-1'" :data="props.data" :clip-path="props.clipPath" />
  <ElementsHero2 v-else-if="props.variant === 'variant-2'" :data="props.data" :clip-path="props.clipPath" />
  <ElementsHero3 v-else :data="props.data" :clip-path="props.clipPath" />
</template>
