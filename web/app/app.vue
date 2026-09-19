<script setup lang="ts">
import type { LocationData } from '~/queries/locations'
import type { MenuData } from '~/queries/menu'
import type { SettingsData } from '~/queries/settings'
import { useEventBus } from '@vueuse/core'
import { LOCATIONS_QUERY } from '~/queries/locations'
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

const navigating = ref(false)
const menuParams = reactive({ lang: lang.value })
const settingsParams = reactive({ lang: lang.value })
const locationsParams = reactive({ lang: lang.value })
watch(lang, (v) => {
  navigating.value = true
  menuParams.lang = v
  settingsParams.lang = v
  locationsParams.lang = v
})

const [{ data: menuData }, { data: settingsData }, { data: locationsData }] = await Promise.all([
  useSanityQuery<MenuData>(MENU_QUERY, menuParams),
  useSanityQuery<SettingsData>(SETTINGS_QUERY, settingsParams),
  useSanityQuery<LocationData[]>(LOCATIONS_QUERY, locationsParams),
])

const menu = ref<MenuData | null>(menuData.value ?? null)
function commitLocaleData() {
  menu.value = menuData.value ?? null
  settings.value = settingsData.value ?? null
}
watch([menuData, settingsData], () => {
  if (!navigating.value)
    commitLocaleData()
}, { immediate: true })

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

const ogImageUrl = useOgImageUrl()
const globalOgImage = computed(() => ogImageUrl(settings.value?.seo))

useSeoMeta({
  title: () => settings.value?.fallbackTitle ?? 'BORA CARS',
  description: () => (settings.value?.seo?.description || t('seo.description')).trim(),
  ogImage: () => globalOgImage.value,
  ogImageWidth: () => ogImageSize(globalOgImage.value)?.width,
  ogImageHeight: () => ogImageSize(globalOgImage.value)?.height,
})

type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
type Time = `${number}${number}:${number}${number}`

const businessSchema = computed(() => {
  const b = settings.value?.business
  const description = (settings.value?.seo?.description || t('seo.description')).trim()
  const identityId = `${siteUrl}/#identity`

  const organization = defineOrganization({
    '@id': identityId,
    'name': siteName,
    'alternateName': 'Bora Cars',
    'slogan': t('seo.slogan'),
    'url': siteUrl,
    'logo': `${siteUrl}/logo.png`,
    'image': `${siteUrl}/og-bora-cars.jpg`,
    description,
    ...(b?.socialLinks?.length ? { sameAs: b.socialLinks } : {}),
    ...(b?.email ? { email: b.email } : {}),
    ...(b?.email
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            'contactType': 'customer service',
            'email': b.email,
          },
        }
      : {}),
    ...(b?.areaServed?.length ? { areaServed: b.areaServed } : {}),
  })

  const agencies = (locationsData.value ?? []).map((loc, i) => {
    // @ts-expect-error — sous-type valide non listé dans ValidLocalBusinessSubTypes
    return defineLocalBusiness({
      '@id': `${siteUrl}/#agency-${i}`,
      '@type': 'AutoRental',
      'name': [siteName, loc.city].filter(Boolean).join(' — '),
      'url': siteUrl,
      'logo': `${siteUrl}/logo.png`,
      'image': `${siteUrl}/og-bora-cars.jpg`,
      'description': loc.description || description,
      'parentOrganization': { '@id': identityId },
      'currenciesAccepted': 'EUR',
      ...(b?.priceRange ? { priceRange: b.priceRange } : {}),
      ...(loc.phone ? { telephone: loc.phone } : {}),
      ...(b?.email ? { email: b.email } : {}),
      ...(loc.phone || b?.email
        ? {
            contactPoint: {
              '@type': 'ContactPoint',
              'contactType': 'customer service',
              ...(loc.phone ? { telephone: loc.phone } : {}),
              ...(b?.email ? { email: b.email } : {}),
            },
          }
        : {}),
      ...(loc.address || loc.addressLocality || loc.postalCode
        ? {
            address: {
              '@type': 'PostalAddress',
              ...(loc.address ? { streetAddress: loc.address } : {}),
              ...(loc.postalCode ? { postalCode: loc.postalCode } : {}),
              ...(loc.addressLocality ? { addressLocality: loc.addressLocality } : {}),
              'addressCountry': loc.country || 'FR',
            },
          }
        : {}),
      ...(loc.geo?.lat != null && loc.geo?.lng != null
        ? { geo: { '@type': 'GeoCoordinates', latitude: loc.geo.lat, longitude: loc.geo.lng } }
        : {}),
      ...(loc.mapsUrl ? { sameAs: [loc.mapsUrl] } : {}),
      ...(loc.openingHours?.length
        ? {
            openingHoursSpecification: loc.openingHours
              .filter(o => o.days?.length && (o.open24h || (o.opens && o.closes)))
              .map(o => ({
                '@type': 'OpeningHoursSpecification' as const,
                'dayOfWeek': (o.days ?? []) as DayOfWeek[],
                'opens': (o.open24h ? '00:00' : o.opens) as Time,
                'closes': (o.open24h ? '23:59' : o.closes) as Time,
              })),
          }
        : {}),
    })
  })

  return [organization, ...agencies]
})
useSchemaOrg(businessSchema)

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
  if (!window.location.hash)
    window.scrollTo(0, 0)
})

const preloaderMounted = ref(true)
</script>

<template>
  <div id="app" class="app">
    <AppLenis />

    <AppPreloader v-if="preloaderMounted" @gone="preloaderMounted = false" />
    <AppMenu :data="menu" />

    <AppOverlay />

    <AppCookies />

    <AppIdleScreen />

    <AppTransition ref="transitionRef" />

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
