<script setup>
const props = defineProps({
  to: {
    type: [String, Object],
  },
})

const { to } = toRefs(props)

const isExternal = computed(() => {
  if (typeof to.value === 'string') {
    return isValidURL(to.value)
  }
  return false
})

const tag = computed(() => {
  if (!to.value)
    return 'button'

  return isExternal.value ? 'a' : resolveComponent('NuxtLinkLocale')
})

const componentProps = computed(() => {
  if (!to.value)
    return { type: 'button' }

  if (isExternal.value) {
    return { href: to.value, target: '_blank', rel: 'noopener noreferrer' }
  }

  return { to: to.value }
})
</script>

<template>
  <component :is="tag" v-bind="componentProps" class="app-atoms-base-link" :class="[$attrs.class]">
    <slot />
  </component>
</template>

<style lang="scss">
.app-atoms-base-link {
}
</style>
