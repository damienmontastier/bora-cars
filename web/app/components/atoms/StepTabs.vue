<script setup lang="ts">
interface Step {
  letter: string
  label: string
}

interface Props {
  steps: Step[]
  current: number
  ariaLabel?: string
  meta?: string
}

defineProps<Props>()

const emit = defineEmits<{
  select: [index: number]
}>()
</script>

<template>
  <div class="app-atoms-step-tabs">
    <ol class="app-atoms-step-tabs__list" :aria-label="ariaLabel">
      <li
        v-for="(step, i) in steps"
        :key="step.letter"
        class="app-atoms-step-tabs__item"
        :class="{
          'is-done': i < current,
          'is-active': i === current,
        }"
        :aria-current="i === current ? 'step' : undefined"
      >
        <button
          v-if="i !== current"
          type="button"
          class="app-atoms-step-tabs__tab"
          @click="emit('select', i)"
        >
          <span class="app-atoms-step-tabs__letter H4" aria-hidden="true">({{ step.letter }})</span>
          <span class="sr-only">({{ step.letter }}) {{ step.label }}</span>
        </button>
        <span v-else class="app-atoms-step-tabs__tab">
          <span class="app-atoms-step-tabs__letter H4" aria-hidden="true">({{ step.letter }})</span>
          <span
            class="app-atoms-step-tabs__label H4"
            aria-hidden="true"
          >{{ step.label }}</span>
          <span class="sr-only">({{ step.letter }}) {{ step.label }}</span>
        </span>
      </li>
    </ol>
    <p v-if="meta" class="app-atoms-step-tabs__meta LABEL-TEXT">
      {{ meta }}
    </p>
  </div>
</template>

<style lang="scss">
.app-atoms-step-tabs {
  display: flex;
  flex-direction: column;
  gap: mobile-vw(12px);
  width: 100%;

  &__list {
    display: flex;
    align-items: stretch;
    gap: 4px;
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__item {
    display: flex;
    flex: 0 0 auto;
    border-bottom: 3px solid var(--c-orange-100);
    transition: background-color 0.3s var(--ease-out-cubic);

    &.is-done {
      background: var(--c-orange-10);
    }

    &.is-active {
      flex: 1 0 0;
      min-width: 0;
      border-bottom-color: transparent;
      background: var(--c-orange-100);
    }
  }

  &__tab {
    display: flex;
    flex: 1 0 auto;
    align-items: center;
    gap: desktop-vw(24px);
    min-width: 0;
    padding: desktop-vw(20px) desktop-vw(16px);
    border: 0;
    background: transparent;
    color: var(--c-orange-100);
    text-align: left;

    @include mobile {
      gap: mobile-vw(16px);
      padding: mobile-vw(14px) mobile-vw(12px);
    }
  }

  button.app-atoms-step-tabs__tab {
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid var(--c-black-100);
      outline-offset: 2px;
    }
  }

  @include hover {
    &__item:not(.is-active):hover {
      background: var(--c-orange-20);
    }
  }

  &__item.is-active &__tab {
    color: var(--c-beige-100);
  }

  &__letter {
    flex: 0 0 auto;
    white-space: nowrap;
  }

  &__label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    @include mobile {
      display: none;
    }
  }

  &__meta {
    display: none;
    color: var(--c-orange-100);

    @include mobile {
      display: block;
    }
  }
}
</style>
