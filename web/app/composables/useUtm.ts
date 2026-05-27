const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign'] as const
type UtmKey = typeof UTM_KEYS[number]
type UtmData = Partial<Record<UtmKey, string>>

const STORAGE_KEY = 'bora_utm'

export function useUtm() {
  function captureFromUrl() {
    if (!import.meta.client)
      return
    // First-touch attribution within the session — don't overwrite.
    if (sessionStorage.getItem(STORAGE_KEY))
      return

    const params = new URLSearchParams(window.location.search)
    const data: UtmData = {}
    let hasAny = false
    for (const key of UTM_KEYS) {
      const value = params.get(key)
      if (value) {
        data[key] = value
        hasAny = true
      }
    }
    if (hasAny) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      }
      catch { /* sessionStorage unavailable (private mode, etc.) */ }
    }
  }

  function read(): UtmData {
    if (!import.meta.client)
      return {}
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : {}
    }
    catch {
      return {}
    }
  }

  return { captureFromUrl, read }
}
