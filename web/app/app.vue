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

const { finalizePendingLocaleChange, t } = useI18n()

const sanity = useSanity()
const settings = useSettings()
const lang = useSanityLang()

const menuParams = reactive({ lang: lang.value })
watch(lang, (v) => {
  menuParams.lang = v
})

const [{ data: menu }, settingsData] = await Promise.all([
  useSanityQuery<MenuData>(MENU_QUERY, menuParams),
  sanity.fetch<SettingsData>(SETTINGS_QUERY, { lang: lang.value }),
])

settings.value = settingsData

const { url: siteUrl, name: siteName, separator } = useSiteConfig()
const { IS_PROD } = useRuntimeConfig().public

useHead({
  titleTemplate: (chunk) => chunk ? `${chunk} ${separator ?? '—'} ${siteName ?? 'BORA CARS'}` : (siteName ?? 'BORA CARS'),
})

useSeoMeta({
  title: () => settings.value?.fallbackTitle ?? 'BORA CARS',
  description: () => settings.value?.seo?.description || t('seo.description'),
  ogImage: () => settings.value?.seo?.image || `${siteUrl}/og-bora-cars.jpg`,
  twitterDescription: () => settings.value?.seo?.description || t('seo.description'),
  twitterImage: () => settings.value?.seo?.image || `${siteUrl}/og-bora-cars.jpg`,
  twitterCard: 'summary_large_image',
})
// og:site_name → auto via site.name (nuxt-seo-utils automaticDefaults)
// og:description, twitter:* → auto-inférés depuis description (automaticOgAndTwitterTags)

useSchemaOrg([
  defineOrganization({
    name: 'BORA CARS',
    url: siteUrl,
    logo: `${siteUrl}/favicon.svg`,
    sameAs: ['https://www.google.com/search?kgmid=/g/11yp0wsnj5'],
  }),
  defineWebSite({
    name: () => settings.value?.fallbackTitle ?? 'BORA CARS',
    description: () => settings.value?.seo?.description || t('seo.description'),
    url: siteUrl,
  }),
])

const i18nHead = useLocaleHead()
useHead(() => ({
  htmlAttrs: i18nHead.value.htmlAttrs,
  link: [...(i18nHead.value.link ?? [])],
  meta: [...(i18nHead.value.meta ?? [])],
}))

const transitionRef = useTemplateRef('transitionRef')

watch(
  () => appStore.menuThemePending,
  (v) => {
    if (!appStore.menuTransitioning)
      appStore.menuTheme = v
  },
)

const pageTransition = {
  mode: 'out-in' as const,
  onLeave: (el: Element, done: () => void) => {
    appStore.menuTransitioning = true
    transitionRef.value?.onLeave(el, done)
  },
  onBeforeEnter: async () => {
    await finalizePendingLocaleChange()
    appStore.menuTheme = appStore.menuThemePending
    appStore.menuTransitioning = false
    transitionRef.value?.onBeforeEnter()
  },
  onEnter: (el: Element, done: () => void) => transitionRef.value?.onEnter(el, done),
}
</script>

<template>
  <div id="app" class="app">
    <AppUnderConstruction v-if="IS_PROD" />

    <template v-else>
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
    </template>
  </div>
</template>

<style lang="scss">
.app {
  height: 100%;
  width: 100%;
  z-index: 1;
  position: relative;

  &-wip {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100vh;
    background-color: var(--c-beige);

    &__title.H2 {
      text-align: center;
    }

    &__logo {
      position: fixed;
      bottom: 24px;
      left: desktop-vw(16px);
      right: desktop-vw(16px);

      @include mobile {
        left: mobile-vw(16px);
        right: mobile-vw(16px);
      }

      .svg-logo {
        width: 100%;
        height: auto;
        aspect-ratio: 1408 / 213;
      }
    }
  }
}
</style>
