<script lang="ts" setup>
import { gsap } from 'gsap'
import { useLenis } from 'lenis/vue'
import { storeToRefs } from 'pinia'

const BOUNCE_SPEED = 300
const HOLD_AFTER_COMPLETE = 0.5
const OUT_DURATION = 0.55
const OUT_OVERLAP = 0.2
const OUT_EASE = 'power3.inOut'
const PRELOADER_DONE_DELAY = 0.15

const appStore = useAppStore()
const { preloaderDone, fontsLoaded } = storeToRefs(appStore)
const lenis = useLenis()

const progress = ref(0)
const outProgressFill = ref(0)
const outProgressTrack = ref(0)
const pathTopPct = ref(0)
const pathBottomPct = ref(100)
const logoRef = useTemplateRef<HTMLElement>('logoRef')
const { logoColor, bgColor, start, stop } = useBouncingLogo(logoRef, { speed: BOUNCE_SPEED, cycleColors: false })

const fillClipPath = computed(() => {
  const top = pathBottomPct.value - (pathBottomPct.value - pathTopPct.value) * progress.value
  const bottom = (100 - pathBottomPct.value) + (pathBottomPct.value - pathTopPct.value + 5) * outProgressFill.value
  return `inset(${top}% 0 ${bottom}% 0)`
})

const trackClipPath = computed(() => {
  const bottom = (100 - pathBottomPct.value) + (pathBottomPct.value - pathTopPct.value + 5) * outProgressTrack.value
  return `inset(0 0 ${bottom}% 0)`
})

function measurePath() {
  const svg = logoRef.value?.querySelector('svg')
  const path = logoRef.value?.querySelector('path')
  if (!svg || !path)
    return
  const viewBox = svg.viewBox.baseVal
  const bbox = path.getBBox()
  pathTopPct.value = (bbox.y / viewBox.height) * 100
  pathBottomPct.value = ((bbox.y + bbox.height) / viewBox.height) * 100
}

const timelineComplete = ref(false)
const logoVisible = ref(false)
const progressStarted = ref(false)
const outStarted = ref(false)

let ctx: gsap.Context | null = null

function startProgressTimeline() {
  if (progressStarted.value || !ctx)
    return
  progressStarted.value = true

  ctx.add(() => {
    gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onComplete: () => {
        timelineComplete.value = true
        finalize()
      },
    })
      .to(progress, { value: 0.35, duration: 0.6, ease: 'power2.out' }, '+=0.8')
      .to(progress, { value: gsap.utils.random(0.5, 0.75, 0.01), duration: 0.55 }, '+=0.25')
      .to(progress, { value: 1, duration: 0.4, ease: 'power1.in' }, '+=0.2')
  })
}

function finalize() {
  if (!timelineComplete.value || !fontsLoaded.value || outStarted.value || !ctx)
    return
  outStarted.value = true

  ctx.add(() => {
    gsap.timeline({
      delay: HOLD_AFTER_COMPLETE,
      defaults: { duration: OUT_DURATION, ease: OUT_EASE },
      onComplete: () => {
        gsap.delayedCall(PRELOADER_DONE_DELAY, () => {
          preloaderDone.value = true
          stop()
          lenis.value?.start()
        })
      },
    })
      .to(outProgressFill, { value: 1 })
      .to(outProgressTrack, { value: 1 }, `-=${OUT_OVERLAP}`)
  })
}

watch(fontsLoaded, (loaded) => {
  if (!loaded)
    return
  logoVisible.value = true
  startProgressTimeline()
  finalize()
})

onMounted(async () => {
  await nextTick()
  measurePath()
  start()

  ctx = gsap.context(() => {}, logoRef.value!)

  if (fontsLoaded.value) {
    logoVisible.value = true
    startProgressTimeline()
  }
})

onBeforeUnmount(() => {
  ctx?.revert()
  ctx = null
  stop()
  lenis.value?.start()
})
</script>

<template>
  <div
    class="app-preloader"
    :class="{ 'app-preloader--done': preloaderDone }"
    :style="{ backgroundColor: `var(--c-${bgColor})` }"
  >
    <div class="app-preloader__inner">
      <div
        ref="logoRef"
        class="app-preloader__logo"
        :class="{ 'app-preloader__logo--visible': logoVisible }"
      >
        <SvgLogoMinimal
          class="app-preloader__logo-track"
          :color="logoColor"
          :style="{ clipPath: trackClipPath }"
        />
        <SvgLogoMinimal
          class="app-preloader__logo-fill"
          :color="logoColor"
          :style="{ clipPath: fillClipPath }"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.app-preloader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: var(--c-black);
  overflow: hidden;
  transition:
    opacity 0.35s var(--ease-in-out-cubic),
    background-color 0.3s var(--ease-out-cubic);

  &--done {
    opacity: 0;
    pointer-events: none;
  }

  &__inner {
    position: absolute;
    inset: 0;
  }

  &__logo {
    position: absolute;
    top: 0;
    left: 0;
    width: desktop-vw(200px);
    height: auto;
    will-change: transform, opacity;
    transform: translate3d(0, 0, 0);
    aspect-ratio: 1;
    opacity: 0;
    transition: opacity 0.4s var(--ease-out-cubic);

    &--visible {
      opacity: 1;
    }

    @include mobile {
      width: mobile-vw(160px);
      height: auto;
    }
  }

  &__logo-track,
  &__logo-fill {
    position: absolute;
    inset: 0;
  }

  &__logo-track {
    opacity: 0.5;
  }
}
</style>
