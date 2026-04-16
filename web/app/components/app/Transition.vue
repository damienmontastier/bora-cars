<script setup lang="ts">
import gsap from 'gsap'

const overlayRef = useTemplateRef('overlayRef')

onMounted(() => {
  gsap.set(overlayRef.value, { scaleY: 0 })
})

function enter(done: () => void) {
  gsap.to(overlayRef.value, {
    scaleY: 1,
    duration: 0.6,
    ease: 'power3.inOut',
    transformOrigin: 'bottom',
    onComplete: done,
  })
}

function leave(done: () => void) {
  gsap.to(overlayRef.value, {
    scaleY: 0,
    duration: 0.6,
    ease: 'power3.inOut',
    transformOrigin: 'top',
    onComplete: done,
  })
}

defineExpose({ enter, leave })
</script>

<template>
  <div ref="overlayRef" class="app-transition" />
</template>

<style lang="scss">
.app-transition {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background-color: var(--c-black);
  pointer-events: none;
}
</style>
