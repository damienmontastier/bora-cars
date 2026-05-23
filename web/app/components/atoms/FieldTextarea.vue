<script setup lang="ts">
interface Props {
  label: string
  required?: boolean
  invalid?: boolean
  errorMessage?: string
  id?: string
  rows?: number
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  invalid: false,
  errorMessage: '',
  id: undefined,
  rows: 4,
})

const model = defineModel<string>({ default: '' })

const uid = useId()
const inputId = computed(() => props.id ?? `${uid}-input`)
const errorId = computed(() => `${inputId.value}-error`)
const showError = computed(() => props.invalid && !!props.errorMessage)

const inputRef = ref<HTMLTextAreaElement | null>(null)
defineExpose({ focus: () => inputRef.value?.focus() })

const focused = ref(false)
const hasValue = computed(() => model.value.trim().length > 0)
const floated = computed(() => focused.value || hasValue.value)
const displayLabel = computed(() => props.required ? `${props.label}*` : props.label)
</script>

<template>
  <div
    class="app-atoms-field-textarea"
    :class="{
      'app-atoms-field-textarea--focused': focused,
      'app-atoms-field-textarea--filled': hasValue,
      'app-atoms-field-textarea--error': invalid,
      'app-atoms-field-textarea--floated': floated,
    }"
  >
    <label
      :for="inputId"
      class="app-atoms-field-textarea__label"
      :class="floated ? 'LABEL-TEXT' : ['P1', 'regular-text']"
    >{{ displayLabel }}</label>
    <textarea
      :id="inputId"
      ref="inputRef"
      v-model="model"
      class="app-atoms-field-textarea__input P1 regular-text"
      :rows="rows"
      :required="required"
      :aria-required="required || undefined"
      :aria-invalid="invalid"
      :aria-describedby="showError ? errorId : undefined"
      @focus="focused = true"
      @blur="focused = false"
    />
    <TextsP2
      v-if="showError"
      :id="errorId"
      tag="span"
      color="red"
      class="app-atoms-field-textarea__error"
    >
      {{ errorMessage }}
    </TextsP2>
  </div>
</template>

<style lang="scss">
.app-atoms-field-textarea {
  --field-border: var(--c-black-20);
  --field-label-color: var(--c-black-70);
  --field-value-color: var(--c-black-100);

  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: desktop-vw(200px);
  padding: desktop-vw(28px);
  border: 1px solid var(--field-border);
  border-radius: 4px;
  background: transparent;
  transition:
    border-color 0.25s var(--ease-out-cubic),
    margin-bottom 0.3s var(--ease-out-cubic);

  @include mobile {
    min-height: mobile-vw(160px);
    padding: mobile-vw(20px);
  }

  &--focused {
    --field-border: var(--c-black-100);
  }

  &--error {
    --field-border: var(--c-red);
    --field-label-color: var(--c-red);
    --field-value-color: var(--c-red);
    margin-bottom: desktop-vw(30px);

    @include mobile {
      margin-bottom: mobile-vw(26px);
    }
  }

  &__label {
    position: absolute;
    top: desktop-vw(28px);
    left: desktop-vw(28px);
    right: desktop-vw(28px);
    color: var(--field-label-color);
    pointer-events: none;
    text-transform: none;
    letter-spacing: 0;
    transition:
      transform 0.25s var(--ease-out-cubic),
      font-size 0.25s var(--ease-out-cubic),
      line-height 0.25s var(--ease-out-cubic),
      color 0.25s var(--ease-out-cubic);
    transform-origin: top left;

    @include mobile {
      top: mobile-vw(20px);
      left: mobile-vw(20px);
      right: mobile-vw(20px);
    }
  }

  &--floated &__label {
    transform: translateY(desktop-vw(-14px));
    color: var(--c-black-40);

    @include mobile {
      transform: translateY(mobile-vw(-10px));
    }
  }

  &--error &__label {
    color: var(--c-red);
  }

  &__input {
    width: 100%;
    flex: 1 0 auto;
    border: 0;
    outline: 0;
    resize: none;
    background: transparent;
    color: var(--field-value-color);
    caret-color: var(--c-black-100);
    opacity: 0;
    transform: translateY(desktop-vw(6px));
    transition:
      opacity 0.2s var(--ease-out-cubic),
      transform 0.25s var(--ease-out-cubic);
  }

  &--floated &__input {
    opacity: 1;
    transform: translateY(0);
    margin-top: desktop-vw(18px);

    @include mobile {
      margin-top: mobile-vw(14px);
    }
  }

  &--error &__input {
    caret-color: var(--c-red);
  }

  &__error {
    position: absolute;
    top: calc(100% + #{desktop-vw(8px)});
    left: desktop-vw(4px);

    @include mobile {
      top: calc(100% + #{mobile-vw(6px)});
      left: mobile-vw(4px);
    }
  }
}
</style>
