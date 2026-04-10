import type { HeroData } from './home'

export interface ProprietaireData {
  hero: HeroData | null
  pitch: {
    eyebrow?: string
    heading?: string
    subtext?: string
  } | null
  process: {
    steps: Array<{ _key: string, title: string, description?: string }>
  } | null
}

export const PROPRIETAIRE_QUERY = `*[_type == "proprietaire"][0]{
  "hero": modules[_type == "hero"][0]{
    heading,
    tagline,
    subtext,
    "backgroundMedia": backgroundMedia {
      mediaType,
      "imageUrl": image.asset._ref,
      "imageAlt": image.alt,
      "imageHotspot": image.hotspot,
      "imageCrop": image.crop,
      "videoUrl": video.asset->url,
      "videoAlt": video.alt
    }
  },
  "pitch": modules[_type == "pitch"][0]{
    eyebrow,
    heading,
    subtext
  },
  "process": modules[_type == "process"][0]{
    steps[]{_key, title, description}
  }
}`
