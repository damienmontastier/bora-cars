import type { SanityLink } from './home'

export interface SettingsData {
  contactLink?: SanityLink
}

export const SETTINGS_QUERY = `*[_type == "settings"][0]{
  contactLink{ type, text, url, email, phone }
}`
