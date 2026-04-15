<script setup lang="ts">
import type { PropType } from 'vue'
import gsap from 'gsap'
import { useLenis } from 'lenis/vue'

const props = defineProps({
  repeat: {
    type: Number,
    default: 4,
  },
  duration: {
    type: Number,
    default: 5,
  },
  reversed: {
    type: Boolean,
    default: false,
  },
  pauseOnHover: {
    type: Boolean,
    default: false,
  },
  animatedOnMobile: {
    type: Boolean,
    default: false,
  },
  scrollVelocity: {
    type: Boolean,
    default: false,
  },
  scrollVelocitySpeed: {
    type: Number,
    default: 0.5,
  },
  trigger: {
    type: Object as PropType<HTMLElement | null>,
    default: null,
  },
})

let ctx: gsap.Context | null = null
let tween: gsap.core.Tween | null = null
let velocityResetTimeout: ReturnType<typeof setTimeout> | null = null

const { fontsLoaded } = toRefs(useAppStore())

// useLenis callback is automatically registered/cleaned up by the composable
useLenis((lenis) => {
  if (!props.scrollVelocity || !tween)
    return

  if (velocityResetTimeout) {
    clearTimeout(velocityResetTimeout)
    velocityResetTimeout = null
  }

  gsap.to(tween, {
    timeScale: 1 + Math.abs(lenis.velocity) * props.scrollVelocitySpeed,
    duration: 0.15,
    ease: 'power2.out',
    overwrite: true,
  })

  velocityResetTimeout = setTimeout(() => {
    if (!tween)
      return
    gsap.to(tween, { timeScale: 1, duration: 1, ease: 'power3.out', overwrite: true })
    velocityResetTimeout = null
  }, 100)
})

const mainRef = useTemplateRef<HTMLElement>('mainRef')
const wrapperRef = useTemplateRef<HTMLElement>('wrapperRef')
const elementsRef = ref<HTMLElement[]>([])

// Only set up mouse tracking when actually needed
const { isOutside } = props.pauseOnHover
  ? useMouseInElement(mainRef)
  : { isOutside: readonly(ref(true)) }

const { isMobile } = useBreakpoint()

const uidInstance = useId()

const shouldAnimate = computed(() => !isMobile.value || props.animatedOnMobile)

const isMounted = ref(false)

const activeRepeat = computed(() => {
  if (!isMounted.value)
    return props.repeat
  return shouldAnimate.value ? props.repeat : 1
})

function setupAnimation() {
  ctx = gsap.context(() => {
    const singleWidth = Math.round(elementsRef.value[0]?.getBoundingClientRect().width ?? 0)

    tween = gsap.fromTo(
      wrapperRef.value,
      { x: props.reversed ? -singleWidth : 0 },
      {
        x: props.reversed ? 0 : -singleWidth,
        ease: 'none',
        duration: props.duration,
        repeat: -1,
        scrollTrigger: {
          trigger: props.trigger ?? mainRef.value,
          start: 'top bottom',
          end: 'bottom top',
          toggleActions: 'play pause resume pause',
        },
      },
    )
  }, mainRef.value!)
}

function teardownAnimation() {
  ctx?.revert()
  ctx = null
  tween = null
}

// Re-measure singleWidth on resize (stale after window resize)
useResizeObserver(mainRef, useDebounceFn(async () => {
  if (!shouldAnimate.value)
    return
  teardownAnimation()
  await nextTick()
  setupAnimation()
}, 200))

watch(isOutside, () => {
  if (!props.pauseOnHover || !tween)
    return

  gsap.to(tween, { timeScale: isOutside.value ? 1 : 0, duration: 1 })
})


watch(isMobile, async () => {
  teardownAnimation()

  if (shouldAnimate.value) {
    await nextTick()
    setupAnimation()
  }
})

onMounted(async () => {
  isMounted.value = true

  if (!shouldAnimate.value)
    return

  if (!fontsLoaded.value) {
    await until(fontsLoaded).toBe(true)
  }

  setupAnimation()
})

onUnmounted(() => {
  teardownAnimation()
  if (velocityResetTimeout)
    clearTimeout(velocityResetTimeout)
})

defineExpose({ mainRef, wrapperRef })
</script>

<template>
  <div ref="mainRef" class="app-elements-marquee">
    <div ref="wrapperRef" class="app-elements-marquee__wrapper">
      <div
        v-for="i in activeRepeat"
        ref="elementsRef"
        :key="`app-elements-marquee-${uidInstance}-repeat-${i}`"
        class="app-elements-marquee__inner"
      >
        <slot />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.app-elements-marquee {
  position: relative;
  overflow: hidden;

  &__wrapper {
    display: flex;
    will-change: transform;
  }

  &__inner {
    display: flex;
    flex-shrink: 0;

    @include mobile {
      flex-direction: column;
      width: 100%;
    }
  }

  & > * {
    @include disable-draggable();
  }
}
</style>
