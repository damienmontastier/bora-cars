<script setup lang="ts">
import type { MenuData } from '~/queries/menu'
import type { SettingsData } from '~/queries/settings'
import { useEventBus } from '@vueuse/core'
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

const settings = useSettings()
const lang = useSanityLang()

// Locale-dependent Sanity data — menu burger label + panel (`menu`), and every
// `settings.contactLink` consumer (hero/menu/brands CTA text) + SEO (`settings`) —
// must NOT swap before the page-transition overlay covers the screen, otherwise the
// still-visible leaving page flips language mid-switch (and widths jump, e.g. the
// burger's "Fermer"/"Close" sizer). So both queries refetch EARLY (params follow
// `lang`, data ready in time) but their data is committed to the live refs only when
// idle / on 'covered'. `navigating` is raised in this same tick — before a cache hit
// could resolve synchronously — and cleared on 'covered' (Transition.vue emits it in
// onLeave's onComplete = overlay fully covers the screen).
const navigating = ref(false)
const menuParams = reactive({ lang: lang.value })
const settingsParams = reactive({ lang: lang.value })
watch(lang, (v) => {
  navigating.value = true
  menuParams.lang = v
  settingsParams.lang = v
})

const [{ data: menuData }, { data: settingsData }] = await Promise.all([
  useSanityQuery<MenuData>(MENU_QUERY, menuParams),
  useSanityQuery<SettingsData>(SETTINGS_QUERY, settingsParams),
])

const menu = ref<MenuData | null>(menuData.value ?? null)
function commitLocaleData() {
  menu.value = menuData.value ?? null
  settings.value = settingsData.value ?? null
}
// Initial load, plus any refetch that only resolves once we're idle again.
watch([menuData, settingsData], () => {
  if (!navigating.value)
    commitLocaleData()
}, { immediate: true })

// During a navigation, swap exactly when the overlay covers the screen, then re-open commits.
const transitionBus = useEventBus('page-transition')
transitionBus.on((event) => {
  if (event === 'covered') {
    commitLocaleData()
    navigating.value = false
  }
})

const { url: siteUrl, name: siteName, separator } = useSiteConfig()
const { IS_PROD } = useRuntimeConfig().public

useHead({
  titleTemplate: chunk => chunk ? `${chunk} ${separator ?? '—'} ${siteName ?? 'BORA CARS'}` : (siteName ?? 'BORA CARS'),
})

useSeoMeta({
  title: () => settings.value?.fallbackTitle ?? 'BORA CARS',
  description: () => (settings.value?.seo?.description || t('seo.description')).trim(),
  ogImage: () => settings.value?.seo?.image || `${siteUrl}/og-bora-cars.jpg`,
  twitterTitle: () => settings.value?.fallbackTitle ?? 'BORA CARS',
  twitterDescription: () => (settings.value?.seo?.description || t('seo.description')).trim(),
  twitterImage: () => settings.value?.seo?.image || `${siteUrl}/og-bora-cars.jpg`,
  twitterCard: 'summary_large_image',
})
// og:site_name → auto via site.name (nuxt-seo-utils automaticDefaults)
// og:description, twitter:* → auto-inférés depuis description (automaticOgAndTwitterTags)

useSchemaOrg([
  defineWebSite({
    name: siteName,
    description: () => (settings.value?.seo?.description || t('seo.description')).trim(),
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
    if (transitionRef.value)
      transitionRef.value.onLeave(el, done)
    else
      done()
  },
  onBeforeEnter: async () => {
    await finalizePendingLocaleChange()
    // Safety net: commit (and re-open commits) before the new page mounts, in case
    // 'covered' didn't fire. Idempotent with the bus.
    commitLocaleData()
    navigating.value = false
    appStore.menuTheme = appStore.menuThemePending
    appStore.menuTransitioning = false
    transitionRef.value?.onBeforeEnter()
  },
  onEnter: (el: Element, done: () => void) => {
    if (transitionRef.value)
      transitionRef.value.onEnter(el, done)
    else
      done()
  },
}

onMounted(() => {
  // Preserve the browser's native hash scroll on refresh; otherwise start at top.
  if (!window.location.hash)
    window.scrollTo(0, 0)
})
</script>

<template>
  <UApp>
    <div id="app" class="app">
      <AppUnderConstruction v-if="IS_PROD" />

      <template v-else>
        <AppLenis />

        <AppPreloader />
        <AppMenu :data="menu" />

        <AppOverlay />

        <AppCookies />

        <AppIdleScreen />

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
  </UApp>
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
