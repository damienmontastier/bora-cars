<script setup lang="ts">
import type { TestimonialItem } from '~/queries/modules'

interface Props {
  items: TestimonialItem[]
  title?: string
  carId?: string
}

const props = defineProps<Props>()

const sortedItems = computed(() => {
  if (!props.carId)
    return props.items
  const current = props.items.filter(item => item.useCar !== false && item.carId === props.carId)
  return current.length ? [...current, ...props.items.filter(item => !current.includes(item))] : props.items
})

function itemLabel(item: TestimonialItem): string {
  if (item.useCar === false)
    return item.subtitle ?? ''
  return item.car ? `${item.car.marque} ${item.car.modele}` : ''
}

const count = computed(() => String(props.items.length).padStart(2, '0'))
</script>

<template>
  <section v-menu-theme="'white'" class="car-testimonials">
    <header class="car-testimonials__header">
      <TextsH3 v-if="title" tag="h2" class="car-testimonials__title">
        {{ title }}
      </TextsH3>
      <TextsP2 :selectable="false" class="car-testimonials__count">
        ({{ count }})
      </TextsP2>
    </header>

    <ul class="car-testimonials__grid">
      <li
        v-for="item in sortedItems"
        :key="item._key"
        class="car-testimonials__card"
        :class="{ 'car-testimonials__card--current': item.useCar !== false && item.carId === carId }"
      >
        <div v-if="item.backgroundImage?.imageUrl" class="car-testimonials__media">
          <ElementsMedia
            :src="item.backgroundImage.imageUrl"
            :alt="item.backgroundImage.imageAlt ?? ''"
            provider="sanity"
            :hotspot="item.backgroundImage.imageHotspot"
            :crop="item.backgroundImage.imageCrop"
            :ratio="16 / 10"
            :overlay="{ variant: 'panel', color: 'orange-100' }"
            sizes="sm:100vw md:32vw lg:32vw xl:32vw"
          />
        </div>

        <blockquote class="car-testimonials__quote">
          <TextsP3 color="black-100">
            &#8220;{{ item.quote }}&#8221;
          </TextsP3>
        </blockquote>

        <footer class="car-testimonials__author">
          <TextsP2 weight="bold" color="black-100">
            {{ item.authorName }}
          </TextsP2>
          <TextsP2 v-if="item.authorRole || itemLabel(item)" weight="regular" color="black-50">
            {{ [item.authorRole, itemLabel(item)].filter(Boolean).join(' — ') }}
          </TextsP2>
        </footer>
      </li>
    </ul>
  </section>
</template>

<style lang="scss">
.car-testimonials {
  display: flex;
  flex-direction: column;
  gap: desktop-vw(32px);
  padding: desktop-vw(80px) desktop-vw(24px);
  background: var(--c-beige-100);

  @include mobile {
    gap: mobile-vw(24px);
    padding: mobile-vw(40px) mobile-vw(16px);
  }

  &__header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: desktop-vw(24px);
    padding-bottom: desktop-vw(24px);
    border-bottom: 2px solid var(--c-black-100);

    @include mobile {
      gap: mobile-vw(16px);
      padding-bottom: mobile-vw(16px);
    }
  }

  &__title {
    max-width: desktop-vw(1100px);
    color: var(--c-black-100);

    @include mobile {
      max-width: none;
    }
  }

  &__count {
    flex-shrink: 0;
    margin-left: auto;
  }

  &__grid {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: desktop-vw(8px);

    @include mobile {
      grid-template-columns: minmax(0, 1fr);
      gap: mobile-vw(8px);
    }
  }

  &__card {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(24px);
    padding: desktop-vw(16px) desktop-vw(16px) desktop-vw(24px);
    background: var(--c-black-5);
    border-radius: desktop-vw(8px);

    @include mobile {
      gap: mobile-vw(20px);
      padding: mobile-vw(12px) mobile-vw(12px) mobile-vw(20px);
      border-radius: mobile-vw(8px);
    }

    &--current {
      background: var(--c-black-10);
    }
  }

  &__media {
    overflow: hidden;
    border-radius: desktop-vw(4px);
    aspect-ratio: 16 / 10;

    @include mobile {
      border-radius: mobile-vw(4px);
    }

    .app-elements-media {
      width: 100%;
      height: 100%;
    }
  }

  &__quote {
    flex: 1 1 auto;
    margin: 0;
    padding: 0 desktop-vw(8px);

    @include mobile {
      padding: 0 mobile-vw(4px);
    }
  }

  &__author {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(2px);
    padding: desktop-vw(16px) desktop-vw(8px) 0;
    border-top: 1px solid var(--c-black-20);

    @include mobile {
      gap: mobile-vw(2px);
      padding: mobile-vw(12px) mobile-vw(4px) 0;
    }
  }
}
</style>
