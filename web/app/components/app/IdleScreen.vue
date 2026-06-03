<script lang="ts" setup>
import { useLenis } from 'lenis/vue'
import { storeToRefs } from 'pinia'

const SHOW_DELAY = 1500

const appStore = useAppStore()
const { preloaderDone } = storeToRefs(appStore)
const visibility = useDocumentVisibility()
const lenis = useLenis()

const visible = ref(false)
const logoRef = useTemplateRef<HTMLElement>('logoRef')
const { logoColor, bgColor, start, stop } = useBouncingLogo(logoRef, { speed: 300, cycleColors: false })

const { start: startShowTimer, stop: stopShowTimer } = useTimeoutFn(() => {
  visible.value = true
}, SHOW_DELAY, { immediate: false })

watch(visibility, (v) => {
  if (v === 'hidden' && preloaderDone.value) {
    startShowTimer()
  }
  else {
    stopShowTimer()
    visible.value = false
  }
})

watch(visible, async (v) => {
  if (v) {
    lenis.value?.stop()
    await nextTick()
    start()
  }
  else {
    stop()
    lenis.value?.start()
  }
})

onBeforeUnmount(() => {
  stop()
  stopShowTimer()
  lenis.value?.start()
})
</script>

<template>
  <Transition name="idle-screen-fade">
    <div
      v-if="visible"
      class="app-idle-screen"
      :style="{ backgroundColor: `var(--c-${bgColor})` }"
    >
      <div ref="logoRef" class="app-idle-screen__logo">
        <SvgLogoMinimal :color="logoColor" />
      </div>
    </div>
  </Transition>
</template>

<style lang="scss">
.app-idle-screen {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: var(--c-black);
  overflow: hidden;
  transition: background-color 0.3s var(--ease-out-cubic);

  &__logo {
    position: absolute;
    top: 0;
    left: 0;
    width: desktop-vw(96px);
    height: desktop-vw(96px);
    will-change: transform;
    transform: translate3d(0, 0, 0);

    @include mobile {
      width: mobile-vw(64px);
      height: mobile-vw(64px);
    }
  }
}

.idle-screen-fade-enter-active,
.idle-screen-fade-leave-active {
  transition: opacity 0.3s var(--ease-in-out-cubic);
}

.idle-screen-fade-enter-from,
.idle-screen-fade-leave-to {
  opacity: 0;
}
</style>
