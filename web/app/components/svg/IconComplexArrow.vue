<script lang="ts" setup>
const props = defineProps({
  color: {
    type: String,
    default: 'orange-100',
  },
})
</script>

<template>
  <div class="svg-icon-complex-arrow">
    <svg viewBox="0 0 34 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M-3.60205e-07 17.6963L17.6973 -1.41567e-06L21.0908 3.39355L9.1875 15.2959L33.8906 15.2959L33.8906 20.0967L9.1875 20.0967L21.0908 32L17.6973 35.3936L-3.60205e-07 17.6963Z" :fill="`var(--c-${props.color})`" />
    </svg>
  </div>
</template>

<style lang="scss">
.svg-icon-complex-arrow {
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
