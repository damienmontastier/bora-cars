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

const imgAttrs = computed(() => {
  const fetchpriority = props.fetchPriority
    ?? (typeof props.preload === 'object'
      ? props.preload.fetchPriority
      : props.preload
        ? 'high'
        : undefined)
  return { decoding: 'async' as const, ...(fetchpriority ? { fetchpriority } : {}) }
})
const localModifiers = computed(() => ({
  ...props.modifiers,
  ...(props.hotspot && { hotspot: props.hotspot }),
  ...(props.crop && { crop: props.crop }),
}))

const fit = computed(() => props.modifiers?.fit ?? 'outside')

const MOBILE_MEDIA = '(max-width: 799px)'
const DESKTOP_MEDIA = '(min-width: 800px)'

const $img = useImage()

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

  const max = maxCropWidth(ratio)
  const candidates = result.srcset.split(', ').map((entry) => {
    const i = entry.lastIndexOf(' ')
    return { url: entry.slice(0, i), width: Number.parseInt(entry.slice(i + 1)) }
  })
  if (candidates.every(c => c.width <= max))
    return result

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
  const el = pictureRef.value?.$el ?? pictureRef.value
  const img: HTMLImageElement | null = el instanceof HTMLImageElement ? el : (el?.querySelector?.('img') ?? null)
  if (!img) {
    onLoad()
    return
  }
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
