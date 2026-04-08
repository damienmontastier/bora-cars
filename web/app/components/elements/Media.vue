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
</script>

<template>
  <div class="app-elements-media">
    <div v-if="!props.src" class="app-elements-media__placeholder" />
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

  &__placeholder {
    width: 100%;
    height: 100%;
    background: var(--c-beige-20);
  }
}
</style>
