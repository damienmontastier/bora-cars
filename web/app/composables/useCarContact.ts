import type { MaybeRefOrGetter } from 'vue'
import type { CarDetailData, CarWhatsappTemplates } from '~/queries/car'

const DURATION_KEYS = ['24h', '48h', '3days', '1week', '2weeks', '1month'] as const
const WHEN_KEYS = ['today', 'tomorrow', 'weekend', 'nextweek', 'later'] as const

type DurationKey = typeof DURATION_KEYS[number]
type WhenKey = typeof WHEN_KEYS[number]

// 1ʳᵉ lettre en minuscule : les libellés « Quand » sont capitalisés pour le menu
// déroulant, mais doivent s'intégrer en milieu de phrase dans le message.
function lowerFirst(s: string) {
  return s ? s.charAt(0).toLowerCase() + s.slice(1) : s
}

function fillTemplate(template: string, params: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => params[key] ?? '')
}

interface CarContactOptions {
  // Les 4 templates WhatsApp éditables depuis Sanity (carPage.whatsapp). useCarContact
  // choisit le bon selon `schedule` × présence d'un prix ; fallback i18n si vide.
  whatsappTemplates?: MaybeRefOrGetter<CarWhatsappTemplates | undefined>
  // Étiquette `source` injectée dans l'événement de clic auto-tracké par BaseLink
  // (distingue le bloc Pricing de la barre sticky).
  source: string
  // Le contexte possède-t-il des sélecteurs durée/quand ? Le bloc Pricing : oui.
  // La barre sticky : non → templates « simple* » (sans dates) et on ne remonte pas
  // durée/quand au tracking.
  schedule?: boolean
}

/**
 * Logique partagée de tarif + contact WhatsApp d'une fiche voiture.
 * Mutualisée entre le bloc `Pricing` (avec sélecteurs durée/quand) et la barre
 * sticky mobile `StickyBar` (raccourci de contact sans sélecteurs — elle réutilise
 * simplement les valeurs par défaut). Chaque appelant possède sa propre instance :
 * les watchers analytics « rental_config_change » ne se déclenchent donc que pour
 * le bloc Pricing, là où l'utilisateur peut réellement changer durée/quand.
 */
export function useCarContact(car: MaybeRefOrGetter<CarDetailData>, options: CarContactOptions) {
  const settings = useSettings()
  const { t, locale } = useI18n()
  const requestUrl = useRequestURL()
  const analytics = useAnalytics()

  // Contexte avec sélecteurs de dates (bloc Pricing) ou non (barre sticky).
  const schedule = options.schedule ?? true

  const carRef = computed(() => toValue(car))

  // Le schéma Sanity garantit qu'un seul des deux prix est renseigné.
  // On privilégie le mensuel s'il existe, sinon le journalier.
  const isMonthly = computed(() => carRef.value.prixMensuel != null)
  const priceValue = computed(() => carRef.value.prixMensuel ?? carRef.value.prixJournalier ?? null)

  const formattedPrix = computed(() => {
    const p = priceValue.value
    if (p == null)
      return null
    const numberLocale = locale.value === 'fr' ? 'fr-FR' : 'en-GB'
    return new Intl.NumberFormat(numberLocale).format(p)
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

  // Variables disponibles dans le template Sanity et dans l'i18n de secours.
  // marque / modele : laissés tels quels (valeurs Sanity).
  const whatsappParams = computed(() => ({
    marque: carRef.value.marque,
    modele: carRef.value.modele,
    prix: formattedPrix.value ?? '',
    periode: periodLabel.value,
    duree: durationLabel.value,
    quand: lowerFirst(whenLabel.value),
    url: requestUrl.href,
  }))

  // Message WhatsApp — 1 cas sur 4, depuis les templates éditables carPage.whatsapp.
  // Champ Sanity vide → chaîne vide → lien WhatsApp sans texte pré-rempli
  // (withWhatsappText renvoie l'URL nue quand le message est vide).
  // - bloc tarif (schedule) : withPrice / withoutPrice (peuvent inclure {quand}) ;
  // - barre sticky (sans sélecteurs) : simpleWithPrice / simpleWithoutPrice (sans dates).
  const whatsappText = computed(() => {
    const hasPrice = !!formattedPrix.value
    const caseKey = schedule
      ? (hasPrice ? 'withPrice' : 'withoutPrice')
      : (hasPrice ? 'simpleWithPrice' : 'simpleWithoutPrice')
    const template = toValue(options.whatsappTemplates)?.[caseKey]?.trim()
    return template ? fillTemplate(template, whatsappParams.value) : ''
  })

  const contactTo = computed(() => {
    const link = settings.value?.contactLink
    if (!link || link.type !== 'external' || !link.url)
      return link
    // withWhatsappText renvoie l'URL inchangée si ce n'est pas un lien WhatsApp.
    const withText = withWhatsappText(link.url, whatsappText.value)
    return withText === link.url ? link : withText
  })

  const hasContact = computed(() => !!settings.value?.contactLink)

  // Extra params fusionnés dans l'événement de clic auto-tracké par BaseLink.
  // Durée/quand uniquement là où l'utilisateur les choisit réellement (Pricing).
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
