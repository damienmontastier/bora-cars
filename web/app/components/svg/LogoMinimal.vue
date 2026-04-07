<script lang="ts" setup>
const props = defineProps({
  color: {
    type: String,
    default: 'orange-100',
  },
})
</script>

<template>
  <svg class="svg-logo-minimal" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76 76" fill="none">
    <path :fill="`var(--c-${props.color})`" fill-rule="evenodd" d="M58.818 22.007c9.957 0 12.225 8.293 7.54 13.319-.794.85-1.829 1.731-2.922 2.13-.081.03-.088.148-.01.186 6.098 3.515 4.2 16.351-9.895 16.351H11.258l6.201-6.502a6.38 6.38 0 0 1 4.6-1.958h31.954c.91 0 1.777-.378 2.396-1.042 1.05-1.125.25-2.91-1.29-2.91H7.631a.327.327 0 0 1-.24-.551l17.57-18.844a.56.56 0 0 1 .411-.18zm-30.307 8.442a.56.56 0 0 0-.411.179l-3.342 3.537a.14.14 0 0 0 .103.236h30.89c.908 0 1.776-.377 2.395-1.041 1.05-1.125.25-2.911-1.29-2.911z" clip-rule="evenodd" />
  </svg>
</template>

<style lang="scss">
.svg-logo-minimal {
  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>
