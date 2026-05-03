<script setup>
// Map Sanity document IDs → route paths
const INTERNAL_ROUTES = {
  homepage: '/',
  proprietaire: '/proprietaire',
  professionnel: '/professionnel',
  contact: '/contact',
  catalogue: '/catalogue',
}

const props = defineProps({
  to: {
    type: [String, Object],
  },
})

const { to } = toRefs(props)

// Si `to` est un objet lien Sanity, on le résout en string
const resolvedTo = computed(() => {
  const val = to.value
  if (!val || typeof val === 'string')
    return val

  if (val.type === 'email')
    return val.email ? `mailto:${val.email}` : undefined
  if (val.type === 'phone')
    return val.phone ? `tel:${val.phone}` : undefined
  if (val.type === 'external')
    return val.url
  if (val.type === 'internal') {
    const ref = val.internalLink?._ref
    return ref ? (INTERNAL_ROUTES[ref] ?? `/${ref}`) : undefined
  }

  return val // vue-router object
})

const isExternal = computed(() => {
  if (typeof resolvedTo.value === 'string') {
    return isValidURL(resolvedTo.value) || resolvedTo.value.startsWith('mailto:') || resolvedTo.value.startsWith('tel:')
  }
  return false
})

const tag = computed(() => {
  if (!resolvedTo.value)
    return 'button'

  return isExternal.value ? 'a' : resolveComponent('NuxtLinkLocale')
})

const componentProps = computed(() => {
  if (!resolvedTo.value)
    return { type: 'button' }

  if (isExternal.value) {
    const blank = typeof to.value === 'object' ? to.value?.blank : true
    return {
      href: resolvedTo.value,
      ...(blank !== false && { target: '_blank', rel: 'noopener noreferrer' }),
    }
  }

  return { to: resolvedTo.value }
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
