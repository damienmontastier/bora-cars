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

function pushConsentUpdate(categories: CookieCategories) {
  if (!import.meta.client)
    return

  let gtm: ReturnType<typeof useScriptGoogleTagManager> | undefined
  try {
    gtm = useScriptGoogleTagManager()
  }
  catch {
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

  const anyGranted = categories.analytics || categories.marketing || categories.functional
  gtm.proxy.dataLayer.push({ event: anyGranted ? 'consent_granted' : 'consent_denied' })
}

export function useCookies() {
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

  function restoreConsent() {
    if (hasConsent.value && consent.value)
      pushConsentUpdate(consent.value.categories)
  }

  function promptIfNeeded() {
    if (!hasConsent.value)
      showBanner()
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
    restoreConsent,
    promptIfNeeded,
  }
}
