<script setup lang="ts">
import { useLenis } from 'lenis/vue'
import { FOOTER_QUERY, type FooterData } from '~/queries/footer'

interface Props {
  theme?: 'black' | 'white' | 'orange'
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'orange',
})

const { data: footer } = await useSanityQuery<FooterData>(FOOTER_QUERY)

const lenis = useLenis()
const currentYear = new Date().getFullYear()

const ctaTheme = computed(() => props.theme === 'white' ? 'black' : 'white')
const logoColor = computed(() => props.theme === 'white' ? 'black-100' : 'beige-100')

function scrollToTop() {
  lenis.value?.scrollTo(0, { duration: 1.2 })
}
</script>

<template>
  <footer class="app-footer" :class="`--theme-${theme}`">
    <div class="app-footer__logo-section">
      <SvgLogo :color="logoColor" class="app-footer__logo" />
    </div>

    <div class="app-footer__divider" />

    <div class="app-footer__content">
      <div class="app-footer__columns">
        <!-- Contact -->
        <div class="app-footer__column">
          <span class="app-footer__column-title P2">{{ footer?.contactTitle }}</span>
          <div class="app-footer__column-items">
            <div v-if="footer?.locations?.length" class="app-footer__cities">
              <template v-for="(loc, i) in footer.locations" :key="loc.city">
                <span class="app-footer__city CTA-TEXT">{{ loc.city }}</span>
                <span v-if="i < footer.locations.length - 1" class="app-footer__city-separator" />
              </template>
            </div>
            <div v-if="footer?.contactLinks?.length" class="app-footer__contact-info">
              <AtomsCTASecondary
                v-for="link in footer.contactLinks"
                :key="link._key"
                :theme="ctaTheme"
                :to="link"
                class="app-footer__link CTA-TEXT"
              >
                {{ link.text }}
              </AtomsCTASecondary>
            </div>
          </div>
        </div>

        <!-- Sitemap -->
        <div class="app-footer__column">
          <span class="app-footer__column-title P2">{{ footer?.sitemapTitle }}</span>
          <div class="app-footer__column-items">
            <AtomsCTASecondary
              v-for="link in footer?.sitemap"
              :key="link._key"
              :theme="ctaTheme"
              :to="link"
              class="app-footer__link CTA-TEXT"
            >
              {{ link.text }}
            </AtomsCTASecondary>
          </div>
        </div>

        <!-- Socials -->
        <div class="app-footer__column">
          <span class="app-footer__column-title P2">{{ footer?.socialsTitle }}</span>
          <div class="app-footer__column-items">
            <AtomsCTASecondary
              v-for="link in footer?.socials"
              :key="link._key"
              :theme="ctaTheme"
              :to="link"
              class="app-footer__link CTA-TEXT"
            >
              {{ link.text }}
            </AtomsCTASecondary>
          </div>
        </div>
      </div>
    </div>

    <div class="app-footer__bottom">
      <span class="app-footer__copyright CTA-TEXT">© Bora Cars {{ currentYear }}</span>
      <AtomsCTASecondary
        v-if="footer?.legalLink?.text"
        :theme="ctaTheme"
        :to="footer.legalLink"
        class="app-footer__link CTA-TEXT"
      >
        {{ footer.legalLink.text }}
      </AtomsCTASecondary>
      <AtomsCTASecondary :theme="ctaTheme" class="app-footer__link CTA-TEXT" @click="scrollToTop">
        Back to top
      </AtomsCTASecondary>
    </div>
  </footer>
</template>

<style lang="scss">
.app-footer {
  width: 100%;
  background-color: var(--c-orange-100);
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  &.--theme-black {
    background-color: var(--c-black-100);
  }

  &.--theme-white {
    background-color: var(--c-beige-100);

    .app-footer__divider {
      background-color: var(--c-black-100);
    }

    .app-footer__column-title {
      color: var(--c-black-70);
    }

    .app-footer__city,
    .app-footer__link,
    .app-footer__copyright {
      color: var(--c-black-100);
    }

    .app-footer__city-separator {
      background-color: var(--c-black-100);
    }
  }

  &__logo-section {
    width: 100%;
    padding: desktop-vw(16px);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  &__logo {
    width: desktop-vw(792px);
    height: auto;
    aspect-ratio: 1408 / 214;
    flex-shrink: 0;
  }

  &__divider {
    width: 100%;
    height: 1px;
    background-color: var(--c-beige-100);
    opacity: 0.3;
  }

  &__content {
    width: 100%;
    padding: desktop-vw(24px) desktop-vw(24px) desktop-vw(80px);
    overflow: hidden;
  }

  &__columns {
    width: 100%;
    display: flex;
    gap: desktop-vw(40px);
    align-items: flex-start;
  }

  &__column {
    flex: 1 0 0;
    display: flex;
    flex-direction: column;
    gap: desktop-vw(40px);
    align-items: flex-start;
  }

  &__column-title {
    color: var(--c-beige-70);
    width: 100%;
  }

  &__column-items {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: desktop-vw(16px);
  }

  &__cities {
    display: flex;
    align-items: center;
    gap: desktop-vw(12px);
  }

  &__city {
    color: var(--c-beige-100);
  }

  &__city-separator {
    display: block;
    width: desktop-vw(28px);
    height: 1px;
    background-color: var(--c-beige-100);
    flex-shrink: 0;
  }

  &__contact-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  &__link {
    color: var(--c-beige-100);
    text-decoration: none;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  &__bottom {
    width: 100%;
    display: flex;
    align-items: center;
    gap: desktop-vw(40px);
    padding: desktop-vw(12px) desktop-vw(16px);
    overflow: hidden;
  }

  &__copyright {
    flex: 1 0 0;
    color: var(--c-beige-100);
  }
}
</style>
