<script setup lang="ts">
import type { FooterLegalData } from '~/queries/footer'
import { useLenis } from 'lenis/vue'
import { FOOTER_LEGAL_QUERY } from '~/queries/footer'

// Footer réduit des pages d'atterrissage (ex. /bio) : © + liens légaux + retour en
// haut. Remplace `AppFooter` là où le menu couvre déjà la navigation — les liens
// légaux restent obligatoires (souvent la 1ʳᵉ page d'un visiteur Instagram, celle
// où le bandeau cookies demande son consentement). Composant Figma « FooterMini ».
interface Props {
  // Couleur du fond de la page qui accueille le footer.
  theme?: 'beige' | 'black' | 'orange'
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'beige',
})

const lang = useSanityLang()
const params = reactive({ lang: lang.value })
watch(lang, (v) => {
  params.lang = v
})

const { data: footer } = await useSanityQuery<FooterLegalData>(FOOTER_LEGAL_QUERY, params)

const { t } = useI18n()
const lenis = useLenis()
const currentYear = new Date().getFullYear()

// Fond clair (beige) → contenus noirs ; fonds foncés (noir, orange) → contenus beige.
const isLight = computed(() => props.theme === 'beige')
const contentColor = computed(() => isLight.value ? 'black-100' : 'beige-100')
const copyrightColor = computed(() => isLight.value ? 'black-70' : 'beige-70')
const linkTheme = computed(() => isLight.value ? 'black' : 'white')

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
  <footer class="app-footer-mini" :class="`app-footer-mini--${theme}`">
    <div class="app-footer-mini__brand">
      <SvgLogoMinimal :color="contentColor" class="app-footer-mini__logo" />
      <TextsP2 tag="span" :color="copyrightColor" class="app-footer-mini__copyright">
        {{ t('footer.copyright', { year: currentYear }) }}
      </TextsP2>
    </div>

    <nav v-if="footer?.legalLinks?.length" class="app-footer-mini__legal">
      <AtomsCTASecondary
        v-for="link in footer.legalLinks"
        :key="link._key"
        :to="link"
        :theme="linkTheme"
      >
        {{ link.text }}
      </AtomsCTASecondary>
    </nav>

    <UtilsBaseLink class="app-footer-mini__top" @click="scrollToTop">
      <TextsCTA :selectable="false" :color="contentColor">
        {{ t('footer.backToTop') }}
      </TextsCTA>
      <span class="app-footer-mini__top-icon">
        <SvgIconChevron :color="contentColor" />
      </span>
    </UtilsBaseLink>
  </footer>
</template>

<style lang="scss">
.app-footer-mini {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  grid-template-areas: 'brand legal top';
  align-items: center;
  padding: desktop-vw(20px) desktop-vw(24px);
  border-top: 1px solid var(--c-beige-20);

  @include mobile {
    grid-template-columns: 1fr auto;
    grid-template-areas:
      'legal legal'
      'brand top';
    row-gap: mobile-vw(24px);
    padding: mobile-vw(24px) mobile-vw(16px);
  }

  &--beige {
    background: var(--c-beige);
    border-top-color: var(--c-black-20);
  }

  &--black {
    background: var(--c-black);
    border-top-color: var(--c-beige-20);
  }

  &--orange {
    background: var(--c-orange);
    border-top-color: var(--c-beige-40);
  }

  &__brand {
    grid-area: brand;
    display: flex;
    align-items: center;
    gap: desktop-vw(16px);

    @include mobile {
      gap: mobile-vw(12px);
    }
  }

  &__logo {
    flex-shrink: 0;
    width: desktop-vw(48px);
    height: desktop-vw(48px);

    @include mobile {
      width: mobile-vw(36px);
      height: mobile-vw(36px);
    }
  }

  &__copyright {
    white-space: nowrap;

    @include mobile {
      font-size: mobile-vw(12px);
      line-height: mobile-vw(16px);
    }
  }

  &__legal {
    grid-area: legal;
    display: flex;
    align-items: center;
    gap: desktop-vw(40px);

    @include mobile {
      flex-wrap: wrap;
      gap: mobile-vw(10px) mobile-vw(16px);
    }

    .CTA-TEXT {
      white-space: nowrap;
    }
  }

  &__top {
    grid-area: top;
    justify-self: end;
    display: inline-flex;
    align-items: center;
    gap: desktop-vw(8px);
    cursor: pointer;
    transition: opacity 0.35s var(--ease-out-cubic);

    @include mobile {
      gap: mobile-vw(6px);
    }

    @include hover {
      &:hover {
        opacity: 0.5;
      }
    }
  }

  // Boîte 20px (16px mobile) comme l'icône Figma ; le chevron du projet pointe vers
  // le bas → retourné.
  &__top-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: desktop-vw(20px);
    height: desktop-vw(20px);

    @include mobile {
      width: mobile-vw(16px);
      height: mobile-vw(16px);
    }

    .svg-icon-chevron {
      width: 74%;
      transform: rotate(180deg);
    }
  }
}
</style>
