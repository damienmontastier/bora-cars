<script lang="ts" setup>
import { gsap } from 'gsap'
import { useLenis } from 'lenis/vue'
import { storeToRefs } from 'pinia'

const HOLD_AFTER_COMPLETE = 0.5
const OUT_DURATION = 0.55
const OUT_OVERLAP = 0.2
const OUT_EASE = 'power3.inOut'
const PRELOADER_DONE_DELAY = 0.15

const logoColor = 'beige'
const bgColor = 'orange'

const appStore = useAppStore()
const { preloaderDone, fontsLoaded } = storeToRefs(appStore)
const lenis = useLenis()

const progress = ref(0)
const outProgressFill = ref(0)
const outProgressTrack = ref(0)
const pathTopPct = ref(0)
const pathBottomPct = ref(100)
const logoRef = useTemplateRef<HTMLElement>('logoRef')

const fillClipPath = computed(() => {
  const top = pathBottomPct.value - (pathBottomPct.value - pathTopPct.value) * progress.value
  const bottom = (100 - pathBottomPct.value) + (pathBottomPct.value - pathTopPct.value + 5) * outProgressFill.value
  return `inset(${top}% 0 ${bottom}% 0)`
})

const trackClipPath = computed(() => {
  const bottom = (100 - pathBottomPct.value) + (pathBottomPct.value - pathTopPct.value + 5) * outProgressTrack.value
  return `inset(0 0 ${bottom}% 0)`
})

// Background wipes away bottom → top, in sync with the logo fill/track disappearance
const bgClipPath = computed(() => `inset(0 0 ${outProgressTrack.value * 100}% 0)`)

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

  ctx = gsap.context(() => {}, logoRef.value!)

  if (fontsLoaded.value) {
    logoVisible.value = true
    startProgressTimeline()
  }
})

onBeforeUnmount(() => {
  ctx?.revert()
  ctx = null
  lenis.value?.start()
})
</script>

<template>
  <div
    class="app-preloader"
    :class="{ 'app-preloader--done': preloaderDone }"
  >
    <div
      class="app-preloader__background"
      :style="{ backgroundColor: `var(--c-${bgColor})`, clipPath: bgClipPath }"
    />
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
  overflow: hidden;
  transition: opacity 0.35s var(--ease-in-out-cubic);

  &--done {
    opacity: 0;
    pointer-events: none;
  }

  &__background {
    position: absolute;
    inset: 0;
    z-index: 0;
    will-change: clip-path;
  }

  &__inner {
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  &__logo {
    position: absolute;
    top: 50%;
    left: 50%;
    width: desktop-vw(200px);
    height: auto;
    aspect-ratio: 1;
    transform: translate(-50%, -50%);
    transform-origin: center center;
    will-change: transform, opacity;
    opacity: 0;
    transition: opacity 0.4s var(--ease-out-cubic);
    animation: preloader-heartbeat 2.2s ease-in-out infinite both;

    &--visible {
      opacity: 1;
    }

    @include mobile {
      width: mobile-vw(160px);
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

@keyframes preloader-heartbeat {
  0% {
    transform: translate(-50%, -50%) scale(1);
    animation-timing-function: cubic-bezier(0.45, 0, 0.55, 1);
  }

  /* lub — franc, contraction nette */
  12% {
    transform: translate(-50%, -50%) scale(0.95);
    animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* léger rebond élastique au relâchement */
  25% {
    transform: translate(-50%, -50%) scale(1.008);
    animation-timing-function: cubic-bezier(0.45, 0, 0.55, 1);
  }

  /* dub — écho plus doux */
  36% {
    transform: translate(-50%, -50%) scale(0.972);
    animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* retour au repos */
  50% {
    transform: translate(-50%, -50%) scale(1);
  }

  /* temps de repos long avant le prochain battement */
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
}
</style>
