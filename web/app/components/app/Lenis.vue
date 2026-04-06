<script setup lang="ts">
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { VueLenis } from 'lenis/vue'
import Tempus from 'tempus'

const lenisOptions = {
  autoRaf: false, // driven manually via Tempus
  lerp: 0.1,
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
