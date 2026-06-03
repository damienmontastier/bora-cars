<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: Object as () => NuxtError,
})

const { t } = useI18n()
const localePath = useLocalePath()

// Code d'erreur → chiffres. On colore le chiffre central en orange (404 → "0",
// 500 → "0", etc.). Défaut 404, l'usage premier de cette page.
const code = computed(() => String(props.error?.statusCode ?? 404))
const digits = computed(() => code.value.split(''))
const accentIndex = computed(() => Math.floor(digits.value.length / 2))

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
    <header class="app-error__header">
      <UtilsBaseLink class="app-error__logo" aria-label="BORA CARS" @click="goHome">
        <SvgLogo color="beige-100" />
      </UtilsBaseLink>
    </header>

    <main class="app-error__main">
      <p class="app-error__code" aria-hidden="true">
        <span
          v-for="(digit, i) in digits"
          :key="i"
          class="app-error__digit"
          :class="{ 'app-error__digit--accent': i === accentIndex }"
        >{{ digit }}</span>
      </p>

      <div class="app-error__content">
        <TextsH2 tag="h1" :animated="false" color="beige-100" class="app-error__title">
          {{ t('error.title') }}
        </TextsH2>
        <TextsP3 color="beige-60" class="app-error__subtitle">
          {{ t('error.subtitle') }}
        </TextsP3>
        <AtomsCTA theme="orange" :animated="false" class="app-error__cta" @click="goHome">
          {{ t('error.cta') }}
        </AtomsCTA>
      </div>
    </main>

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
  flex-direction: column;
  background-color: var(--c-black);
  color: var(--c-beige);
  overflow-y: auto;

  &__header {
    display: flex;
    justify-content: center;
    padding: desktop-vw(24px);

    @include mobile {
      padding: mobile-vw(16px);
    }
  }

  &__logo {
    display: block;
    width: desktop-vw(220px);
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;

    @include mobile {
      width: mobile-vw(150px);
    }

    .svg-logo {
      width: 100%;
      height: auto;
      aspect-ratio: 1408 / 214;
    }
  }

  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: desktop-vw(48px);
    padding: desktop-vw(24px);
    text-align: center;

    @include mobile {
      gap: mobile-vw(40px);
      padding: mobile-vw(24px) mobile-vw(16px);
    }
  }

  &__code {
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-haas-grot-disp-medium);
    font-weight: 600;
    letter-spacing: -0.03em;
    line-height: 0.8;
  }

  &__digit {
    font-size: desktop-vw(380px);
    line-height: 0.8;
    color: var(--c-beige);

    @include mobile {
      font-size: mobile-vw(110px);
    }

    &--accent {
      color: var(--c-orange);
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: desktop-vw(20px);
    max-width: desktop-vw(760px);

    @include mobile {
      gap: mobile-vw(16px);
      max-width: 100%;
    }
  }

  &__subtitle {
    color: var(--c-beige-60);
  }

  &__cta {
    margin-top: desktop-vw(16px);

    @include mobile {
      margin-top: mobile-vw(8px);
    }
  }

  &__debug {
    position: fixed;
    left: desktop-vw(24px);
    bottom: desktop-vw(24px);
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
