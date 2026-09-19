<script setup lang="ts">
import type { CarDetailData, CarWhatsappTemplates } from '~/queries/car'

const props = defineProps<{
  car: CarDetailData
  whatsappTemplates?: CarWhatsappTemplates
  heroEl?: HTMLElement | null
  footerEl?: HTMLElement | null
}>()

const { t } = useI18n()
const { isMobile } = useBreakpoint()
const appStore = useAppStore()
const { menuOpen } = toRefs(appStore)

const {
  formattedPrix,
  periodLabel,
  contactTo,
  ctaTrackingExtra,
  hasContact,
} = useCarContact(() => props.car, {
  whatsappTemplates: () => props.whatsappTemplates,
  source: 'car_sticky_bar',
  schedule: false,
})

const heroVisible = ref(true)
const footerVisible = ref(false)

useIntersectionObserver(
  () => props.heroEl,
  ([entry]) => {
    if (entry)
      heroVisible.value = entry.intersectionRatio >= 0.75
  },
  { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] },
)

useIntersectionObserver(
  () => props.footerEl,
  ([entry]) => {
    if (entry)
      footerVisible.value = entry.isIntersecting
  },
)

const visible = computed(() =>
  isMobile.value
  && hasContact.value
  && !!formattedPrix.value
  && !heroVisible.value
  && !footerVisible.value
  && !menuOpen.value,
)
</script>

<template>
  <Transition name="car-sticky-bar">
    <aside v-if="visible" class="car-sticky-bar">
      <div class="car-sticky-bar__price">
        <p class="car-sticky-bar__amount">
          {{ t('car.pricing.priceFrom', { price: formattedPrix }) }}
        </p>
        <p class="car-sticky-bar__period">
          {{ periodLabel }}
        </p>
      </div>

      <UtilsBaseLink
        :to="contactTo"
        class="car-sticky-bar__cta"
        :tracking-extra="ctaTrackingExtra"
      >
        <TextsCTA :selectable="false" color="beige-100">
          {{ t('car.pricing.stickyCta') }}
        </TextsCTA>
      </UtilsBaseLink>
    </aside>
  </Transition>
</template>

<style lang="scss">
.car-sticky-bar {
  display: none;

  @include mobile {
    display: flex;
    align-items: center;
    gap: mobile-vw(8px);
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 90;
    padding: mobile-vw(12px) mobile-vw(8px);
    padding-bottom: calc(#{mobile-vw(12px)} + env(safe-area-inset-bottom));
    background: var(--c-white);
    box-shadow: 0 mobile-vw(-2px) mobile-vw(20px) rgba(12, 12, 10, 0.08);
  }

  &__price {
    flex: 1 0 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: var(--c-black-100);
  }

  &__amount {
    font-family: var(--font-haas-grot-disp-medium);
    font-size: mobile-vw(20px);
    line-height: mobile-vw(26px);
    font-weight: 600;
  }

  &__period {
    font-family: var(--font-haas-grot-disp-regular);
    font-size: mobile-vw(12px);
    line-height: mobile-vw(16px);
    font-weight: 500;
  }

  &__cta {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: mobile-vw(12px) mobile-vw(20px);
    border-radius: 4px;
    background: var(--c-orange);

    .CTA-TEXT {
      white-space: nowrap;
    }
  }
}

.car-sticky-bar-enter-active,
.car-sticky-bar-leave-active {
  transition:
    transform 0.4s var(--ease-out-quint),
    opacity 0.4s var(--ease-out-quint);
}

.car-sticky-bar-enter-from,
.car-sticky-bar-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
