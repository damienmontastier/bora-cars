<script setup lang="ts">
defineProps({
  color: {
    type: String,
    default: 'black-100',
  },
})
</script>

<template>
  <svg
    class="svg-icon-chevron"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 22 14"
    fill="none"
    aria-hidden="true"
  >
    <path
      :fill="`var(--c-${color})`"
      d="M11.061 13.183 0 2.122 2.121 0 11.061 8.94 20 0l2.121 2.121z"
    />
  </svg>
</template>

<style lang="scss">
.svg-icon-chevron {
  display: block;
  width: 100%;
  height: auto;
}
</style>
