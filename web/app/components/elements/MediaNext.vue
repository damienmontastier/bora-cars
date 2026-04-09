<script lang="ts" setup>
const props = defineProps({
  src: {
    type: String,
    required: false,
  },
  alt: {
    type: String,
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
  },
  provider: {
    type: String,
    default: undefined, // auto-detected from src if not specified
  },
  borderRadius: {
    type: String,
    default: '2px',
  },
  fallbackColor: {
    type: String,
    default: 'var(--c-primary-300)',
  },
  modifiers: {
    type: Object,
    default: undefined,
  },
})

const { src, alt, preload, sizes, lazy, borderRadius, fallbackColor, modifiers, provider } = toRefs(props)

const isLoaded = ref(false)

function onLoad() {
  isLoaded.value = true
}

const loading = computed(() => {
  return lazy.value ? 'lazy' : 'eager'
})

const hasSrc = computed(() => !!src.value)

const resolvedProvider = computed(() => {
  if (provider.value)
    return provider.value
  const s = src.value ?? ''
  // file://uuid or absolute Kirby URL → kirby provider
  if (s.startsWith('file://') || (s.startsWith('http') && !s.startsWith('/')))
    return 'kirby'
  return undefined
})

const localModifiers = computed(() => modifiers.value ?? {})

const mainRef = useTemplateRef('mainRef')
const pictureRef = useTemplateRef('pictureRef')

onMounted(() => {
  const img = pictureRef.value?.$el?.querySelector('img') || pictureRef.value?.$el

  if (img && img.complete) {
    onLoad()
  }
})

defineExpose({
  mainRef,
  pictureRef,
})
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
      :style="{ borderRadius }"
      :class="{ 'not-loaded': !isLoaded }"
      @load="onLoad"
    />

    <div
      v-else
      ref="pictureRef"
      class="app-elements-media__fallback"
      :style="{
        borderRadius,
        backgroundColor: fallbackColor,
      }"
    >
      <span>No Image — Add image</span>
    </div>
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
    background-color: var(--c-neutral-200);

    :deep(img) {
      opacity: 1;
      transition: opacity 0.35s var(--ease-out-cubic);
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2;
      background: linear-gradient(90deg, var(--c-neutral-200) 0%, var(--c-neutral-300) 50%, var(--c-neutral-200) 100%);
      background-size: 200% 100%;
      opacity: 0;
      transition: opacity 0.35s var(--ease-out-cubic);
      pointer-events: none;
    }

    &.not-loaded {
      :deep(img) {
        opacity: 0;
      }

      &::after {
        opacity: 1;
        animation: skeleton-loading 1.5s infinite linear;
      }
    }
  }

  &__fallback {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @keyframes skeleton-loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
}
</style>
