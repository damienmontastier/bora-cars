<script setup lang="ts" generic="T extends string">
// Sélecteur de parcours de la page Contact (DS « Form / ProfileSwitch »).
// Même principe que `AtomsCurrencyToggle` : un groupe de boutons `aria-pressed`,
// les deux options restent visibles avec leur sous-titre.
defineProps<{
  options: { value: T, title: string, subtitle?: string }[]
  ariaLabel?: string
}>()

const model = defineModel<T>({ required: true })
</script>

<template>
  <div class="app-atoms-profile-switch" role="group" :aria-label="ariaLabel">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="app-atoms-profile-switch__option"
      :class="{ 'is-active': model === option.value }"
      :aria-pressed="model === option.value"
      @click="model = option.value"
    >
      <span class="app-atoms-profile-switch__title P1">{{ option.title }}</span>
      <span v-if="option.subtitle" class="app-atoms-profile-switch__subtitle LABEL-TEXT">{{ option.subtitle }}</span>
    </button>
  </div>
</template>

<style lang="scss">
.app-atoms-profile-switch {
  display: flex;
  align-items: stretch;
  gap: 4px;
  width: 100%;
  padding: 4px;
  border: 1px solid var(--c-black-20);
  border-radius: 4px;

  &__option {
    display: flex;
    flex: 1 0 0;
    flex-direction: column;
    justify-content: center;
    gap: desktop-vw(4px);
    min-width: 0;
    padding: desktop-vw(14px) desktop-vw(24px);
    border: 0;
    border-radius: 2px;
    background: transparent;
    cursor: pointer;
    text-align: left;
    transition: background-color 0.25s var(--ease-out-expo);

    @include mobile {
      gap: mobile-vw(4px);
      padding: mobile-vw(12px);
    }

    &:focus-visible {
      outline: 2px solid var(--c-black-100);
      outline-offset: 2px;
    }

    &.is-active {
      background: var(--c-black-100);
      cursor: default;
    }

    @include hover {
      &:not(.is-active):hover {
        background: var(--c-black-5);
      }
    }
  }

  &__title {
    color: var(--c-black-70);
    transition: color 0.25s var(--ease-out-expo);
  }

  &__subtitle {
    color: var(--c-black-40);
    transition: color 0.25s var(--ease-out-expo);
  }

  &__option.is-active &__title {
    color: var(--c-beige-100);
  }

  &__option.is-active &__subtitle {
    color: var(--c-beige-70);
  }
}
</style>
