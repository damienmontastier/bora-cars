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
  overlay: {
    type: Boolean,
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

const isLoaded = ref(false)

function onLoad() {
  isLoaded.value = true
}

const loading = computed(() => props.lazy ? 'lazy' : 'eager')
const hasSrc = computed(() => !!props.src)
const resolvedProvider = computed(() => props.provider ?? undefined)

// NuxtPicture only injects its `preload` <link> server-side, so on SPA
// navigation the hero image is fetched as a normal, non-prioritised request —
// the reveal blur lingers while it loads. Mirror the preload's fetchPriority
// onto the real <img> (via imgAttrs → spread onto the inner <img>) so eager
// media also loads at high priority on client-side navigation.
const imgAttrs = computed(() => {
  const fetchpriority = typeof props.preload === 'object'
    ? props.preload.fetchPriority
    : props.preload
      ? 'high'
      : undefined
  return fetchpriority ? { fetchpriority } : {}
})
const localModifiers = computed(() => ({
  ...props.modifiers,
  ...(props.hotspot && { hotspot: props.hotspot }),
  ...(props.crop && { crop: props.crop }),
}))

const wrapperProps = computed(() => (!props.parallax || props.parallax === true) ? {} : props.parallax as ParallaxProps)

const mainRef = useTemplateRef<HTMLElement>('mainRef')
const pictureRef = ref<any>(null)

onMounted(() => {
  const el = pictureRef.value?.$el ?? pictureRef.value
  const img: HTMLImageElement | null = el?.querySelector?.('img') ?? null
  // `load` doesn't bubble, so relying solely on NuxtPicture's emit is fragile.
  // Listen on the real <img>, and reveal on `error` / missing-img too: an opaque
  // reveal panel must never stay stuck covering the slot.
  if (!img || img.complete) {
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
      <NuxtPicture
        v-if="hasSrc"
        ref="pictureRef"
        class="app-elements-media__image"
        :src="src!"
        :sizes="sizes"
        :loading="loading"
        :preload="preload"
        :img-attrs="imgAttrs"
        :provider="resolvedProvider"
        format="webp"
        :alt="alt"
        :modifiers="localModifiers"
        @load="onLoad"
      />
      <ElementsMediaOverlay
        v-if="hasSrc && overlay"
        :loaded="isLoaded"
      />
      <div v-if="!hasSrc" ref="pictureRef" class="app-elements-media__fallback" />
    </div>
  </UtilsParallax>
  <div v-else ref="mainRef" class="app-elements-media" v-bind="$attrs">
    <NuxtPicture
      v-if="hasSrc"
      ref="pictureRef"
      class="app-elements-media__image"
      :src="src!"
      :sizes="sizes"
      :loading="loading"
      :preload="preload"
      :img-attrs="imgAttrs"
      :provider="resolvedProvider"
      format="webp"
      :alt="alt"
      :modifiers="localModifiers"
      @load="onLoad"
    />
    <ElementsMediaOverlay
      v-if="hasSrc && overlay"
      :loaded="isLoaded"
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
