export type CookieCategoryKey = 'necessary' | 'analytics' | 'marketing' | 'functional'

export type CookieCategories = Record<CookieCategoryKey, boolean>

export interface CookieConsent {
  version: number
  date: string
  categories: CookieCategories
}

export type CookieView = 'banner' | 'settings'

export const COOKIE_STORAGE_KEY = 'bora-cookies-consent'
export const COOKIE_VERSION = 1

const DEFAULT_CATEGORIES: CookieCategories = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
}

export const COOKIE_CATEGORY_KEYS: CookieCategoryKey[] = [
  'necessary',
  'analytics',
  'marketing',
  'functional',
]

// Forward the user's consent to Google Tag Manager via @nuxt/scripts.
// `consent.update()` is typed against the canonical GCMv2 schema and validates input.
// Consent *defaults* (all denied + wait_for_update: 500) live in `nuxt.config.ts > scripts.registry`
// so they're pushed BEFORE gtm.js loads. This call upgrades them at runtime.
// The `functional` category gates non-GTM scripts via `triggers.functional`, not GCMv2.
function pushConsentUpdate(categories: CookieCategories) {
  if (!import.meta.client)
    return

  let gtm: ReturnType<typeof useScriptGoogleTagManager> | undefined
  try {
    gtm = useScriptGoogleTagManager()
  }
  catch {
    // GTM not registered / mocked in dev — silent no-op.
    return
  }
  if (!gtm?.consent)
    return

  gtm.consent.update({
    analytics_storage: categories.analytics ? 'granted' : 'denied',
    ad_storage: categories.marketing ? 'granted' : 'denied',
    ad_user_data: categories.marketing ? 'granted' : 'denied',
    ad_personalization: categories.marketing ? 'granted' : 'denied',
  })

  // Custom dataLayer event so GTM triggers can fire on the choice itself
  // (e.g. a "wait for consent_granted" trigger gating GA4 page_view).
  const anyGranted = categories.analytics || categories.marketing || categories.functional
  gtm.proxy.dataLayer.push({ event: anyGranted ? 'consent_granted' : 'consent_denied' })
}

export function useCookies() {
  // SSR-safe persistent storage. CNIL caps consent lifetime at 13 months; we use ~12 to stay safe.
  const consent = useCookie<CookieConsent | null>(COOKIE_STORAGE_KEY, {
    default: () => null,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
  })

  const isOpen = useState<boolean>('cookies-open', () => false)
  const view = useState<CookieView>('cookies-view', () => 'banner')
  const pending = useState<CookieCategories>('cookies-pending', () => ({ ...DEFAULT_CATEGORIES }))

  const hasConsent = computed(
    () => !!consent.value && consent.value.version === COOKIE_VERSION,
  )

  // Reactive booleans per category — designed to be passed to @nuxt/scripts
  // `useScriptTriggerConsent({ consent: triggers.analytics })` so a script only
  // loads once the user has granted consent for that category.
  const triggers = {
    analytics: computed(() => hasConsent.value && !!consent.value?.categories.analytics),
    marketing: computed(() => hasConsent.value && !!consent.value?.categories.marketing),
    functional: computed(() => hasConsent.value && !!consent.value?.categories.functional),
  }

  function syncPendingFromConsent() {
    pending.value = {
      ...DEFAULT_CATEGORIES,
      ...(consent.value?.categories ?? {}),
      necessary: true,
    }
  }

  function showBanner() {
    syncPendingFromConsent()
    view.value = 'banner'
    isOpen.value = true
  }

  function openSettings() {
    syncPendingFromConsent()
    view.value = 'settings'
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function save(categories: CookieCategories) {
    const final: CookieCategories = { ...categories, necessary: true }
    consent.value = {
      version: COOKIE_VERSION,
      date: new Date().toISOString(),
      categories: final,
    }
    pushConsentUpdate(final)
    close()
  }

  function acceptAll() {
    save({ necessary: true, analytics: true, marketing: true, functional: true })
  }

  function refuseAll() {
    save({ necessary: true, analytics: false, marketing: false, functional: false })
  }

  function saveSelection() {
    save(pending.value)
  }

  // Call once on client mount.
  // - First-time visitor: show banner (GTM stays on 'denied' defaults).
  // - Returning visitor: skip the UI but re-push their stored choices so GTM
  //   upgrades from the denied defaults set by `onBeforeGtmStart`.
  function init() {
    if (!hasConsent.value) {
      showBanner()
      return
    }
    if (consent.value)
      pushConsentUpdate(consent.value.categories)
  }

  return {
    consent,
    hasConsent,
    triggers,
    pending,
    view,
    isOpen,
    showBanner,
    openSettings,
    close,
    save,
    acceptAll,
    refuseAll,
    saveSelection,
    init,
  }
}
