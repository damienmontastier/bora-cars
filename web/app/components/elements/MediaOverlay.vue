<script lang="ts" setup>
const props = withDefaults(defineProps<{
  loaded: boolean
  threshold?: number
  color?: string
  borderRadius?: string
}>(), {
  threshold: 0.1,
  color: 'orange-100',
  borderRadius: '0px',
})

const REVEAL_S_PER_1000PX = 1.5
const REVEAL_DURATION_MIN_S = 0.6
const REVEAL_DURATION_MAX_S = 1.2

const overlayRef = useTemplateRef<HTMLElement>('overlayRef')
const isInView = ref(false)

const { height } = useElementSize(overlayRef)

useIntersectionObserver(
  overlayRef,
  ([entry]) => {
    if (entry?.isIntersecting)
      isInView.value = true
  },
  { threshold: props.threshold },
)

const isRevealed = computed(() => props.loaded && isInView.value)

const revealDuration = computed(() => {
  const raw = (height.value / 1000) * REVEAL_S_PER_1000PX
  return Math.min(REVEAL_DURATION_MAX_S, Math.max(REVEAL_DURATION_MIN_S, raw))
})
</script>

<template>
  <div
    ref="overlayRef"
    class="app-elements-media-overlay"
    :class="{ 'is-revealed': isRevealed, 'is-loading': !isRevealed }"
    :style="{
      borderRadius,
      'backgroundColor': `var(--c-${color})`,
      '--reveal-duration': `${revealDuration}s`,
    }"
  />
</template>

<style lang="scss">
.app-elements-media-overlay {
  position: absolute;
  inset: 0;
  transform-origin: center bottom;
  transform: scaleY(1);
  transition: transform var(--reveal-duration, 1.2s) var(--ease-in-out-circ);
  pointer-events: none;
  z-index: 3;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100%);
    background-size: 200% 100%;
    background-repeat: no-repeat;
    background-position: 200% 0;
    opacity: 0;
    transition: opacity 0.45s var(--ease-out-cubic);
    pointer-events: none;
    border-radius: inherit;
  }

  &.is-loading::after {
    opacity: 1;
    animation: media-overlay-shimmer 1.5s infinite linear;
  }

  &.is-revealed {
    transform: scaleY(0);
  }
}

@keyframes media-overlay-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
