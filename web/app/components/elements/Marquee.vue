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
    default: 0.4,
  },
  trigger: {
    type: Object as PropType<HTMLElement | null>,
    default: null,
  },
})

let ctx: gsap.Context | null = null
let tween: gsap.core.Tween | null = null

const lenis = useLenis()

const mainRef = useTemplateRef<HTMLElement>('mainRef')
const wrapperRef = useTemplateRef<HTMLElement>('wrapperRef')
const elementsRef = ref<HTMLElement[]>([])

const { isOutside } = useMouseInElement(mainRef)
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

watch(isOutside, () => {
  if (!props.pauseOnHover || !tween)
    return

  gsap.to(tween, { timeScale: isOutside.value ? 1 : 0, duration: 1 })
})

// Accelerate on scroll velocity via timeScale
watchEffect((onInvalidate) => {
  if (!props.scrollVelocity)
    return

  const l = lenis.value
  if (!l)
    return

  const onScroll = ({ velocity }: { velocity: number }) => {
    if (!tween)
      return
    // Set timeScale instantly (snappy), then decelerate back to 1
    tween.timeScale(1 + Math.abs(velocity) * 0.4)
    gsap.to(tween, { timeScale: 1, duration: 0.8, ease: 'power2.out', overwrite: true })
  }

  l.on('scroll', onScroll)
  onInvalidate(() => l.off('scroll', onScroll))
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

  const { fontsLoaded } = toRefs(useAppStore())
  if (!fontsLoaded.value) {
    await until(fontsLoaded).toBe(true)
  }

  setupAnimation()
})

onUnmounted(() => {
  teardownAnimation()
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
