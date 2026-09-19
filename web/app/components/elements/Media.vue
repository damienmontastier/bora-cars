<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = defineProps({
  src: {
    type: String,
    required: false,
  },
  alt: {
    type: String,
    default: '',
  },
  lazy: {
    type: Boolean,
    default: true,
  },
  preload: {
    type: [Boolean, Object] as unknown as () => boolean | { fetchPriority: 'high' | 'low' | 'auto' },
    default: false,
  },
  fetchPriority: {
    type: String as () => 'high' | 'low' | 'auto' | undefined,
    default: undefined,
  },
  sizes: {
    type: String,
    default: 'sm:100vw xl:100vw',
  },
  provider: {
    type: String as () => 'sanity' | 'ipx' | undefined,
    default: undefined,
  },
  hotspot: {
    type: Object as () => { x: number, y: number, width: number, height: number } | undefined,
    default: undefined,
  },
  crop: {
    type: Object as () => { top: number, bottom: number, left: number, right: number } | undefined,
    default: undefined,
  },
  modifiers: {
    type: Object,
    default: undefined,
  },
  ratio: {
    type: Number,
    default: undefined,
  },
  mobileRatio: {
    type: Number,
    default: undefined,
  },
  mobileSizes: {
    type: String,
    default: '400:100vw 600:100vw sm:100vw',
  },
  overlay: {
    type: [Boolean, Object] as unknown as () => boolean | OverlayProps,
    default: true,
  },
  parallax: {
    type: [Boolean, Object] as unknown as () => boolean | ParallaxProps,
    default: false,
  },
})

interface ParallaxProps {
  speed?: number
  scale?: number
  position?: 'top' | 'default'
  reversed?: boolean
  id?: string
  trigger?: HTMLElement | null
}

interface OverlayProps {
  variant?: 'blur' | 'panel'
  color?: string
  duration?: number
  blur?: string
  threshold?: number
  borderRadius?: string
}

const isLoaded = ref(false)

function onLoad() {
  isLoaded.value = true
}

const loading = computed(() => props.lazy ? 'lazy' : 'eager')
const hasSrc = computed(() => !!props.src)
const resolvedProvider = computed(() => props.provider ?? undefined)

// NuxtImg only injects its `preload` <link> server-side, so on SPA
// navigation the hero image is fetched as a normal, non-prioritised request —
// the reveal blur lingers while it loads. Mirror the preload's fetchPriority
// onto the real <img> (via imgAttrs) so eager media also loads at high
// priority on client-side navigation.
const imgAttrs = computed(() => {
  // `fetchPriority` explicite l'emporte (ex. précharger les voisines d'un slider en
  // `low` sans lien preload) ; sinon on le dérive de `preload`.
  const fetchpriority = props.fetchPriority
    ?? (typeof props.preload === 'object'
      ? props.preload.fetchPriority
      : props.preload
        ? 'high'
        : undefined)
  // decoding async : laisse le navigateur décoder hors du thread principal, pour
  // éviter qu'un gros décode (médias eager) ne fasse sauter une frame de scroll/drag.
  return { decoding: 'async' as const, ...(fetchpriority ? { fetchpriority } : {}) }
})
const localModifiers = computed(() => ({
  ...props.modifiers,
  ...(props.hotspot && { hotspot: props.hotspot }),
  ...(props.crop && { crop: props.crop }),
}))

// Format : aucun format imposé. Le provider Sanity ajoute alors `auto=format`, et le
// CDN sert l'AVIF aux navigateurs qui l'acceptent (~45 % plus léger que le WebP à
// qualité égale), le WebP aux autres. Ne pas passer `format: 'avif'` : Sanity refuse
// `fm=avif` (HTTP 400).
//
// Taille : `fit: 'outside'` (→ `fit=max` chez Sanity) plafonne chaque candidat à la
// taille de la source. Sans lui, le CDN agrandit la photo (source de 2752 px servie en
// 3840) : un fichier plus lourd, sans aucun détail en plus.
const fit = computed(() => props.modifiers?.fit ?? 'outside')

const MOBILE_MEDIA = '(max-width: 799px)'
const DESKTOP_MEDIA = '(min-width: 800px)'

const $img = useImage()

