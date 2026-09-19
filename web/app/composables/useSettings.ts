import type { SettingsData } from '~/queries/settings'

export function useSettings() {
  return useState<SettingsData | null>('settings', () => null)
}
