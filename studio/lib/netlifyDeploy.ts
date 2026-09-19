export const BUILD_HOOK = process.env.SANITY_STUDIO_NETLIFY_BUILD_HOOK

export const SITE_URL = (process.env.SANITY_STUDIO_SITE_URL || 'https://boracars.com').replace(/\/+$/, '')

export const PREVIEW_SITE_URL = (process.env.SANITY_STUDIO_PREVIEW_SITE_URL || 'https://develop.boracars.com').replace(/\/+$/, '')

const LAST_TRIGGERED_KEY = 'bora:netlify:last-triggered'

export interface LiveBuild {
  id: string
  timestamp: number
}

export function readLastTriggered(): string | null {
  try {
    return localStorage.getItem(LAST_TRIGGERED_KEY)
  }
  catch {
    return null
  }
}

export async function triggerBuild(): Promise<string> {
  if (!BUILD_HOOK) throw new Error('Build hook non configuré')
  await fetch(BUILD_HOOK, { method: 'POST', mode: 'no-cors' })
  const now = new Date().toISOString()
  try {
    localStorage.setItem(LAST_TRIGGERED_KEY, now)
  }
  catch {
  }
  return now
}

export async function fetchLiveBuild(signal?: AbortSignal): Promise<LiveBuild | null> {
  try {
    const res = await fetch(`${SITE_URL}/_nuxt/builds/latest.json`, { cache: 'no-store', signal })
    if (!res.ok) return null
    const json = await res.json() as { id?: unknown, timestamp?: unknown }
    return typeof json.timestamp === 'number' ? { id: String(json.id), timestamp: json.timestamp } : null
  }
  catch {
    return null
  }
}

export function formatDateTime(value: string | number | null | undefined): string | null {
  if (value == null) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
