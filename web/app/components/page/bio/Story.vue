<script setup lang="ts">
import type { CatalogueCar } from '~/queries/catalogue'

interface Props {
  car: CatalogueCar
  index: number
  total: number
  whatsappTemplate?: string
}

const { car, index, total, whatsappTemplate } = defineProps<Props>()

const { t } = useI18n()
const settings = useSettings()
const localePath = useLocalePath()
const { url: siteUrl } = useSiteConfig()
const analytics = useAnalytics()

const { formatPrice } = useCurrency()

const marque = computed(() => car.marque?.trim() ?? '')
const isLatest = computed(() => index === 0)

const pad = (n: number) => String(n).padStart(2, '0')
const counter = computed(() => `${pad(index + 1)} / ${pad(total)}`)

const isMonthly = computed(() => car.prixMensuel != null)
const formattedPrice = computed(() => {
  const value = car.prixMensuel ?? car.prixJournalier ?? null
  return value == null ? null : formatPrice(value)
})

const eyebrow = computed(() => {
  const price = formattedPrice.value
  if (!price)
    return marque.value
  const priceLabel = isMonthly.value
    ? t('bio.story.priceMonthly', { price })
    : t('bio.story.priceDaily', { price })
  return `${marque.value} · ${priceLabel}`
})

const carRoute = computed(() => car.slug ? { name: 'car-uid', params: { uid: car.slug } } : undefined)

const whatsappText = computed(() => {
  const template = whatsappTemplate?.trim()
  if (!template)
    return ''
  return fillWhatsappTemplate(template, {
    marque: marque.value,
    modele: car.modele,
    prix: formattedPrice.value ?? '',
    periode: isMonthly.value ? t('car.pricing.perMonth') : t('car.pricing.perDay'),
    url: carRoute.value ? `${siteUrl}${localePath(carRoute.value)}` : '',
  })
})

const whatsappTo = computed(() => whatsappContactTo(settings.value?.contactLink, whatsappText.value))

const vehicleParams = computed(() => ({
  car_id: car._id,
  car_slug: car.slug ?? undefined,
  car_brand: marque.value,
  car_model: car.modele,
  position: index,
}))

const whatsappTrackingExtra = computed(() => ({
  source: 'bio_story',
  ...vehicleParams.value,
  car_price_per_day: car.prixJournalier ?? undefined,
  price_text: formattedPrice.value ?? undefined,
}))

function onCarClick() {
  analytics.trackCatalogueCarClick({ source: 'bio', ...vehicleParams.value })
}
</script>

<template>
  <article class="page-bio-story">
    <div class="page-bio-story__media">
      <ElementsMedia
        v-if="car.imageUrl"
        :src="car.imageUrl"
        :alt="`${marque} ${car.modele}`"
        provider="sanity"
        :hotspot="car.imageHotspot"
        :crop="car.imageCrop"
        :modifiers="{ quality: 95 }"
        :lazy="index > 0"
        :preload="index === 0 ? { fetchPriority: 'high' } : false"
        :overlay="{ variant: 'panel', color: 'orange-100' }"
        sizes="96vw sm:33vw md:33vw lg:33vw xl:33vw xxl:33vw"
      />
    </div>

    <div class="page-bio-story__top">
      <TextsLabel color="beige-100">
        {{ counter }}
      </TextsLabel>
      <TextsLabel v-if="isLatest" tag="span" color="beige-100" class="page-bio-story__badge">
        {{ t('bio.story.latestPost') }}
      </TextsLabel>
    </div>

    <div class="page-bio-story__bottom">
      <div class="page-bio-story__info">
        <TextsLabel color="beige-100">
          {{ eyebrow }}
        </TextsLabel>
        <TextsH2 color="beige-100" :animated="false" class="page-bio-story__model">
          {{ car.modele }}
        </TextsH2>
      </div>

      <div class="page-bio-story__actions">
        <UtilsBaseLink
          v-if="whatsappTo"
          :to="whatsappTo"
          class="page-bio-story__cta page-bio-story__cta--whatsapp"
          :tracking-extra="whatsappTrackingExtra"
        >
          <span class="page-bio-story__cta-icon">
            <SvgIconWhatsapp color="beige-100" />
          </span>
          <TextsCTA :selectable="false" color="beige-100">
            {{ t('bio.story.whatsapp') }}
          </TextsCTA>
        </UtilsBaseLink>

        <UtilsBaseLink
          v-if="carRoute"
          :to="carRoute"
          class="page-bio-story__cta page-bio-story__cta--car"
          @click="onCarClick"
        >
          <TextsCTA :selectable="false" color="beige-100">
            {{ t('bio.story.seeCar') }}
          </TextsCTA>
        </UtilsBaseLink>
      </div>
    </div>
  </article>
</template>

<style lang="scss">
.page-bio-story {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  aspect-ratio: 469 / 704;
  padding: desktop-vw(24px);
  overflow: hidden;

  @include mobile {
    aspect-ratio: 377 / 580;
    padding: mobile-vw(16px);
  }

  &__media {
    position: absolute;
    inset: 0;
    background: var(--c-black-20);

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: linear-gradient(
        180deg,
        var(--c-black-50) 0%,
        transparent 20%,
        transparent 42%,
        rgba(12, 12, 10, 0.78) 72%,
        rgba(12, 12, 10, 0.95) 100%
      );
    }
  }

  &__top,
  &__bottom {
    position: relative;
  }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__badge {
    padding: desktop-vw(8px) desktop-vw(12px);
    border-radius: 4px;
    background: var(--c-orange);

    @include mobile {
      padding: mobile-vw(6px) mobile-vw(10px);
    }
  }

  &__bottom {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(24px);

    @include mobile {
      gap: mobile-vw(16px);
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(8px);

    @include mobile {
      gap: mobile-vw(6px);
    }
  }

  &__model {
    @include mobile {
      font-size: mobile-vw(64px);
      line-height: mobile-vw(64px);
    }
  }

  &__actions {
    display: flex;
    gap: desktop-vw(8px);

    @include mobile {
      gap: mobile-vw(8px);
    }
  }

  &__cta {
    flex: 1 0 0;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: desktop-vw(12px);
    height: desktop-vw(60px);
    padding: 0 desktop-vw(24px);
    border-radius: 4px;
    transition: opacity 0.35s var(--ease-out-cubic);

    @include mobile {
      gap: mobile-vw(10px);
      height: mobile-vw(48px);
      padding: 0 mobile-vw(20px);
    }

    @include hover {
      &:hover {
        opacity: 0.8;
      }
    }

    .CTA-TEXT {
      white-space: nowrap;
    }

    &--whatsapp {
      background: var(--c-orange);
    }

    &--car {
      border: 1px solid var(--c-beige-40);
    }
  }

  &__cta-icon {
    flex-shrink: 0;
    width: desktop-vw(20px);
    height: desktop-vw(20px);

    @include mobile {
      width: mobile-vw(16px);
      height: mobile-vw(16px);
    }
  }
}
</style>
