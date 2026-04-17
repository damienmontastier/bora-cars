<script setup lang="ts">
import type Lenis from 'lenis'
import gsap from 'gsap'

const lenis = () => window.lenis as Lenis | undefined

const overlayRef = useTemplateRef('overlayRef')

onMounted(() => {
  gsap.set(overlayRef.value, { scaleY: 0, transformOrigin: 'bottom' })
})

function onLeave(_el: Element, done: () => void) {
  lenis()?.stop()
  gsap.to(overlayRef.value, {
    scaleY: 1,
    duration: 0.75,
    ease: 'expo.inOut',
    onComplete: () => gsap.delayedCall(0.1, done),
  })
}

function onBeforeEnter() {
  window.scrollTo(0, 0)
  lenis()?.scrollTo(0, { immediate: true, force: true })
}

function onEnter(_el: Element, done: () => void) {
  gsap.set(overlayRef.value, { transformOrigin: 'top' })
  gsap.to(overlayRef.value, {
    scaleY: 0,
    duration: 0.9,
    ease: 'expo.inOut',
    onComplete: () => {
      lenis()?.start()
      done()
    },
  })
}

defineExpose({ onLeave, onBeforeEnter, onEnter })
</script>

<template>
  <div ref="overlayRef" class="app-transition" />
</template>

<style lang="scss">
.app-transition {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background-color: var(--c-orange-100);
  pointer-events: none;
}
</style>
