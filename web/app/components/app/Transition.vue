<script setup lang="ts">
import type Lenis from 'lenis'
import { useEventBus } from '@vueuse/core'
import gsap from 'gsap'

const lenis = () => window.lenis as Lenis | undefined
const transitionBus = useEventBus('page-transition')

const appStore = useAppStore()

const overlayRef = useTemplateRef('overlayRef')

let ctx: gsap.Context | undefined

onMounted(() => {
  ctx = gsap.context(() => {
    gsap.set(overlayRef.value, { scaleY: 0, transformOrigin: 'bottom' })
  }, overlayRef.value!)
})

onUnmounted(() => {
  ctx?.revert()
})

function onLeave(_el: Element, done: () => void) {
  lenis()?.stop()

  if (!overlayRef.value) {
    done()
    return
  }

  const run = () => {
    gsap.timeline({
      onComplete: () => {
        transitionBus.emit('covered') // overlay fully covers screen — safe to reset menu
        if (!appStore.preserveScroll) {
          lenis()?.scrollTo(0, { immediate: true, force: true })
          window.scrollTo(0, 0)
        }
        gsap.delayedCall(0.25, done)
      },
    })
      .to(overlayRef.value, {
        scaleY: 1,
        duration: 0.75,
        ease: 'expo.inOut',
      })
  }

  if (ctx)
    ctx.add(run)
  else run()
}

function onBeforeEnter() {}

function onEnter(_el: Element, done: () => void) {
  // Nouvelle page montée + overlay encore opaque (scaleY:1) → moment idéal pour que
  // router.options restaure / snap le scroll (back-forward, ancre cross-page) avant que
  // l'overlay se lève, donc sans saut visible. cf. branches `onceHidden` du router.
  transitionBus.emit('entering')

  if (!overlayRef.value) {
    lenis()?.start()
    done()
    return
  }

  const run = () => {
    gsap.timeline({
      onComplete: () => {
        lenis()?.start()
        done()
      },
    })
      .set(overlayRef.value, { transformOrigin: 'top' })
      .to(overlayRef.value, {
        scaleY: 0,
        duration: 0.9,
        ease: 'expo.inOut',
      })
      .set(overlayRef.value, { transformOrigin: 'bottom' })
  }

  if (ctx)
    ctx.add(run)
  else run()
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
