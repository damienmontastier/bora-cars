<script setup lang="ts">
import type { Partner } from '~/queries/settings'

interface Props {
  theme?: 'black' | 'orange'
}

withDefaults(defineProps<Props>(), {
  theme: 'black',
})

const settings = useSettings()
const partners = computed<Partner[]>(() => settings.value?.partners ?? [])

const partnerStyle = (partner: Partner) => ({
  aspectRatio: partner.aspectRatio ? String(partner.aspectRatio) : undefined,
})
</script>

<template>
  <section v-if="partners.length" class="app-elements-partners" :class="`--theme-${theme}`">
    <ElementsMarquee
      :duration="30"
      :repeat="3"
      animated-on-mobile
    >
      <ul class="app-elements-partners__row">
        <li
          v-for="(partner, i) in partners"
          :key="partner.imageUrl ?? i"
          class="app-elements-partners__item"
          :style="partnerStyle(partner)"
        >
          <NuxtImg
            v-if="partner.imageUrl"
            :src="partner.imageUrl"
            :alt="partner.imageAlt ?? ''"
            provider="sanity"
            class="app-elements-partners__logo"
            loading="lazy"
            decoding="async"
          />
        </li>
      </ul>
    </ElementsMarquee>
  </section>
</template>

<style lang="scss">
.app-elements-partners {
  width: 100%;
  background-color: var(--c-black-100);
  padding-block: desktop-vw(60px);
  overflow: hidden;

  *::selection {
    background-color: var(--c-beige-40);
    color: var(--c-beige-100);
  }

  &.--theme-orange {
    background-color: var(--c-orange-100);

    *::selection {
      background-color: var(--c-beige-40);
      color: var(--c-beige-100);
    }
  }

  @include mobile {
    padding-block: mobile-vw(32px);
  }

  .app-elements-marquee__inner {
    align-items: center;
  }

  &__row {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    gap: desktop-vw(112px);
    padding-right: desktop-vw(112px);
    margin: 0;
    padding-left: 0;
    list-style: none;

    @include mobile {
      gap: mobile-vw(56px);
      padding-right: mobile-vw(56px);
    }
  }

  &__item {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    height: desktop-vw(60px);

    @include mobile {
      height: mobile-vw(36px);
    }
  }

  &__logo {
    height: 100%;
    width: 100%;
    object-fit: contain;
    display: block;
    user-select: none;
    -webkit-user-drag: none;
  }
}
</style>
