<script setup>
const props = defineProps({
  tag: {
    type: String,
    default: 'p',
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
    class="P1 app-text"
    :class="classes"
    :style="{ color: `var(--c-${color})` }"
  >
    <slot />
  </component>
</template>

<style lang="scss">
.P1 {
  &.no-selectable {
    user-select: none;
  }
}
</style>
