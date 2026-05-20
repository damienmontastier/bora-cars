<script lang="ts" setup>
import type { CarDetailData, CarPreFooter } from '~/queries/car'
import { CAR_QUERY } from '~/queries/car'
import { useEventBus } from '@vueuse/core'
import gsap from 'gsap'

interface QueryResult {
  car: CarDetailData | null
  page: { contentPreFooter?: CarPreFooter } | null
}

const route = useRoute()
const lang = useSanityLang()

const params = reactive({ lang: lang.value, uid: route.params.uid as string })
watch(lang, (v) => {
  params.lang = v
})

const { data } = await useSanityQuery<QueryResult>(CAR_QUERY, params)

const car = computed(() => data.value?.car ?? null)
const page = computed(() => data.value?.page ?? null)

if (!car.value) {
  throw createError({ statusCode: 404, statusMessage: 'Voiture introuvable' })
}

const hasDescription = computed(() => Array.isArray(car.value?.description) && car.value!.description.length > 0)

usePageSeo(computed(() => car.value
  ? { title: `${car.value.marque} ${car.value.modele}`, image: car.value.ogImageUrl }
  : undefined))

// Menu CTA is permanently shown on this page (no hero flip). resetMenu on the
// next page transition handles the collapse.
const heroCTABus = useEventBus('hero-cta')
onMounted(() => {
  const menuCtaEl = document.querySelector<HTMLElement>('.app-menu__cta')
  if (!menuCtaEl)
    return
  gsap.set(menuCtaEl, { clearProps: 'display,opacity,visibility,clipPath' })
  heroCTABus.emit('enter:snap')
  gsap.set(menuCtaEl, { opacity: 1 })
})
</script>

<template>
  <main class="page-car">
    <PageCarHero v-menu-theme="'white'" :car="car!" />

    <section v-menu-theme="'white'" class="page-car__details">
      <div class="page-car__left">
        <TextsH2 tag="h1" class="page-car__title">
          {{ car?.marque }}<br>{{ car?.modele }}
        </TextsH2>

        <PageCarDescription v-if="hasDescription" :description="car!.description!" />

        <hr class="page-car__divider">

        <PageCarHighlights :puissance="car?.puissance" :acceleration="car?.acceleration0to100" />

        <hr class="page-car__divider">

        <PageCarSpecs :car="car!" />

        <template v-if="car?.equipements?.length">
          <hr class="page-car__divider">
          <PageCarOptions :equipements="car.equipements" />
        </template>

        <hr class="page-car__divider">
        <PageCarMissingInfo :car="car!" />
      </div>

      <PageCarPricing v-if="car?.prixJournalier || car?.location" :car="car!" />
    </section>

    <ElementsText
      v-if="page?.contentPreFooter"
      :eyebrow="page.contentPreFooter.eyebrow"
      :body="page.contentPreFooter.body"
    />

    <AppFooter />
  </main>
</template>

<style lang="scss">
.page-car {
  display: flex;
  flex-direction: column;

  &__details {
    display: flex;
    gap: desktop-vw(140px);
    padding: desktop-vw(40px) desktop-vw(24px);
    background: var(--c-beige-100);
    align-items: flex-start;

    @include mobile {
      flex-direction: column;
      gap: mobile-vw(40px);
      padding: mobile-vw(32px) mobile-vw(16px);
    }
  }

  &__left {
    flex: 1 0 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: desktop-vw(40px);

    @include mobile {
      gap: mobile-vw(32px);
      width: 100%;
    }
  }

  &__title {
    color: var(--c-black-100);
  }

  &__divider {
    width: 100%;
    height: 0;
    border: 0;
    border-top: 2px solid var(--c-black-100);
    margin: 0;
  }
}
</style>
