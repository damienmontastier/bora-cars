<script setup>
// Pont CMS → routeur : type de doc Sanity → route Nuxt (cf. I18N_CONFIG).
// On résout vers `{ name, params }`, jamais un chemin en dur : c'est
// `NuxtLinkLocale` qui produit ensuite le chemin localisé/traduit.
import { SANITY_ROUTES } from '~/config/I18N_CONFIG'

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

const WHATSAPP_HOST_RE = /^(?:[\w-]+\.)*(?:wa\.me|whatsapp\.com)$/i

const { to } = toRefs(props)

const analytics = useAnalytics()
const whatsappMessage = useWhatsappMessage()

// Si `to` est un objet lien Sanity, on le résout en string/route vue-router
function resolveLink(val) {
  if (!val || typeof val === 'string')
    return val

  if (val.type === 'email')
    return val.email ? `mailto:${val.email}` : undefined
  if (val.type === 'phone')
    return val.phone ? `tel:${val.phone}` : undefined
  if (val.type === 'external') {
    if (!val.url)
      return undefined
    // URL externe saisie sans schéma (ex. « www.exemple.com ») → on préfixe
    // https://, sinon `isValidURL` (new URL()) échoue, le lien est considéré
    // interne et `NuxtLinkLocale` le résout en chemin relatif cassé.
    return /^(?:https?:)?\/\//i.test(val.url) || /^(?:mailto|tel):/i.test(val.url)
      ? val.url
      : `https://${val.url}`
  }
  if (val.type === 'internal') {
    const link = val.internalLink
    const route = link && SANITY_ROUTES[link._type]
    if (!route)
      return undefined
    // Route dynamique (doc à slug) → on injecte le param ; sinon route nommée simple.
    if (route.param)
      return link.slug ? { name: route.name, params: { [route.param]: link.slug } } : undefined
    return { name: route.name }
  }

  return val // vue-router object (ex. { name, params })
}

// Résout le lien, puis injecte le message WhatsApp de la page courante dans les
// URL wa.me (no-op pour les autres liens). Le menu / la homepage ne fournissent
// pas de message → lien nu.
const resolvedTo = computed(() => {
  const resolved = resolveLink(to.value)
  return typeof resolved === 'string'
    ? withWhatsappText(resolved, whatsappMessage.value)
    : resolved
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
