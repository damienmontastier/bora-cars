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
    type: Boolean,
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
      :class="{ 'not-loaded': !isLoaded }"
      @load="onLoad"
    />

    <div
      v-else
      ref="pictureRef"
      class="app-elements-media__fallback"
    />
  </div>
</template>

<style lang="scss">
.app-elements-media {
  position: relative;
  overflow: hidden;

  &__image,
  &__fallback {
    width: 100%;
    height: 100%;
    display: block;
    overflow: hidden;
  }

  &__image {
    position: relative;
    background-color: var(--c-orange-10);

    :deep(picture),
    :deep(img) {
      width: 100%;
      height: 100%;
      display: block;
    }

    :deep(img) {
      opacity: 1;
      transition: opacity 0.35s ease-out;
      object-fit: cover;
    }

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 2;
      background: linear-gradient(90deg, var(--c-orange-10) 0%, var(--c-orange-20) 50%, var(--c-orange-10) 100%);
      background-size: 200% 100%;
      opacity: 0;
      transition: opacity 0.35s ease-out;
      pointer-events: none;
    }

    &.not-loaded {
      :deep(img) {
        opacity: 0;
      }

      &::after {
        opacity: 1;
        animation: media-skeleton 1.5s infinite linear;
      }
    }
  }

  &__fallback {
    width: 100%;
    height: 100%;
    background: var(--c-orange-10);
  }

  @keyframes media-skeleton {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
}
</style>
