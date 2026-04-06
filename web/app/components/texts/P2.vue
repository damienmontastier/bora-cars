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
    class="P2 app-text"
    :class="classes"
    :style="{ color: `var(--c-${color})` }"
  >
    <slot />
  </component>
</template>

<style lang="scss">
.P2 {
  &.no-selectable {
    user-select: none;
  }
}
</style>
