<script setup lang="ts">
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { VueLenis } from 'lenis/vue'
import Tempus from 'tempus'

const lenisOptions = {
  autoRaf: false,
  lerp: 0.1,
}

const lenisRef = ref()

watchEffect((onInvalidate) => {
  if (!lenisRef.value?.lenis)
    return

  const lenis = lenisRef.value.lenis

  window.lenis = lenis

  const initialHash = window.location.hash
  lenis.scrollTo(initialHash || 0, { immediate: true })

  lenis.on('scroll', ScrollTrigger.update)

  lenis.stop()

  const unsubscribe = Tempus.add(({ time }) => {
    lenis.raf(time)
  }, { order: -2, label: 'lenis' })

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
