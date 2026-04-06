<script setup lang="ts">
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
</script>

<template>
  <div id="app" class="app">
    <AppLenis />

    <!-- <AppPreloader /> -->

    <AppMenu />

    <!-- <AppTransitionOverlay /> -->

    <div id="app-page" class="app-page">
      <NuxtPage />
    </div>

    <DevOnly>
      <DebugPatrol />
    </DevOnly>
  </div>
</template>

<style lang="scss">
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
