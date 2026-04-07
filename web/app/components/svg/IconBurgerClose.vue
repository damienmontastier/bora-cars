<script lang="ts" setup>
const props = defineProps({
  color: {
    type: String,
    default: 'orange-100',
  },
})
</script>

<template>
  <div class="svg-icon-burger-close">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 28" fill="none">
      <path :stroke="`var(--c-${props.color})`" stroke-width="2.5" d="M6 6h28M6 14h28M6 22h28" />
    </svg>
  </div>
</template>

<style lang="scss">
.svg-icon-burger-close {
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
