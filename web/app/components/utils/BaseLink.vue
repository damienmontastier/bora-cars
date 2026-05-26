<script setup>
// Map Sanity singleton document IDs → route paths
const INTERNAL_ROUTES = {
  homepage: '/',
  proprietaire: '/proprietaire',
  professionnel: '/professionnel',
  contact: '/contact',
  catalogue: '/catalogue',
}

// Slug-based document types → route builder
const SLUG_ROUTES = {
  car: slug => slug ? `/car/${slug}` : undefined,
  legalPage: slug => slug ? `/legal/${slug}` : undefined,
}

const WHATSAPP_HOST_RE = /^(?:[\w-]+\.)*(?:wa\.me|whatsapp\.com)$/i

const props = defineProps({
  to: {
    type: [String, Object],
  },
  // Extra params merged into the auto-tracked event (e.g. car_id, source, duration…)
  trackingExtra: {
    type: Object,
    default: undefined,
  },
  // Opt out of auto-tracking entirely
  trackingDisabled: {
    type: Boolean,
    default: false,
  },
})

const { to } = toRefs(props)

const analytics = useAnalytics()

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
    const link = val.internalLink
    if (!link)
      return undefined
    const slugRoute = SLUG_ROUTES[link._type]
    if (slugRoute)
      return slugRoute(link.slug)
    return INTERNAL_ROUTES[link._id] ?? (link._id ? `/${link._id}` : undefined)
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

function onTrackedClick() {
  if (props.trackingDisabled)
    return
  const url = typeof resolvedTo.value === 'string' ? resolvedTo.value : null
  if (!url)
    return

  const extra = { url, ...(props.trackingExtra ?? {}) }

  if (url.startsWith('mailto:')) {
    analytics.track('email_click', extra)
    return
  }
  if (url.startsWith('tel:')) {
    analytics.track('phone_click', extra)
    return
  }
  try {
    const parsed = new URL(url)
    if (WHATSAPP_HOST_RE.test(parsed.hostname))
      analytics.trackWhatsappClick(extra)
    else
      analytics.track('external_link_click', extra)
  }
  catch {
    // Not a parseable URL (relative path, etc.) — no auto event.
  }
}
</script>

<template>
  <component
    :is="tag"
    v-bind="componentProps"
    class="app-atoms-base-link"
    :class="[$attrs.class]"
    @click="onTrackedClick"
  >
    <slot />
  </component>
</template>

<style lang="scss">
.app-atoms-base-link {
}
</style>