// Largeur max d'un recadrage au format `ratio` sans agrandir la source : dimensions lues
// dans la référence de l'asset Sanity (`image-<hash>-4000x6000-jpg`, ce que projettent
// les requêtes) ou dans son URL (`…-4000x6000.jpg`), moins la zone `crop` du Studio.
function maxCropWidth(ratio: number) {
  const match = props.src?.match(/-(\d+)x(\d+)[.-]\w+(?:\?|$)/)
  if (!match)
    return Number.POSITIVE_INFINITY
  const c = props.crop
  const width = Number(match[1]) * (1 - (c?.left ?? 0) - (c?.right ?? 0))
  const height = Number(match[2]) * (1 - (c?.top ?? 0) - (c?.bottom ?? 0))
  return Math.floor(Math.min(width, height * ratio))
}

function croppedSizes(sizes: string, ratio: number) {
  const modifiers = {
    ...localModifiers.value,
    quality: $img.options.quality,
    fit: 'cover',
  }
  const result = $img.getSizes(props.src!, {
    provider: resolvedProvider.value,
    sizes,
    modifiers: { ...modifiers, width: 1000, height: Math.round(1000 / ratio) },
  })

  // `fit=crop` agrandit la source quand le cadre la dépasse (`fit=max` ne s'applique
  // pas à un recadrage, et `fit=min` ignore le hotspot). Les candidats plus larges que
  // la source sont donc remplacés par un seul, à la taille native du recadrage : le
  // navigateur prend celui-là sur les grands écrans, avec exactement le même détail.
  const max = maxCropWidth(ratio)
  const candidates = result.srcset.split(', ').map((entry) => {
    const i = entry.lastIndexOf(' ')
    return { url: entry.slice(0, i), width: Number.parseInt(entry.slice(i + 1)) }
  })
  if (candidates.every(c => c.width <= max))
    return result

  // Casts : les types de `$img` suivent le provider par défaut (IPX, où `crop` est une
  // chaîne) ; ici le provider est Sanity, qui attend l'objet crop du Studio.
  type ImgArgs = Parameters<typeof $img>
  const nativeModifiers = { ...modifiers, width: max, height: Math.round(max / ratio) } as ImgArgs[1]
  const nativeUrl = $img(props.src!, nativeModifiers, { provider: resolvedProvider.value } as ImgArgs[2])
  const kept = [...candidates.filter(c => c.width < max), { url: nativeUrl, width: max }]
  return {
    ...result,
    src: nativeUrl,
    srcset: kept.map(c => `${c.url} ${c.width}w`).join(', '),
  }
}

const cropped = computed(() => {
  if (!props.src || !props.ratio)
    return null
  return {
    desktop: croppedSizes(props.sizes, props.ratio),
    mobile: props.mobileRatio ? croppedSizes(props.mobileSizes, props.mobileRatio) : null,
  }
})

if (import.meta.server && props.preload && cropped.value) {
  const fetchpriority = typeof props.preload === 'object' ? props.preload.fetchPriority : undefined
  useHead({
    link: () => {
      const c = cropped.value
      if (!c)
        return []
      // Pas de `type` : le CDN choisit le format (AVIF ou WebP) selon le navigateur.
      const link = (sources: { srcset: string, sizes?: string }, media?: string) => ({
        rel: 'preload',
        as: 'image',
        imagesrcset: sources.srcset,
        ...(sources.sizes && { imagesizes: sources.sizes }),
        ...(media && { media }),
        ...(fetchpriority && { fetchpriority }),
      })
      return c.mobile
        ? [link(c.mobile, MOBILE_MEDIA), link(c.desktop, DESKTOP_MEDIA)]
        : [link(c.desktop)]
    },
  })
}

const wrapperProps = computed(() => (!props.parallax || props.parallax === true) ? {} : props.parallax as ParallaxProps)

const showOverlay = computed(() => !!props.overlay)
const overlayProps = computed(() => (!props.overlay || props.overlay === true) ? {} : props.overlay as OverlayProps)

const mainRef = useTemplateRef<HTMLElement>('mainRef')
const pictureRef = ref<any>(null)

