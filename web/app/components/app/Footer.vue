<script setup lang="ts">
import type { FooterData } from '~/queries/footer'
import { useLenis } from 'lenis/vue'
import { FOOTER_QUERY } from '~/queries/footer'

interface Props {
  theme?: 'black' | 'white' | 'orange'
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'orange',
})

const lang = useSanityLang()
const params = reactive({ lang: lang.value })
watch(lang, (v) => {
  params.lang = v
})

const { data: footer } = await useSanityQuery<FooterData>(FOOTER_QUERY, params)

const { t } = useI18n()
const lenis = useLenis()
const currentYear = new Date().getFullYear()

const ctaTheme = computed(() => props.theme === 'white' ? 'black' : 'white')
const logoColor = computed(() => props.theme === 'white' ? 'black-100' : 'beige-100')

const analytics = useAnalytics()
const route = useRoute()

function scrollToTop() {
  const max = document.documentElement.scrollHeight - window.innerHeight
  const depth = max > 0 ? Math.round((window.scrollY / max) * 100) : 0
  analytics.trackBackToTop({ page: route.path, scroll_depth_percent: depth })
  lenis.value?.scrollTo(0, { duration: 1.2 })
}
</script>

<template>
  <footer class="app-footer" :class="`--theme-${theme}`">
    <div class="app-footer__wrapper">
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
                  <AtomsCTASecondary
                    v-if="loc.link"
                    :to="loc.link"
                    :theme="ctaTheme"
                    class="app-footer__city CTA-TEXT"
                  >
                    {{ loc.city }}
                  </AtomsCTASecondary>
                  <span v-else class="app-footer__city CTA-TEXT">{{ loc.city }}</span>
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

          <!-- Legal -->
          <div class="app-footer__column">
            <span class="app-footer__column-title P2">{{ footer?.legalTitle }}</span>
            <div class="app-footer__column-items">
              <AtomsCTASecondary
                v-for="link in footer?.legalLinks"
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

          <!-- Lang -->
          <div class="app-footer__column app-footer__column--lang">
            <div class="app-footer__column-items">
              <AppMenuLangSwitcher class="app-footer__lang-switcher" :theme="ctaTheme" :footer-theme="theme" variant />
            </div>
          </div>
        </div>
      </div>

      <div class="app-footer__bottom">
        <span class="app-footer__copyright CTA-TEXT">{{ t('footer.copyright', { year: currentYear }) }}</span>
        <AtomsCTASecondary :theme="ctaTheme" class="app-footer__link back-to-top CTA-TEXT" @click="scrollToTop">
          {{ t('footer.backToTop') }}
        </AtomsCTASecondary>
      </div>
      <div class="app-footer__divider mobile-divider" />

      <div class="app-footer__bottom-mobile">
        <SvgLogoMinimalFooter color="white" />
      </div>
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
  overflow: hidden;

  *::selection {
    background-color: var(--c-beige-40);
    color: var(--c-beige-100);
  }

  &.--theme-black *::selection {
    background-color: var(--c-orange-40);
    color: var(--c-orange-100);
  }

  &.--theme-white *::selection {
    background-color: var(--c-orange-40);
    color: var(--c-orange-100);
  }

  &__wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

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
    padding: desktop-vw(16px) desktop-vw(24px);
    display: flex;
    align-items: center;
    justify-content: center;

    @include mobile {
      display: none;
    }
  }

  &__logo {
    width: 65%;
    height: auto;
  }

  &__divider {
    width: 100%;
    height: 1px;
    background-color: var(--c-beige-100);
    opacity: 0.3;

    @include mobile {
      &:not(.mobile-divider) {
        display: none;
      }
    }

    &.mobile-divider {
      opacity: 1;
    }
  }

  &__content {
    width: 100%;
    padding: desktop-vw(24px) desktop-vw(24px) desktop-vw(80px);

    @include mobile {
      padding: mobile-vw(24px) mobile-vw(24px);
    }
  }

  &__columns {
    width: 100%;
    display: flex;
    gap: desktop-vw(40px);
    align-items: flex-start;
    position: relative;

    @include mobile {
      flex-direction: column;
      gap: mobile-vw(40px);
    }
  }

  &__lang-switcher {
    @include mobile {
      position: absolute;
      top: 0;
      right: 0;
    }
  }

  &__column {
    flex: 1 0 0;
    display: flex;
    flex-direction: column;
    gap: desktop-vw(40px);
    align-items: flex-start;

    @include mobile {
      gap: mobile-vw(24px);
      width: 100%;
    }

    &--lang {
      flex: 0 0 auto;
    }
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

    @include mobile {
      gap: mobile-vw(40px);
      padding: mobile-vw(12px) mobile-vw(16px);
    }
  }

  &__bottom-mobile {
    display: none;

    @include mobile {
      display: block;
      width: 100%;
      padding: mobile-vw(16px);
      display: flex;
      justify-content: center;
    }

    .svg-logo-minimal {
      width: 100%;
      height: auto;
      aspect-ratio: 361 / 189;

      @include mobile {
        width: mobile-vw(120px);
      }
    }
  }

  &__link.back-to-top {
    /* @include mobile {
      display: none;
    } */
  }

  &__copyright {
    flex: 1 0 0;
    color: var(--c-beige-100);
  }
}
</style>
