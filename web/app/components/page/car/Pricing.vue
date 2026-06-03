<script setup lang="ts">
import type { CarDetailData } from '~/queries/car'

const props = defineProps<{ car: CarDetailData, whatsappTemplate?: string }>()

const settings = useSettings()
const { t, locale } = useI18n()
const requestUrl = useRequestURL()

// Adresse affichée = rue + (code postal + ville réelle). Le libellé `city` (ex. « Paris »)
// est affiché séparément comme titre du lieu (cf. template).
const locationAddress = computed(() => {
  const l = props.car.location
  if (!l)
    return ''
  return [l.address, [l.postalCode, l.addressLocality].filter(Boolean).join(' ')].filter(Boolean).join(', ')
})

// Le schéma Sanity garantit qu'un seul des deux prix est renseigné.
// On privilégie le mensuel s'il existe, sinon le journalier.
const isMonthly = computed(() => props.car.prixMensuel != null)
const priceValue = computed(() => props.car.prixMensuel ?? props.car.prixJournalier ?? null)

const formattedPrix = computed(() => {
  const p = priceValue.value
  if (p == null)
    return null
  const numberLocale = locale.value === 'fr' ? 'fr-FR' : 'en-GB'
  return new Intl.NumberFormat(numberLocale).format(p)
})

const periodLabel = computed(() => isMonthly.value ? t('car.pricing.perMonth') : t('car.pricing.perDay'))

const DURATION_KEYS = ['24h', '48h', '3days', '1week', '2weeks', '1month'] as const
const WHEN_KEYS = ['today', 'tomorrow', 'weekend', 'nextweek', 'later'] as const

const duration = ref<typeof DURATION_KEYS[number]>('24h')
const when = ref<typeof WHEN_KEYS[number]>('weekend')

const durationOptions = computed(() =>
  DURATION_KEYS.map(k => ({ value: k, label: t(`car.pricing.duration.options.${k}`) })),
)
const whenOptions = computed(() =>
  WHEN_KEYS.map(k => ({ value: k, label: t(`car.pricing.when.options.${k}`) })),
)

const durationLabel = computed(() => t(`car.pricing.duration.options.${duration.value}`))
const whenLabel = computed(() => t(`car.pricing.when.options.${when.value}`))

const analytics = useAnalytics()

const vehicleParams = computed(() => ({
  car_id: props.car._id,
  car_brand: props.car.marque,
  car_model: props.car.modele,
  car_price_per_day: props.car.prixJournalier ?? undefined,
}))

watch(duration, (v) => {
  analytics.trackRentalConfigChange({
    ...vehicleParams.value,
    field: 'duration',
    duration: v,
    when: when.value,
  })
})

watch(when, (v) => {
  analytics.trackRentalConfigChange({
    ...vehicleParams.value,
    field: 'when',
    duration: duration.value,
    when: v,
  })
})

// 1ʳᵉ lettre en minuscule : les libellés « Quand » sont capitalisés pour le menu
// déroulant, mais doivent s'intégrer en milieu de phrase dans le message.
function lowerFirst(s: string) {
  return s ? s.charAt(0).toLowerCase() + s.slice(1) : s
}

// Variables disponibles dans le template Sanity et dans l'i18n de secours.
// marque / modele : laissés tels quels (valeurs Sanity).
const whatsappParams = computed(() => ({
  marque: props.car.marque,
  modele: props.car.modele,
  prix: formattedPrix.value ?? '',
  periode: periodLabel.value,
  duree: durationLabel.value,
  quand: lowerFirst(whenLabel.value),
  url: requestUrl.href,
}))

// Remplace les {tokens} d'un template par leurs valeurs.
function fillTemplate(template: string, params: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => params[key] ?? '')
}

// Template éditable depuis Sanity (carPage.whatsappMessage) ; sinon, message
// i18n par défaut (car.whatsappMessage.withPrice / withoutPrice).
const whatsappText = computed(() => {
  const template = props.whatsappTemplate?.trim()
  if (template)
    return fillTemplate(template, whatsappParams.value)

  const key = formattedPrix.value
    ? 'car.whatsappMessage.withPrice'
    : 'car.whatsappMessage.withoutPrice'
  return t(key, whatsappParams.value)
})

const contactTo = computed(() => {
  const link = settings.value?.contactLink
  if (!link || link.type !== 'external' || !link.url)
    return link
  // withWhatsappText renvoie l'URL inchangée si ce n'est pas un lien WhatsApp.
  const withText = withWhatsappText(link.url, whatsappText.value)
  return withText === link.url ? link : withText
})

// Extra params merged into BaseLink's auto-tracked click event.
// BaseLink detects the URL kind (WhatsApp / email / phone / external) and emits
// the matching event with this context layered on top.
const ctaTrackingExtra = computed(() => ({
  source: 'car_pricing',
  ...vehicleParams.value,
  duration: duration.value,
  when: when.value,
  price_text: formattedPrix.value ?? undefined,
}))
</script>

<template>
  <aside class="car-pricing">
    <div v-if="formattedPrix" class="car-pricing__price">
      <TextsH4 tag="p" class="car-pricing__price-amount">
        {{ t('car.pricing.priceFrom', { price: formattedPrix }) }}
      </TextsH4>
      <TextsP2 class="car-pricing__price-period">
        {{ periodLabel }}
      </TextsP2>
    </div>

    <div class="car-pricing__selects">
      <AtomsSelect
        v-model="duration"
        :label="t('car.pricing.duration.label')"
        :options="durationOptions"
      />
      <AtomsSelect
        v-model="when"
        :label="t('car.pricing.when.label')"
        :options="whenOptions"
      />
    </div>

    <AtomsCTA
      v-if="settings?.contactLink"
      theme="orange"
      :tiret-after="1"
      class="car-pricing__cta"
      :to="contactTo"
      :tracking-extra="ctaTrackingExtra"
    >
      {{ t('car.pricing.contactCta') }}
    </AtomsCTA>

    <div v-if="car.location" class="car-pricing__location">
      <TextsP1 v-if="car.location.city">
        {{ car.location.city }}
      </TextsP1>
      <TextsP2 v-if="locationAddress" class="car-pricing__location-address">
        {{ locationAddress }}
      </TextsP2>
    </div>
  </aside>
</template>

<style lang="scss">
.car-pricing {
  flex: 0 0 desktop-vw(520px);
  background: var(--c-white);
  border-radius: desktop-vw(16px);
  padding: desktop-vw(40px);
  display: flex;
  flex-direction: column;
  gap: desktop-vw(24px);
  position: sticky;
  top: desktop-vw(40px);

  @include mobile {
    width: 100%;
    flex: 1 0 auto;
    padding: mobile-vw(24px);
    gap: mobile-vw(20px);
    border-radius: mobile-vw(12px);
    position: static;
  }

  &__price {
    display: flex;
    flex-direction: column;
    color: var(--c-black-100);
  }

  &__price-period {
    color: var(--c-black-100);
  }

  &__selects {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(8px);

    @include mobile {
      gap: mobile-vw(6px);
    }
  }

  &__cta {
    width: 100%;
    height: desktop-vw(60px);

    @include mobile {
      height: mobile-vw(52px);
    }
  }

  &__location {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(2px);
    color: var(--c-black-100);
  }

  &__location-address {
    white-space: pre-line;
  }
}
</style>
