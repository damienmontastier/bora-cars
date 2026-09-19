<script setup lang="ts">
import type { CarDetailData, CarWhatsappTemplates } from '~/queries/car'

const props = defineProps<{ car: CarDetailData, whatsappTemplates?: CarWhatsappTemplates }>()

const { t } = useI18n()

const {
  formattedPrix,
  periodLabel,
  duration,
  when,
  durationOptions,
  whenOptions,
  contactTo,
  ctaTrackingExtra,
  hasContact,
} = useCarContact(() => props.car, {
  whatsappTemplates: () => props.whatsappTemplates,
  source: 'car_pricing',
})

const locationAddress = computed(() => {
  const l = props.car.location
  if (!l)
    return ''
  return [l.address, [l.postalCode, l.addressLocality].filter(Boolean).join(' ')].filter(Boolean).join(', ')
})
</script>

<template>
  <aside class="car-pricing">
    <div v-if="formattedPrix" class="car-pricing__price">
      <div class="car-pricing__price-head">
        <TextsH4 tag="p" class="car-pricing__price-amount">
          {{ t('car.pricing.priceFrom', { price: formattedPrix }) }}
        </TextsH4>
        <AtomsCurrencyToggle class="car-pricing__currency" />
      </div>
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
      v-if="hasContact"
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

  &__price-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: desktop-vw(16px);

    @include mobile {
      gap: mobile-vw(12px);
    }
  }

  &__currency {
    flex: 0 0 auto;
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
