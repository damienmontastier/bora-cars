import type { SanityLink } from './home'

export type { SanityLink }

export interface ProprietaireData {
  hero: {
    heading?: string
    tagline?: string
    subtext?: string
  } | null
  process: {
    steps: Array<{ _key: string, title: string, description?: string }>
  } | null
}

export const PROPRIETAIRE_QUERY = `*[_type == "proprietaire"][0]{
  "hero": hero{
    heading,
    tagline,
    subtext
  },
  "process": process{
    steps[]{_key, title, description}
  }
}`
