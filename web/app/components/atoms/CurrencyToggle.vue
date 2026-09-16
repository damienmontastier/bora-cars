<script setup lang="ts">
import type { CurrencyCode } from '~/composables/useCurrency'

// Sélecteur de devise d'affichage (cf. useCurrency) : segmented control à deux
// options plutôt qu'un `AtomsSwitch`, parce qu'un interrupteur binaire n'exprime
// pas laquelle des deux devises est active — ici les deux libellés sont visibles.
const OPTIONS: readonly CurrencyCode[] = ['EUR', 'CHF']

const { t } = useI18n()
const { currency, chfAvailable, setCurrency } = useCurrency()
</script>

<template>
  <div
    v-if="chfAvailable"
    class="app-atoms-currency-toggle"
    role="group"
    :aria-label="t('car.pricing.currency.label')"
  >
    <button
      v-for="code in OPTIONS"
      :key="code"
      type="button"
      class="app-atoms-currency-toggle__option LABEL-TEXT"
      :class="{ 'is-active': currency === code }"
      :aria-pressed="currency === code"
      :aria-label="t(`car.pricing.currency.${code.toLowerCase()}`)"
      @click="setCurrency(code)"
    >
      {{ code }}
    </button>
  </div>
</template>

<style lang="scss">
.app-atoms-currency-toggle {
  display: inline-flex;
  align-items: stretch;
  padding: desktop-vw(2px);
  gap: desktop-vw(2px);
  border: 1px solid var(--c-black-15);
  border-radius: 999px;

  @include mobile {
    padding: mobile-vw(2px);
    gap: mobile-vw(2px);
  }

  &__option {
    padding: desktop-vw(6px) desktop-vw(12px);
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: var(--c-black-40);
    cursor: pointer;
    transition:
      background-color 0.25s var(--ease-out-expo),
      color 0.25s var(--ease-out-expo);

    @include mobile {
      padding: mobile-vw(6px) mobile-vw(10px);
    }

    &.is-active {
      background: var(--c-black-100);
      color: var(--c-beige-100);
    }

    &:not(.is-active):hover {
      color: var(--c-black-100);
    }
  }
}
</style>
