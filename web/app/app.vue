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
// Lieux (= agences) : n'alimentent que le JSON-LD (invisible) → pas de double-buffer
// nécessaire, on laisse leurs params suivre la langue directement.
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

// Title GLOBAL : `{texte} — BORA CARS` (mot-clé descriptif devant → poids SEO + résiste
// mieux à la troncature). L'accueil surcharge ce template pour mener par la marque
// (`BORA CARS — {texte}`) directement dans `pages/index.vue` via useHead().
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

// Identité schema.org = la MARQUE (Organization) + un node AutoRental PAR AGENCE.
// Modèle multi-établissements : chaque agence est un LocalBusiness/AutoRental distinct
// (adresse / géo / téléphone / horaires propres), relié à la marque par `parentOrganization`.
// Les nodes WebSite / WebPage — et leur volet i18n (inLanguage + translationOfWork /
// workTranslation par locale) — sont générés AUTOMATIQUEMENT par nuxt-schema-org et se
// rattachent à la marque par @id (#identity). Données éditables dans Sanity (settings) ;
// `schemaOrg.reactive` resync le JSON-LD au changement de langue côté client. À l'SSR,
// `settings` est déjà résolu → JSON-LD correct dans le HTML prérendu. `useSchemaOrg`
// accepte un computed (resolve par @id au rendu).
// @unhead n'exporte pas DayOfWeek/Time (types internes) → on les redéclare pour typer
// proprement les horaires venant de Sanity (jours en anglais + "HH:MM" validés au Studio).
type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
type Time = `${number}${number}:${number}${number}`

const businessSchema = computed(() => {
  const b = settings.value?.business
  const description = (settings.value?.seo?.description || t('seo.description')).trim()
  // @id explicite et partagé : garantit que `parentOrganization` des agences pointe
  // exactement sur l'identité (resolveAsGraphKey('#identity') la reconnaît comme identity).
  const identityId = `${siteUrl}/#identity`

  // La marque (parent de toutes les agences). `sameAs` = réseaux sociaux de marque
  // uniquement — les liens Google (kgmid) sont par-AGENCE (sur le `sameAs` du node AutoRental,
  // car chaque fiche Google correspond à un établissement, pas à la marque).
  const organization = defineOrganization({
    '@id': identityId,
    'name': siteName,
    // Variante de casse usuelle ("Bora Cars") : aide Google à rattacher les
    // requêtes de marque à l'entité plutôt qu'au modèle VW/Maserati « Bora ».
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

  // Une agence = un document `location` (Lieu) → un node AutoRental rattaché à la marque.
  const agencies = (locationsData.value ?? []).map((loc, i) => {
    return defineLocalBusiness({
      '@id': `${siteUrl}/#agency-${i}`,
      // AutoRental = sous-type schema.org de AutomotiveBusiness (2e niveau), reconnu par
      // Google mais absent de l'union TS de @unhead (qui s'arrête au 1er niveau).
      // @ts-expect-error — sous-type valide non listé dans ValidLocalBusinessSubTypes
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
      // Adresse postale RÉELLE (≠ le libellé `city`, ex. label « Paris » / ville « Neuilly »).
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
            // 24h/24 → 00:00–23:59 (convention schema.org pour une ouverture continue).
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
      <!-- <AppUnderConstruction v-if="IS_PROD" /> -->

      <!-- <template v-else> -->
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
      <!-- </template> -->
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
