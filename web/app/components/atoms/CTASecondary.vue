<script setup>
const props = defineProps({
  to: {
    type: [String, Object],
  },
  theme: {
    type: String,
    default: 'black',
    validator: v => ['white', 'black', 'orange'].includes(v),
  },
})

const { to } = toRefs(props)

const themeTextColor = computed(() => ({
  white: 'beige-100',
  black: 'black-100',
  orange: 'orange-100',
}[props.theme]))
</script>

<template>
  <UtilsBaseLink
    :to="to"
    class="app-atoms-cta-secondary"
    :class="`app-atoms-cta-secondary--${theme}`"
  >
    <TextsCTA :color="themeTextColor">
      <slot />
    </TextsCTA>
  </UtilsBaseLink>
</template>

<style lang="scss">
.app-atoms-cta-secondary {
  display: inline-flex;
  cursor: pointer;
  transition: opacity 0.35s var(--ease-out-cubic);

  &:hover {
    opacity: 0.5;
  }
}
</style>
