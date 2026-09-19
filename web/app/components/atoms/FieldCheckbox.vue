<script setup lang="ts">
interface Props {
  label?: string
  id?: string
  disabled?: boolean
  required?: boolean
  invalid?: boolean
  errorMessage?: string
  // `sm` : case du formulaire historique (texte 13 px) ; `md` : taille du DS « Form / Checkbox »
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  id: undefined,
  disabled: false,
  size: 'sm',
  required: false,
  invalid: false,
  errorMessage: '',
})

const model = defineModel<boolean>({ default: false })

const uid = useId()
const inputId = computed(() => props.id ?? `${uid}-checkbox`)
const errorId = computed(() => `${inputId.value}-error`)
const showError = computed(() => props.invalid && !!props.errorMessage)

const inputRef = ref<HTMLInputElement | null>(null)
defineExpose({ focus: () => inputRef.value?.focus() })
</script>

<template>
  <div
    class="app-atoms-field-checkbox"
    :class="[
      `app-atoms-field-checkbox--${size}`,
      { 'is-checked': model, 'is-disabled': disabled, 'is-error': invalid },
    ]"
  >
    <label :for="inputId" class="app-atoms-field-checkbox__control">
      <input
        :id="inputId"
        ref="inputRef"
        v-model="model"
        type="checkbox"
        :disabled="disabled"
        :required="required"
        :aria-required="required || undefined"
        :aria-invalid="invalid || undefined"
        :aria-describedby="showError ? errorId : undefined"
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
    <TextsP2
      v-if="showError"
      :id="errorId"
      tag="span"
      color="red"
      class="app-atoms-field-checkbox__error"
    >
      {{ errorMessage }}
    </TextsP2>
  </div>
</template>

<style lang="scss">
.app-atoms-field-checkbox {
  display: flex;
  flex-direction: column;
  gap: desktop-vw(8px);
  width: 100%;

  @include mobile {
    gap: mobile-vw(6px);
  }

  &__control {
    display: flex;
    align-items: center;
    gap: desktop-vw(12px);
    width: 100%;
    cursor: pointer;

    @include mobile {
      gap: mobile-vw(10px);
    }
  }

  // Texte long (ex. consentement) : la case reste alignée sur la 1re ligne
  &--md &__control {
    align-items: flex-start;
  }

  &.is-disabled &__control {
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

  @include hover {
    &:not(.is-disabled) &__control:hover &__box {
      border-color: var(--c-black-100);
    }
  }

  &.is-checked &__box {
    border-color: var(--c-black-100);
    background: var(--c-black-100);
  }

  &.is-checked &__check {
    opacity: 1;
    transform: scale(1);
  }

  &.is-error:not(.is-checked) &__box {
    border-color: var(--c-red);
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

  // Taille du DS « Form / Checkbox » : Desktop/Body/XS/Regular, Mobile/Body/S/Regular
  &--md &__label {
    font-size: desktop-vw(18px);
    line-height: desktop-vw(22px);

    @include mobile {
      font-size: mobile-vw(14px);
      line-height: mobile-vw(18px);
    }
  }

  &__label a {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 2px;
    transition: opacity 0.2s var(--ease-out-cubic);

    @include hover {
      &:hover {
        opacity: 0.7;
      }
    }

    &:focus-visible {
      outline: 2px solid var(--c-black-100);
      outline-offset: 2px;
    }
  }

  &__error {
    padding-left: desktop-vw(4px);

    @include mobile {
      padding-left: mobile-vw(4px);
    }
  }
}
</style>
