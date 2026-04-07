<script lang="ts" setup>
const props = defineProps({
  color: {
    type: String,
    default: 'orange-100',
  },
})
</script>

<template>
  <svg class="svg-icon-burger-close" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 28" width="40" height="28" fill="none">
    <path :stroke="`var(--c-${props.color})`" stroke-width="2.5" d="M6 6h28M6 14h28M6 22h28" />
  </svg>
</template>

<style lang="scss">
.svg-icon-burger-close {
  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>
