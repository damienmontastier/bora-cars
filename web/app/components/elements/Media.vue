<script setup lang="ts">
const props = defineProps({
  src: {
    type: String,
    default: '/img/placeholder/hero.png',
  },
  alt: {
    type: String,
    default: 'alt-default',
  },
})

const isExternal = computed(() => props.src.startsWith('http'))
</script>

<template>
  <div class="app-elements-media">
    <img v-if="!props.src || isExternal" :src="props.src || '/img/placeholder/hero.png'" :alt="props.alt">
    <NuxtPicture v-else :src="props.src" :alt="props.alt" />
  </div>
</template>

<style lang="scss">
.app-elements-media {
  position: relative;

  picture,
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>
