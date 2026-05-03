<script setup lang="ts">
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
    type: [Boolean, Object] as unknown as () => boolean | { fetchPriority?: 'high' | 'low' | 'auto' },
    default: false,
  },
  sizes: {
    type: String,
    default: undefined,
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
  overlayColor: {
    type: String,
    default: 'beige',
  },
})

const isLoaded = ref(false)

function onLoad() {
  isLoaded.value = true
}

const loading = computed(() => props.lazy ? 'lazy' : 'eager')
const hasSrc = computed(() => !!props.src)
const resolvedProvider = computed(() => props.provider ?? undefined)
const localModifiers = computed(() => ({
  ...props.modifiers,
  ...(props.hotspot && { hotspot: props.hotspot }),
  ...(props.crop && { crop: props.crop }),
}))

const mainRef = useTemplateRef<HTMLElement>('mainRef')
const pictureRef = ref<any>(null)

onMounted(() => {
  const el = pictureRef.value?.$el ?? pictureRef.value
  const img = el?.querySelector?.('img') ?? el
  if (img?.complete)
    onLoad()
})

defineExpose({ mainRef, pictureRef })
</script>

<template>
  <div ref="mainRef" class="app-elements-media">
    <NuxtPicture
      v-if="hasSrc"
      ref="pictureRef"
      class="app-elements-media__image"
      :src="src!"
      :sizes="sizes"
      :loading="loading"
      :preload="preload"
      :provider="resolvedProvider"
      format="webp"
      :alt="alt"
      :modifiers="localModifiers"
      @load="onLoad"
    />
    <ElementsMediaOverlay
      v-if="hasSrc && overlay"
      :loaded="isLoaded"
      :color="overlayColor"
    />
    <div
      v-if="!hasSrc"
      ref="pictureRef"
      class="app-elements-media__fallback"
    />
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
