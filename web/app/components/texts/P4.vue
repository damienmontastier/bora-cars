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
  weight: {
    type: String,
    default: 'regular',
    validator: value => ['regular', 'bold'].includes(value),
  },
})

const mainRef = ref(null)

const classes = computed(() => ({
  'no-selectable': !props.selectable,
  'bold-text': props.weight === 'bold',
}))

defineExpose({
  root: mainRef,
})
</script>

<template>
  <component
    :is="tag"
    ref="mainRef"
    class="P4 app-text"
    :class="classes"
    :style="{ color: `var(--c-${color})` }"
  >
    <slot />
  </component>
</template>

<style lang="scss">
.P4 {
  &.no-selectable {
    user-select: none;
  }
}
</style>
