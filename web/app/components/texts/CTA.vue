<script setup>
const props = defineProps({
  tag: {
    type: String,
    default: 'span',
  },
  color: {
    type: String,
    default: 'black-100',
  },
  selectable: {
    type: Boolean,
    default: true,
  },
})

const mainRef = ref(null)

const classes = computed(() => ({
  'no-selectable': !props.selectable,
}))

defineExpose({
  root: mainRef,
})
</script>

<template>
  <component
    :is="tag"
    ref="mainRef"
    class="CTA-TEXT app-text"
    :class="classes"
    :style="{ color: `var(--c-${color})` }"
  >
    <slot />
  </component>
</template>

<style lang="scss">
.CTA-TEXT {
  &.no-selectable {
    user-select: none;
  }
}
</style>
