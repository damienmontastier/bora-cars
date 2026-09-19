<script lang="ts" setup>
// Flèche des cartes-liens (DS « Form / LinkCard »), tracé exporté de Figma.
const props = defineProps({
  color: {
    type: String,
    default: 'beige-100',
  },
})
</script>

<template>
  <div class="svg-icon-link-arrow">
    <svg viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path :fill="`var(--c-${props.color})`" d="M25.5908 15L14.5303 26.0605L12.4092 23.9395L19.8486 16.5H4.40918V13.5H19.8486L12.4092 6.06055L14.5303 3.93945L25.5908 15Z" />
    </svg>
  </div>
</template>

<style lang="scss">
:where(.svg-icon-link-arrow) {
  display: block;
  width: 100%;
  height: 100%;

  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>
