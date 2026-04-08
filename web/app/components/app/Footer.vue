<script setup>
import { useLenis } from 'lenis/vue'

const lenis = useLenis()

const currentYear = new Date().getFullYear()

function scrollToTop() {
  lenis.value?.scrollTo(0, { duration: 1.2 })
}
</script>

<template>
  <footer class="app-footer">
    <div class="app-footer__logo-section">
      <SvgLogo color="beige-100" class="app-footer__logo" />
    </div>

    <div class="app-footer__divider" />

    <div class="app-footer__content">
      <div class="app-footer__columns">
        <div class="app-footer__column">
          <span class="app-footer__column-title P2">Contact</span>
          <div class="app-footer__column-items">
            <div class="app-footer__cities">
              <span class="app-footer__city CTA-TEXT">Genève</span>
              <span class="app-footer__city-separator" />
              <span class="app-footer__city CTA-TEXT">Paris</span>
            </div>
            <div class="app-footer__contact-info">
              <AtomsCTASecondary theme="white" to="mailto:contact@boracars.com" class="app-footer__link CTA-TEXT">
                contact@boracars.com
              </AtomsCTASecondary>
              <AtomsCTASecondary theme="white" to="tel:+41615282475" class="app-footer__link CTA-TEXT">
                +41 (0)6 15 28 24 75
              </AtomsCTASecondary>
            </div>
          </div>
        </div>

        <div class="app-footer__column">
          <span class="app-footer__column-title P2">Sitemap</span>
          <div class="app-footer__column-items">
            <AtomsCTASecondary theme="white" to="/" class="app-footer__link CTA-TEXT">
              Propriétaire
            </AtomsCTASecondary>
            <AtomsCTASecondary theme="white" to="/" class="app-footer__link CTA-TEXT">
              Professionnel
            </AtomsCTASecondary>
            <AtomsCTASecondary theme="white" to="/" class="app-footer__link CTA-TEXT">
              Particulier
            </AtomsCTASecondary>
            <AtomsCTASecondary theme="white" to="/" class="app-footer__link CTA-TEXT">
              Contact
            </AtomsCTASecondary>
          </div>
        </div>

        <div class="app-footer__column">
          <span class="app-footer__column-title P2">Socials</span>
          <div class="app-footer__column-items">
            <AtomsCTASecondary theme="white" to="https://facebook.com" class="app-footer__link CTA-TEXT">
              Facebook
            </AtomsCTASecondary>
            <AtomsCTASecondary theme="white" to="https://instagram.com" class="app-footer__link CTA-TEXT">
              Instagram
            </AtomsCTASecondary>
            <AtomsCTASecondary theme="white" to="https://linkedin.com" class="app-footer__link CTA-TEXT">
              Linkedin
            </AtomsCTASecondary>
            <AtomsCTASecondary theme="white" to="https://tiktok.com" class="app-footer__link CTA-TEXT">
              TikTok
            </AtomsCTASecondary>
          </div>
        </div>
      </div>
    </div>

    <div class="app-footer__bottom">
      <span class="app-footer__copyright CTA-TEXT">© Bora Cars {{ currentYear }}</span>
      <AtomsCTASecondary theme="white" to="/" class="app-footer__link CTA-TEXT">
        Mentions légales
      </AtomsCTASecondary>
      <AtomsCTASecondary theme="white" class="app-footer__link CTA-TEXT" @click="scrollToTop">
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
