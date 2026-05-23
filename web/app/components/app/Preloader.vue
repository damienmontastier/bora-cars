<script lang="ts" setup>
import { gsap } from 'gsap'
import { useLenis } from 'lenis/vue'
import { storeToRefs } from 'pinia'

const BOUNCE_SPEED = 300
const HOLD_AFTER_COMPLETE = 0.5
const PRELOADER_DONE_DELAY = 0.15

const appStore = useAppStore()
const { preloaderDone, fontsLoaded } = storeToRefs(appStore)
const lenis = useLenis()

const preloaderContentHide = ref(false)
const progress = ref(0)
const pathTopPct = ref(0)
const pathBottomPct = ref(100)
const logoRef = useTemplateRef<HTMLElement>('logoRef')
const { logoColor, bgColor, start, stop } = useBouncingLogo(logoRef, { speed: BOUNCE_SPEED })

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

let progressTl: gsap.core.Timeline | null = null
const timelineComplete = ref(false)
const logoVisible = ref(false)

function finalize() {
  if (!timelineComplete.value || !fontsLoaded.value)
    return
  if (preloaderContentHide.value)
    return

  gsap.delayedCall(HOLD_AFTER_COMPLETE, () => {
    preloaderContentHide.value = true
  })

  gsap.delayedCall(HOLD_AFTER_COMPLETE + PRELOADER_DONE_DELAY, () => {
    preloaderDone.value = true
    stop()
    lenis.value?.start()
  })
}

function startProgressTimeline() {
  if (progressTl)
    return
  progressTl = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    onComplete: () => {
      timelineComplete.value = true
      finalize()
    },
  })
    .to(progress, { value: 0.40, duration: 0.6, ease: 'power2.out' }, '+=0.8')
    .to(progress, { value: 0.80, duration: 0.55 }, '+=0.25')
    .to(progress, { value: 1, duration: 0.4, ease: 'power1.in' }, '+=0.2')
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

  if (fontsLoaded.value) {
    logoVisible.value = true
    startProgressTimeline()
  }
})

onBeforeUnmount(() => {
  progressTl?.kill()
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
    <div class="app-preloader__inner" :class="{ 'app-preloader__inner--hide': preloaderContentHide }">
      <div
        ref="logoRef"
        class="app-preloader__logo"
        :class="{ 'app-preloader__logo--visible': logoVisible }"
      >
        <SvgLogoMinimal class="app-preloader__logo-track" :color="logoColor" />
        <SvgLogoMinimal
          class="app-preloader__logo-fill"
          :color="logoColor"
          :style="{ clipPath: `inset(${pathBottomPct - (pathBottomPct - pathTopPct) * progress}% 0 0 0)` }"
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
    transition: opacity 0.25s var(--ease-in-out-cubic);

    &--hide {
      opacity: 0;
    }
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
      width: mobile-vw(64px);
      height: auto;
    }
  }

  &__logo-track,
  &__logo-fill {
    position: absolute;
    inset: 0;
  }

  &__logo-track {
    opacity: 0.2;
  }
}
</style>
