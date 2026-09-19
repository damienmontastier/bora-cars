<script setup lang="ts">
// Encart d'aide du formulaire (DS « Form / HelpNote ») : `info` (fond Orange/10,
// filet Orange/40) ou `error` (filet rouge, texte rouge). Le repère « (i) » / « (!) »
// est décoratif.
interface Props {
  tone?: 'info' | 'error'
}

withDefaults(defineProps<Props>(), {
  tone: 'info',
})
</script>

<template>
  <div class="app-atoms-help-note" :class="`app-atoms-help-note--${tone}`">
    <span class="app-atoms-help-note__marker P2 bold-text" aria-hidden="true">{{ tone === 'error' ? '(!)' : '(i)' }}</span>
    <span class="app-atoms-help-note__text P2 regular-text"><slot /></span>
  </div>
</template>

<style lang="scss">
.app-atoms-help-note {
  display: flex;
  align-items: flex-start;
  gap: desktop-vw(12px);
  width: 100%;
  padding: desktop-vw(16px) desktop-vw(20px);
  border: 1px solid var(--c-orange-40);
  border-radius: 4px;
  background: var(--c-orange-10);

  @include mobile {
    gap: mobile-vw(10px);
    padding: mobile-vw(12px) mobile-vw(14px);
  }

  &__marker {
    flex: 0 0 auto;
    color: var(--c-orange-100);
    white-space: nowrap;
  }

  &__text {
    flex: 1 0 0;
    min-width: 0;
    color: var(--c-black-70);
  }

  &--error {
    border-color: var(--c-red);
    background: transparent;
  }

  &--error &__marker,
  &--error &__text {
    color: var(--c-red);
  }
}
</style>
