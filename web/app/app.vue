<script setup lang="ts">
import type { MenuData } from '~/queries/menu'
import { MENU_QUERY } from '~/queries/menu'
import type { SettingsData } from '~/queries/settings'
import { SETTINGS_QUERY } from '~/queries/settings'

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

const sanity = useSanity()
const settings = useSettings()

const [{ data: menu }, settingsData] = await Promise.all([
  useSanityQuery<MenuData>(MENU_QUERY),
  sanity.fetch<SettingsData>(SETTINGS_QUERY),
])

settings.value = settingsData

const transitionRef = useTemplateRef('transitionRef')

function onBeforeEnter() {
  window.lenis?.scrollTo(0, { immediate: true, force: true })
}

function onLeave(_el: Element, done: () => void) {
  transitionRef.value?.enter(done)
}

function onEnter(_el: Element, done: () => void) {
  transitionRef.value?.leave(done)
}
</script>

<template>
  <div id="app" class="app">
    <AppLenis />

    <!-- <AppPreloader /> -->
    <AppMenu :data="menu" />

    <AppOverlay />

    <AppTransition ref="transitionRef" />

    <!-- <DevOnly>
      <AppMenuDev />
    </DevOnly> -->

    <div id="app-page" class="app-page">
      <NuxtPage :transition="{ mode: 'out-in', onBeforeEnter, onLeave, onEnter }" />
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
