<script setup lang="ts">
import type { CarDetailData, CarWhatsappTemplates } from '~/queries/car'

const props = defineProps<{
  car: CarDetailData
  // Templates WhatsApp éditables (carPage.whatsapp) — la sticky utilise les « simple* ».
  whatsappTemplates?: CarWhatsappTemplates
  // Sections de la page observées pour piloter l'affichage (cf. plus bas).
  heroEl?: HTMLElement | null
  footerEl?: HTMLElement | null
}>()

const { t } = useI18n()
const { isMobile } = useBreakpoint()
const appStore = useAppStore()
const { menuOpen } = toRefs(appStore)

// Mêmes prix / lien WhatsApp que le bloc Pricing (source unique, cf. useCarContact).
// `schedule: false` : pas de sélecteurs durée/quand ici → templates « simple* »
// (sans dates inventées).
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

// Visibilité : cachée tant que la majorité du hero est à l'écran, visible pendant
// les détails, cachée dès que le footer entre à l'écran.
// `heroVisible` démarre à true pour ne pas flasher la barre en haut de page.
const heroVisible = ref(true)
const footerVisible = ref(false)

// On suit le ratio de visibilité du hero : la barre apparaît dès que PLUS de la
// moitié du hero a quitté l'écran (ratio < 0.5), sans attendre sa sortie totale.
// Pas de granularité au seuil unique 0.5 (l'IO ne rappellerait plus en-dessous) :
// d'où le tableau de seuils.
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
  // Barre exclusivement mobile : montée seulement via le v-if (isMobile), mais on
  // garde le garde-fou desktop au cas où.
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

// Entrée / sortie : glissement vers le haut + fondu.
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
