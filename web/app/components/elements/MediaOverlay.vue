<script lang="ts" setup>
const props = withDefaults(defineProps<{
  loaded: boolean
  variant?: 'blur' | 'panel'
  color?: string
  duration?: number
  threshold?: number
  borderRadius?: string
  blur?: string
}>(), {
  variant: 'blur',
  color: 'orange-100',
  duration: undefined,
  threshold: 0,
  borderRadius: '0px',
  blur: '5px',
})

const REVEAL_S_PER_1000PX = 1.25
const REVEAL_DURATION_MIN_S = 0.65
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
const isShimmering = computed(() => isInView.value && !isRevealed.value)

const revealDuration = computed(() => {
  if (props.duration != null)
    return props.duration
  const raw = (height.value / 1000) * REVEAL_S_PER_1000PX
  return Math.min(REVEAL_DURATION_MAX_S, Math.max(REVEAL_DURATION_MIN_S, raw))
})

const done = ref(false)
function onRevealEnd(e: TransitionEvent) {
  if (e.pseudoElement || !isRevealed.value)
    return
  done.value = true
}
</script>

<template>
  <div
    v-if="!done"
    ref="overlayRef"
    class="app-elements-media-overlay"
    :class="[`app-elements-media-overlay--${variant}`, { 'is-revealed': isRevealed, 'is-loading': isShimmering }]"
    :style="{
      borderRadius,
      '--reveal-duration': `${revealDuration}s`,
      '--overlay-blur': blur,
      '--overlay-color': `var(--c-${color})`,
    }"
    @transitionend="onRevealEnd"
  />
</template>

<style lang="scss">
.app-elements-media-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100%);
    transform: translateX(-100%);
    opacity: 0;
    transition: opacity 0.45s var(--ease-out-cubic);
    pointer-events: none;
    border-radius: inherit;
  }

  &.is-loading::after {
    opacity: 1;
    will-change: transform;
    animation: media-overlay-shimmer 1.5s infinite linear;
  }

  &--blur {
    opacity: 1;
    backdrop-filter: blur(var(--overlay-blur, 5px));
    -webkit-backdrop-filter: blur(var(--overlay-blur, 5px));
    transition: opacity var(--reveal-duration, 1.2s) var(--ease-in-out-circ);
    will-change: opacity;

    &.is-revealed {
      opacity: 0;
    }
  }

  &--panel {
    background-color: var(--overlay-color, var(--c-orange-100));
    transform: scaleY(1);
    transform-origin: center top;
    transition: transform var(--reveal-duration, 1.2s) var(--ease-in-out-expo);
    will-change: transform;

    &.is-revealed {
      transform: scaleY(0);
    }
  }
}

@keyframes media-overlay-shimmer {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(100%);
  }
}
</style>
