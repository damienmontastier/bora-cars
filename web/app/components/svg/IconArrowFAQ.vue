<script lang="ts" setup>
const props = defineProps({
  color: {
    type: String,
    default: 'orange-100',
  },
})
</script>

<template>
  <div class="svg-logo">
    <svg class="svg-icon-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="none">
      <path :fill="`var(--c-${props.color})`" d="M21.59 6.06 12.652 15l8.94 8.94-2.121 2.12L8.41 15 19.47 3.94z" />
    </svg>

    <svg class="svg-icon-arrow-faq" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" fill="none">
      <path :fill="`var(--c-${props.color})`" d="M6.828 33.747 26 14.576l19.172 19.171-3.677 3.677L26 21.929 10.505 37.424z" />
    </svg>
  </div>
</template>

<style lang="scss">
.svg-icon-arrow-faq {
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
