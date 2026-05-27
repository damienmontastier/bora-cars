<script setup lang="ts">
interface Props {
  label?: string
  id?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  id: undefined,
  disabled: false,
})

const model = defineModel<boolean>({ default: false })

const uid = useId()
const inputId = computed(() => props.id ?? `${uid}-checkbox`)
</script>

<template>
  <label
    :for="inputId"
    class="app-atoms-field-checkbox"
    :class="{ 'is-checked': model, 'is-disabled': disabled }"
  >
    <input
      :id="inputId"
      v-model="model"
      type="checkbox"
      :disabled="disabled"
      class="app-atoms-field-checkbox__input"
    >
    <span class="app-atoms-field-checkbox__box" aria-hidden="true">
      <svg viewBox="0 0 12 10" class="app-atoms-field-checkbox__check">
        <path
          d="M1 5 L4.5 8.5 L11 1.5"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
    <TextsP3
      tag="span"
      color="black-70"
      :selectable="false"
      class="app-atoms-field-checkbox__label"
    >
      <slot>{{ label }}</slot>
    </TextsP3>
  </label>
</template>

<style lang="scss">
.app-atoms-field-checkbox {
  display: flex;
  align-items: flex-start;
  gap: desktop-vw(12px);
  width: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;

  @include mobile {
    gap: mobile-vw(10px);
  }

  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &__input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  &__box {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: desktop-vw(28px);
    height: desktop-vw(28px);
    margin-top: desktop-vw(1px);
    border: 1px solid var(--c-black-40);
    border-radius: 4px;
    background: transparent;
    color: var(--c-beige);
    transition:
      border-color 0.2s var(--ease-out-cubic),
      background 0.2s var(--ease-out-cubic);

    @include mobile {
      width: mobile-vw(24px);
      height: mobile-vw(24px);
    }
  }

  &__check {
    width: 65%;
    height: 65%;
    opacity: 0;
    transform: scale(0.6);
    transition:
      opacity 0.2s var(--ease-out-cubic),
      transform 0.2s var(--ease-out-cubic);
  }

  &.is-checked &__box {
    border-color: var(--c-black-100);
    background: var(--c-black-100);
  }

  &.is-checked &__check {
    opacity: 1;
    transform: scale(1);
  }

  &__input:focus-visible + &__box {
    outline: 2px solid var(--c-black-100);
    outline-offset: 2px;
  }

  &__label {
    flex: 1 1 auto;
    color: var(--c-black-70);
    font-family: var(--font-haas-grot-disp-regular);
    font-size: desktop-vw(13px);
    line-height: 1.5;

    @include mobile {
      font-size: mobile-vw(12px);
    }
  }
}
</style>
