<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: Object as () => NuxtError,
})

const { t } = useI18n()
const localePath = useLocalePath()

// Code d'erreur affiché en eyebrow ("Erreur 404"). Défaut 404, l'usage premier
// de cette page.
const code = computed(() => String(props.error?.statusCode ?? 404))

// Page d'erreur Nuxt : rendue hors d'`app.vue`, donc un simple <NuxtLink> ne
// purge pas forcément l'état d'erreur. `clearError({ redirect })` est le chemin
// recommandé — il vide l'erreur ET navigue vers l'accueil (route i18n).
function goHome() {
  clearError({ redirect: localePath('index') })
}

useSeoMeta({
  title: () => t('error.title'),
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="app-error">
    <AppAmbientBackground class="app-error__background" />

    <main class="app-error__content">
      <span class="app-error__label">{{ t('error.label') }} {{ code }}</span>

      <TextsH2 tag="h1" :animated="false" color="beige-100" class="app-error__title">
        {{ t('error.title') }}
      </TextsH2>

      <TextsP3 color="beige-60" class="app-error__subtitle">
        {{ t('error.subtitle') }}
      </TextsP3>

      <AtomsCTA theme="orange" :animated="false" class="app-error__cta" @click="goHome">
        {{ t('error.cta') }}
      </AtomsCTA>
    </main>

    <UtilsBaseLink class="app-error__logo" aria-label="BORA CARS" @click="goHome">
      <SvgLogo color="orange" />
    </UtilsBaseLink>

    <DevOnly>
      <div v-if="error" class="app-error__debug">
        <TextsP2 color="beige-100">
          {{ error?.statusCode ?? error?.status }} — {{ error?.message }}
        </TextsP2>
        <pre v-if="error?.stack" class="app-error__stack">{{ error.stack }}</pre>
      </div>
    </DevOnly>
  </div>
</template>

<style lang="scss">
.app-error {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--c-black);
  color: var(--c-beige);
  overflow: hidden;

  &__content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: desktop-vw(16px);
    max-width: desktop-vw(760px);
    padding: desktop-vw(24px);
    text-align: center;

    @include mobile {
      gap: mobile-vw(16px);
      max-width: 100%;
      padding: mobile-vw(24px) mobile-vw(16px);
    }
  }

  &__label {
    font-family: var(--font-haas-grot-disp-medium);
    font-size: desktop-vw(11px);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--c-beige-50);

    @include mobile {
      font-size: mobile-vw(10px);
    }
  }

  &__subtitle {
    max-width: desktop-vw(520px);

    @include mobile {
      max-width: 100%;
    }
  }

  &__cta {
    margin-top: desktop-vw(16px);

    @include mobile {
      margin-top: mobile-vw(8px);
    }
  }

  &__logo {
    position: fixed;
    bottom: 24px;
    left: desktop-vw(16px);
    right: desktop-vw(16px);
    z-index: 1;
    display: block;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;

    @include mobile {
      left: mobile-vw(16px);
      right: mobile-vw(16px);
    }

    .svg-logo {
      width: 100%;
      height: auto;
      aspect-ratio: 1408 / 213;
    }
  }

  &__debug {
    position: fixed;
    left: desktop-vw(24px);
    top: desktop-vw(24px);
    z-index: 2;
    max-width: 40vw;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 16px;
    border: 1px solid var(--c-beige-20);
    border-radius: 4px;
    background: var(--c-beige-5);
  }

  &__stack {
    font-size: 11px;
    line-height: 1.4;
    max-height: 30vh;
    overflow: auto;
    white-space: pre-wrap;
    color: var(--c-beige-60);
  }
}
</style>
