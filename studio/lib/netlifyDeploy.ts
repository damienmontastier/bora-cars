// Mise en ligne du site de production (Netlify), partagée par l'outil « Mise en ligne »
// et le Dashboard.
//
// - Déclenchement : POST sur le build hook Netlify. Fire-and-forget : `mode: 'no-cors'`
//   envoie la requête sans préflight CORS — le build part quoi qu'il arrive ; on ne lit
//   pas la réponse (opaque).
// - Build en ligne : Nuxt publie à chaque build `/_nuxt/builds/latest.json`
//   (`{ id, timestamp }`). Sa lecture depuis le Studio (autre origine) exige l'en-tête
//   `Access-Control-Allow-Origin` posé dans web/netlify.toml.

export const BUILD_HOOK = process.env.SANITY_STUDIO_NETLIFY_BUILD_HOOK

export const SITE_URL = (process.env.SANITY_STUDIO_SITE_URL || 'https://boracars.com').replace(/\/+$/, '')

/**
 * Site de test (branche develop, rendu à la volée) : affiche le contenu publié en
 * quelques instants, sans mise en ligne. Non indexé.
 */
export const PREVIEW_SITE_URL = (process.env.SANITY_STUDIO_PREVIEW_SITE_URL || 'https://develop.boracars.com').replace(/\/+$/, '')

const LAST_TRIGGERED_KEY = 'bora:netlify:last-triggered'

export interface LiveBuild {
  id: string
  /** Date du build en ms (epoch). */
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

/** Déclenche un build de production. Renvoie la date ISO du déclenchement. */
export async function triggerBuild(): Promise<string> {
  if (!BUILD_HOOK) throw new Error('Build hook non configuré')
  await fetch(BUILD_HOOK, { method: 'POST', mode: 'no-cors' })
  const now = new Date().toISOString()
  try {
    localStorage.setItem(LAST_TRIGGERED_KEY, now)
  }
  catch {
    // localStorage indisponible (mode privé) — sans gravité.
  }
  return now
}

/**
 * Build actuellement en ligne, ou `null` si illisible (hors ligne, en-tête CORS pas
 * encore déployé…). `no-store` : le manifest est servi `immutable` sous `/_nuxt/`, le
 * cache HTTP du navigateur garderait sinon l'ancien build.
 */
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
