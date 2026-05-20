<script lang="ts" setup>
const props = defineProps({
  color: {
    type: String,
    default: 'orange-100',
  },
})
</script>

<template>
  <div class="svg-logo-minimal-footer">
    <svg xmlns="http://www.w3.org/2000/svg" width="361" height="189" viewBox="0 0 361 189" fill="none">
      <path :fill="`var(--c-${props.color})`" fill-rule="evenodd" d="M302.91 0c58.543 0 71.878 48.778 44.328 78.336-4.665 5.005-10.748 10.186-17.175 12.531-.479.175-.52.869-.064 1.095 35.862 20.674 24.704 96.168-58.178 96.168H23.262l36.462-38.243a37.5 37.5 0 0 1 27.044-11.518h187.889a19.26 19.26 0 0 0 14.087-6.125c6.168-6.617 1.468-17.12-7.585-17.12H1.932c-1.685 0-2.56-2.006-1.411-3.238L103.829 1.052A3.3 3.3 0 0 1 106.249 0zM124.707 49.653c-.918 0-1.795.381-2.42 1.052L102.638 71.51a.825.825 0 0 0 .605 1.388h181.628a19.26 19.26 0 0 0 14.087-6.124c6.168-6.618 1.468-17.12-7.585-17.12z" clip-rule="evenodd" />
    </svg>
  </div>
</template>

<style lang="scss">
.svg-logo-minimal-footer {
  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>
