<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="app-under-construction">
    <AppAmbientBackground class="app-under-construction__background" />

    <div class="app-under-construction__content">
      <span class="app-under-construction__label">{{ t('underConstruction.label') }}</span>
      <TextsH2 color="beige-100">
        {{ t('underConstruction.title') }}
      </TextsH2>
    </div>

    <div class="app-under-construction__logo">
      <SvgLogo color="orange" />
    </div>
  </div>
</template>

<style lang="scss">
.app-under-construction {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background-color: var(--c-black);
  display: flex;
  align-items: center;
  justify-content: center;

  &__content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: desktop-vw(16px);
    text-align: center;

    @include mobile {
      gap: mobile-vw(16px);
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

  &__logo {
    position: fixed;
    bottom: 24px;
    left: desktop-vw(16px);
    right: desktop-vw(16px);
    z-index: 1;

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
}
</style>
