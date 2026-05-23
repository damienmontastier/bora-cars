<script setup lang="ts">
interface Partner {
  src: string
  alt: string
  modifier: string
}

const partners: Partner[] = [
  { src: '/img/partners/mariages.png', alt: 'Mariages.net', modifier: 'mariages' },
  { src: '/img/partners/as.png', alt: 'AS', modifier: 'as' },
  { src: '/img/partners/rentabl.png', alt: 'Rentabl.', modifier: 'rentabl' },
  { src: '/img/partners/needgt.png', alt: 'Need GT', modifier: 'needgt' },
  { src: '/img/partners/wonderent.png', alt: 'WondeRent', modifier: 'wonderent' },
  { src: '/img/partners/gtzelite.png', alt: 'GTZ Elite', modifier: 'gtzelite' },
]
</script>

<template>
  <section class="app-elements-partners">
    <ElementsMarquee
      :duration="30"
      :repeat="3"
      animated-on-mobile
    >
      <ul class="app-elements-partners__row">
        <li
          v-for="partner in partners"
          :key="partner.modifier"
          class="app-elements-partners__item"
          :class="`app-elements-partners__item--${partner.modifier}`"
        >
          <img
            :src="partner.src"
            :alt="partner.alt"
            class="app-elements-partners__logo"
            loading="lazy"
            decoding="async"
          >
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

    &--mariages {
      height: desktop-vw(48px);
      @include mobile {
        height: mobile-vw(28px);
      }
    }
    &--as {
      height: desktop-vw(66px);
      @include mobile {
        height: mobile-vw(40px);
      }
    }
    &--rentabl {
      height: desktop-vw(42px);
      @include mobile {
        height: mobile-vw(24px);
      }
    }
    &--needgt {
      height: desktop-vw(60px);
      @include mobile {
        height: mobile-vw(36px);
      }
    }
    &--wonderent {
      height: desktop-vw(60px);
      @include mobile {
        height: mobile-vw(36px);
      }
    }
    &--gtzelite {
      height: desktop-vw(84px);
      @include mobile {
        height: mobile-vw(48px);
      }
    }
  }

  &__logo {
    height: 100%;
    width: auto;
    object-fit: contain;
    display: block;
    user-select: none;
    -webkit-user-drag: none;
  }
}
</style>
