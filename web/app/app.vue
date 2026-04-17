<script setup lang="ts">
import type { MenuData } from '~/queries/menu'
import type { SettingsData } from '~/queries/settings'
import { MENU_QUERY } from '~/queries/menu'
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

const { finalizePendingLocaleChange } = useI18n()

const sanity = useSanity()
const settings = useSettings()
const lang = useSanityLang()

const menuParams = reactive({ lang: lang.value })
watch(lang, (v) => {
  menuParams.lang = v
})

const [{ data: menu }, settingsData] = await Promise.all([
  useSanityQuery<MenuData>(MENU_QUERY, menuParams),
  sanity.fetch<SettingsData>(SETTINGS_QUERY),
])

settings.value = settingsData

useHead({
  htmlAttrs: { lang },
})

const transitionRef = useTemplateRef('transitionRef')

const pageTransition = {
  mode: 'out-in' as const,
  onLeave: (el: Element, done: () => void) => transitionRef.value?.onLeave(el, done),
  onBeforeEnter: async () => {
    await finalizePendingLocaleChange()
    transitionRef.value?.onBeforeEnter()
  },
  onEnter: (el: Element, done: () => void) => transitionRef.value?.onEnter(el, done),
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
      <NuxtPage :transition="pageTransition" />
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
