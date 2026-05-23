<script setup lang="ts">
import type { CarDetailData } from '~/queries/car'

const props = defineProps<{ car: CarDetailData }>()

const settings = useSettings()
const { t, locale } = useI18n()
const requestUrl = useRequestURL()

const formattedPrix = computed(() => {
  const p = props.car.prixJournalier
  if (!p)
    return null
  const numberLocale = locale.value === 'fr' ? 'fr-FR' : 'en-GB'
  return new Intl.NumberFormat(numberLocale).format(p)
})

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

const WHATSAPP_HOST_RE = /^(?:[\w-]+\.)*(?:wa\.me|whatsapp\.com)$/i

const contactTo = computed(() => {
  const link = settings.value?.contactLink
  if (!link || link.type !== 'external' || !link.url)
    return link

  let parsed: URL
  try {
    parsed = new URL(link.url)
  }
  catch {
    return link
  }
  if (!WHATSAPP_HOST_RE.test(parsed.hostname))
    return link

  const key = formattedPrix.value
    ? 'car.whatsappMessage.withPrice'
    : 'car.whatsappMessage.withoutPrice'
  const message = t(key, {
    marque: props.car.marque,
    modele: props.car.modele,
    prix: formattedPrix.value ?? '',
    duree: durationLabel.value,
    quand: whenLabel.value,
    url: requestUrl.href,
  })
  parsed.searchParams.set('text', message)
  return parsed.toString()
})
</script>

<template>
  <aside class="car-pricing">
    <div v-if="formattedPrix" class="car-pricing__price">
      <TextsH4 tag="p" class="car-pricing__price-amount">
        {{ t('car.pricing.priceFrom', { price: formattedPrix }) }}
      </TextsH4>
      <TextsP2 class="car-pricing__price-period">
        {{ t('car.pricing.perDay') }}
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
    >
      {{ t('car.pricing.contactCta') }}
    </AtomsCTA>

    <div v-if="car.location" class="car-pricing__location">
      <TextsP1 v-if="car.location.city">
        {{ car.location.city }}
      </TextsP1>
      <TextsP2 v-if="car.location.address" class="car-pricing__location-address">
        {{ car.location.address }}
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
