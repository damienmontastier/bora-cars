import type { MaybeRefOrGetter } from 'vue'
import type { CarDetailData, CarWhatsappTemplates } from '~/queries/car'

const DURATION_KEYS = ['24h', '48h', '3days', '1week', '2weeks', '1month'] as const
const WHEN_KEYS = ['today', 'tomorrow', 'weekend', 'nextweek', 'later'] as const

type DurationKey = typeof DURATION_KEYS[number]
type WhenKey = typeof WHEN_KEYS[number]

function lowerFirst(s: string) {
  return s ? s.charAt(0).toLowerCase() + s.slice(1) : s
}

interface CarContactOptions {
  whatsappTemplates?: MaybeRefOrGetter<CarWhatsappTemplates | undefined>
  source: string
  schedule?: boolean
}

export function useCarContact(car: MaybeRefOrGetter<CarDetailData>, options: CarContactOptions) {
  const settings = useSettings()
  const { t } = useI18n()
  const { url: siteUrl } = useSiteConfig()
  const route = useRoute()
  const analytics = useAnalytics()

  const schedule = options.schedule ?? true

  const carRef = computed(() => toValue(car))

  const isMonthly = computed(() => carRef.value.prixMensuel != null)
  const priceValue = computed(() => carRef.value.prixMensuel ?? carRef.value.prixJournalier ?? null)

  const { formatPrice } = useCurrency()

  const formattedPrix = computed(() => {
    const p = priceValue.value
    return p == null ? null : formatPrice(p)
  })

  const periodLabel = computed(() => isMonthly.value ? t('car.pricing.perMonth') : t('car.pricing.perDay'))

  const duration = ref<DurationKey>('24h')
  const when = ref<WhenKey>('weekend')

  const durationOptions = computed(() =>
    DURATION_KEYS.map(k => ({ value: k, label: t(`car.pricing.duration.options.${k}`) })),
  )
  const whenOptions = computed(() =>
    WHEN_KEYS.map(k => ({ value: k, label: t(`car.pricing.when.options.${k}`) })),
  )

  const durationLabel = computed(() => t(`car.pricing.duration.options.${duration.value}`))
  const whenLabel = computed(() => t(`car.pricing.when.options.${when.value}`))

  const vehicleParams = computed(() => ({
    car_id: carRef.value._id,
    car_brand: carRef.value.marque,
    car_model: carRef.value.modele,
    car_price_per_day: carRef.value.prixJournalier ?? undefined,
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

  const whatsappParams = computed(() => ({
    marque: carRef.value.marque,
    modele: carRef.value.modele,
    prix: formattedPrix.value ?? '',
    periode: periodLabel.value,
    duree: durationLabel.value,
    quand: lowerFirst(whenLabel.value),
    url: `${siteUrl}${route.path}`,
  }))

  const whatsappText = computed(() => {
    const hasPrice = !!formattedPrix.value
    const caseKey = schedule
      ? (hasPrice ? 'withPrice' : 'withoutPrice')
      : (hasPrice ? 'simpleWithPrice' : 'simpleWithoutPrice')
    const template = toValue(options.whatsappTemplates)?.[caseKey]?.trim()
    return template ? fillWhatsappTemplate(template, whatsappParams.value) : ''
  })

  const contactTo = computed(() => whatsappContactTo(settings.value?.contactLink, whatsappText.value))

  const hasContact = computed(() => !!settings.value?.contactLink)

  const ctaTrackingExtra = computed(() => ({
    source: options.source,
    ...vehicleParams.value,
    ...(schedule ? { duration: duration.value, when: when.value } : {}),
    price_text: formattedPrix.value ?? undefined,
  }))

  return {
    isMonthly,
    formattedPrix,
    periodLabel,
    duration,
    when,
    durationOptions,
    whenOptions,
    contactTo,
    ctaTrackingExtra,
    hasContact,
  }
}
