<script setup lang="ts">
import type { MenuData } from '~/queries/menu'
import { MENU_QUERY } from '~/queries/menu'

const appStore = useAppStore()
const { fontsLoaded } = toRefs(appStore)

useHead({
  htmlAttrs: {
    class: import.meta.env.DEV ? `dev` : ``,
  },
})

const { fontsReady } = useFontsReady()

watch(fontsReady, (ready) => {
  if (ready) {
    fontsLoaded.value = true
  }
})

const { data: menu } = await useSanityQuery<MenuData>(MENU_QUERY)

const lenis = useLenis()

function onBeforeEnter() {
  lenis.value?.scrollTo(0, { immediate: true, force: true })
}
</script>

<template>
  <div id="app" class="app">
    <AppLenis />

    <!-- <AppPreloader /> -->
    <AppMenu :data="menu" />

    <AppOverlay />

    <!-- <DevOnly>
      <AppMenuDev />
    </DevOnly> -->
    <!-- <AppTransitionOverlay /> -->

    <div id="app-page" class="app-page">
      <NuxtPage :transition="{ name: 'page', mode: 'out-in', onBeforeEnter }" />
    </div>

    <DevOnly>
      <DebugPatrol />
    </DevOnly>
  </div>
</template>

<style lang="scss">
.page-enter-active,
.page-leave-active {
  transition: opacity 0.5s var(--ease-out-cubic);
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

.app {
  height: 100%;
  width: 100%;
  z-index: 1;
  position: relative;

  &-page {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    // pointer-events: none;
  }
}
</style>