onMounted(() => {
  // NuxtImg → son `$el` EST l'<img> ; recadrage → un <picture> qui la contient.
  const el = pictureRef.value?.$el ?? pictureRef.value
  const img: HTMLImageElement | null = el instanceof HTMLImageElement ? el : (el?.querySelector?.('img') ?? null)
  // `load` doesn't bubble, so relying solely on NuxtPicture's emit is fragile.
  // Listen on the real <img>, and reveal on `error` / missing-img too: an opaque
  // reveal panel must never stay stuck covering the slot.
  if (!img) {
    onLoad()
    return
  }
  // `img.complete` is ALSO true for a not-yet-started lazy image (below the fold),
  // not only a finished one — but then `naturalWidth` is 0. Without this guard a
  // lazy card marks itself "loaded" at mount, so the reveal fires the instant it
  // scrolls into view — BEFORE the image has even begun downloading — wiping the
  // overlay off an empty slot, then the image pops in after. Only skip the reveal
  // for a GENUINELY decoded (cached) image; otherwise wait for the real `load`.
  if (img.complete && img.naturalWidth > 0) {
    onLoad()
    return
  }
  img.addEventListener('load', onLoad, { once: true })
  img.addEventListener('error', onLoad, { once: true })
})

defineExpose({ mainRef, pictureRef })
</script>

<template>
  <UtilsParallax v-if="props.parallax" v-bind="wrapperProps">
    <div ref="mainRef" class="app-elements-media" v-bind="$attrs">
      <NuxtImg
        v-if="hasSrc && !cropped"
        ref="pictureRef"
        class="app-elements-media__image"
        :src="src!"
        :sizes="sizes"
        :loading="loading"
        :preload="preload"
        v-bind="imgAttrs"
        :provider="resolvedProvider"
        :fit="fit"
        :alt="alt"
        :modifiers="localModifiers"
        @load="onLoad"
      />
      <picture v-else-if="cropped" ref="pictureRef" class="app-elements-media__image">
        <source
          v-if="cropped.mobile"
          :media="MOBILE_MEDIA"
          :srcset="cropped.mobile.srcset"
          :sizes="cropped.mobile.sizes"
        >
        <img
          :src="cropped.desktop.src"
          :srcset="cropped.desktop.srcset"
          :sizes="cropped.desktop.sizes"
          :loading="loading"
          :alt="alt"
          v-bind="imgAttrs"
          @load="onLoad"
        >
      </picture>
      <ElementsMediaOverlay
        v-if="hasSrc && showOverlay"
        :loaded="isLoaded"
        v-bind="overlayProps"
      />
      <div v-if="!hasSrc" ref="pictureRef" class="app-elements-media__fallback" />
    </div>
  </UtilsParallax>
  <div v-else ref="mainRef" class="app-elements-media" v-bind="$attrs">
    <NuxtImg
      v-if="hasSrc && !cropped"
      ref="pictureRef"
      class="app-elements-media__image"
      :src="src!"
      :sizes="sizes"
      :loading="loading"
      :preload="preload"
      v-bind="imgAttrs"
      :provider="resolvedProvider"
      :fit="fit"
      :alt="alt"
      :modifiers="localModifiers"
      @load="onLoad"
    />
    <picture v-else-if="cropped" ref="pictureRef" class="app-elements-media__image">
      <source
        v-if="cropped.mobile"
        :media="MOBILE_MEDIA"
        :srcset="cropped.mobile.srcset"
        :sizes="cropped.mobile.sizes"
      >
      <img
        :src="cropped.desktop.src"
        :srcset="cropped.desktop.srcset"
        :sizes="cropped.desktop.sizes"
        :loading="loading"
        :alt="alt"
        v-bind="imgAttrs"
        @load="onLoad"
      >
    </picture>
    <ElementsMediaOverlay
      v-if="hasSrc && showOverlay"
      :loaded="isLoaded"
      v-bind="overlayProps"
    />
    <div v-if="!hasSrc" ref="pictureRef" class="app-elements-media__fallback" />
  </div>
</template>

<style lang="scss">
.app-elements-media {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;

  &__image,
  &__fallback {
    width: 100%;
    height: 100%;
    display: block;
    overflow: hidden;
  }

  &__image {
    position: relative;

    :deep(picture),
    :deep(img) {
      width: 100%;
      height: 100%;
      display: block;
    }

    :deep(img) {
      object-fit: cover;
    }
  }

  &__fallback {
    width: 100%;
    height: 100%;
    background: var(--c-beige);
  }
}
</style>
