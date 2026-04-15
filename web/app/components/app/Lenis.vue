<script setup lang="ts">
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { VueLenis } from 'lenis/vue'
import Tempus from 'tempus'

// easeOutSine   : t => Math.sin((t * Math.PI) / 2)
// easeOutQuad   : t => 1 - (1 - t) ** 2
// easeOutCubic  : t => 1 - (1 - t) ** 3
// easeOutQuart  : t => 1 - (1 - t) ** 4
// easeOutQuint  : t => 1 - (1 - t) ** 5
// easeOutExpo   : t => Math.min(1, 1.001 - 2 ** (-10 * t))
// easeOutCirc   : t => Math.sqrt(1 - (t - 1) ** 2)

const lenisOptions = {
  autoRaf: false, // driven manually via Tempus
  duration: 1,
  easing: t => 1 - (1 - t) ** 5,
}

const lenisRef = ref()

watchEffect((onInvalidate) => {
  if (!lenisRef.value?.lenis)
    return

  const lenis = lenisRef.value.lenis

  window.lenis = lenis

  lenis.on('scroll', ScrollTrigger.update)

  const unsubscribe = Tempus.add((time) => {
    lenis.raf(time)
  }, { priority: -2 })

  onInvalidate(() => {
    unsubscribe?.()
    lenis.off('scroll', ScrollTrigger.update)
    delete window.lenis
  })
})

onUnmounted(() => {
  lenisRef.value?.destroy()
})
</script>

<template>
  <VueLenis ref="lenisRef" root :options="lenisOptions" />
</template>
