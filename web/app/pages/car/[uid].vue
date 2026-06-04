<script lang="ts" setup>
import type { CarDetailData, CarPreFooter, CarWhatsappTemplates } from '~/queries/car'
import { CAR_QUERY } from '~/queries/car'

interface QueryResult {
  car: CarDetailData | null
  page: { contentPreFooter?: CarPreFooter, whatsapp?: CarWhatsappTemplates } | null
}

const route = useRoute()
const lang = useSanityLang()
const { t } = useI18n()

const params = reactive({ lang: lang.value, uid: route.params.uid as string })
watch(lang, (v) => {
  params.lang = v
})

const { data } = await useSanityQuery<QueryResult>(CAR_QUERY, params)

const car = computed(() => data.value?.car ?? null)
const page = computed(() => data.value?.page ?? null)

if (!car.value) {
  throw createError({ statusCode: 404, statusMessage: t('car.notFound') })
}

const hasDescription = computed(() => Array.isArray(car.value?.description) && car.value!.description.length > 0)

usePageSeo(computed(() => car.value
  ? { title: `${car.value.marque} ${car.value.modele}`, image: car.value.ogImageUrl }
  : undefined))

// ─── schema.org fiche voiture : Product (location) + fil d'Ariane ───
// PAS de type `Car`/`Vehicle` : le rich result Google « Vehicle listing » est réservé aux
// véhicules À VENDRE (VIN/kilométrage requis) ; le « Product snippet » aux produits
// ACHETABLES. Pour de la LOCATION, aucun des deux ne s'applique → on décrit l'entité en
// `Product` (warning-free), specs en `additionalProperty` (valides sur Product, pas de
// « unknown property »), et l'`Offer` en `businessFunction: LeaseOut` + `UnitPriceSpecification`
// = tarif PAR jour/mois (location, pas vente). Le WebPage auto reçoit `breadcrumb` +
// `mainEntity`. reactive:false → rendu SSR/prérendu.
const localePath = useLocalePath()
const { url: siteUrl } = useSiteConfig()
const abs = (p: string) => `${siteUrl}${p}`

useSchemaOrg(computed(() => {
  const c = car.value
  if (!c)
    return []

  const images = [c.ogImageUrl].filter((u): u is string => !!u)
  const plainDescription = (c.description ?? [])
    .map(block => (block.children ?? []).map((child: { text?: string }) => child.text ?? '').join(''))
    .join(' ')
    .trim()

  // Caractéristiques → additionalProperty, libellés/valeurs localisés (clés i18n existantes).
  const specs: { '@type': 'PropertyValue', 'name': string, 'value': string | number, 'unitText'?: string }[] = []
  if (c.carburant)
    specs.push({ '@type': 'PropertyValue', 'name': t('car.specs.labels.carburant'), 'value': t(`car.specs.carburant.${c.carburant}`) })
  if (c.boiteVitesse)
    specs.push({ '@type': 'PropertyValue', 'name': t('car.specs.labels.boiteVitesse'), 'value': t(`car.specs.boite.${c.boiteVitesse}`) })
  if (c.nombrePlaces)
    specs.push({ '@type': 'PropertyValue', 'name': t('car.specs.labels.nombrePlaces'), 'value': c.nombrePlaces })
  if (c.nombrePortes)
    specs.push({ '@type': 'PropertyValue', 'name': t('car.specs.labels.nombrePortes'), 'value': c.nombrePortes })
  if (c.annee)
    specs.push({ '@type': 'PropertyValue', 'name': t('car.specs.labels.annee'), 'value': c.annee })
  if (c.puissance)
    specs.push({ '@type': 'PropertyValue', 'name': 'Puissance', 'value': c.puissance, 'unitText': t('car.highlights.powerUnit') })

  // Le schéma Sanity garantit qu'un seul des deux prix est renseigné.
  const price = c.prixJournalier ?? c.prixMensuel ?? null
  const unitCode = c.prixJournalier != null ? 'DAY' : 'MON'
  const carPath = localePath({ name: 'car-uid', params: { uid: c.slug } })

  // `businessFunction`/`unitCode` ne sont pas dans le type Offer de @unhead → cast unique.
  const product = defineProduct({
    'name': `${c.marque} ${c.modele}`,
    'sku': c.slug,
    'brand': { '@type': 'Brand', 'name': c.marque },
    ...(images.length ? { image: images } : {}),
    ...(plainDescription ? { description: plainDescription } : {}),
    ...(c.gamme ? { category: t(`car.specs.gamme.${c.gamme}`) } : {}),
    ...(specs.length ? { additionalProperty: specs } : {}),
    ...(price != null
      ? {
          offers: {
            '@type': 'Offer',
            'priceCurrency': 'EUR',
            'businessFunction': 'http://purl.org/goodrelations/v1#LeaseOut',
            'availability': 'https://schema.org/InStock',
            'url': abs(carPath),
            'priceSpecification': {
              '@type': 'UnitPriceSpecification',
              'price': price,
              'priceCurrency': 'EUR',
              'unitCode': unitCode,
            },
          },
        }
      : {}),
  } as unknown as Parameters<typeof defineProduct>[0])

  return [
    product,
    defineBreadcrumb({
      itemListElement: [
        { name: t('breadcrumb.home'), item: abs(localePath({ name: 'index' })) },
        { name: t('breadcrumb.catalogue'), item: abs(localePath({ name: 'catalogue' })) },
        { name: `${c.marque} ${c.modele}`, item: abs(carPath) },
      ],
    }),
  ]
}))

useMenuCtaSnap()

// Sections observées par la barre sticky mobile : cachée sur le hero, visible
// pendant les détails, cachée dès que le footer entre à l'écran.
const heroRef = useTemplateRef<{ $el: HTMLElement }>('heroRef')
const footerRef = useTemplateRef<{ $el: HTMLElement }>('footerRef')
const heroEl = computed(() => heroRef.value?.$el ?? null)
const footerEl = computed(() => footerRef.value?.$el ?? null)

const analytics = useAnalytics()
onMounted(() => {
  if (!car.value)
    return
  analytics.trackVehicleView({
    car_id: car.value._id,
    car_slug: route.params.uid as string,
    car_brand: car.value.marque,
    car_model: car.value.modele,
    car_price_per_day: car.value.prixJournalier ?? undefined,
    car_category: car.value.gamme ?? undefined,
  })
})
</script>

<template>
  <main class="page-car">
    <PageCarHero ref="heroRef" v-menu-theme="'white'" :car="car!" />

    <section v-menu-theme="'white'" class="page-car__details">
      <div class="page-car__left">
        <TextsH2 :animated="false" tag="h1" class="page-car__title">
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
        <PageCarRentalInfo :car="car!" />
      </div>

      <PageCarPricing
        v-if="car?.prixJournalier || car?.prixMensuel || car?.location"
        :car="car!"
        :whatsapp-templates="page?.whatsapp"
      />
    </section>

    <ElementsText
      v-if="page?.contentPreFooter"
      :eyebrow="page.contentPreFooter.eyebrow"
      :body="page.contentPreFooter.body"
    />

    <AppFooter ref="footerRef" />

    <PageCarStickyBar
      v-if="car?.prixJournalier || car?.prixMensuel"
      :car="car!"
      :whatsapp-templates="page?.whatsapp"
      :hero-el="heroEl"
      :footer-el="footerEl"
    />
  </main>
</template>

<style lang="scss">
.page-car {
  display: flex;
  flex-direction: column;

  &__details {
    display: flex;
    gap: desktop-vw(160px);
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
