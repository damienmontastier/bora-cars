import type { SettingsData } from '~/queries/settings'

/**
 * Retourne les données du singleton "settings" de Sanity.
 * Utilisable dans n'importe quel composant ou page.
 *
 * La valeur est fetchée une seule fois dans app.vue et stockée dans
 * useState — inclus dans le payload __NUXT__, disponible dès l'hydratation.
 */
export function useSettings() {
  return useState<SettingsData | null>('settings', () => null)
}
