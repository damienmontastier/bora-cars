<script setup lang="ts">
interface Option {
  value: string
  label: string
  description?: string
}

interface Props {
  legend: string
  options: Option[]
  type?: 'radio' | 'checkbox'
  layout?: 'row' | 'column'
  required?: boolean
  invalid?: boolean
  errorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'radio',
  layout: 'column',
  required: false,
  invalid: false,
  errorMessage: '',
})

const model = defineModel<string | string[]>({ required: true })

const uid = useId()
const name = `${uid}-choice`
const errorId = `${uid}-error`
const showError = computed(() => props.invalid && !!props.errorMessage)
const displayLegend = computed(() => props.required ? `${props.legend}*` : props.legend)

function isChecked(value: string) {
  return Array.isArray(model.value) ? model.value.includes(value) : model.value === value
}

function onChange(value: string, event: Event) {
  if (props.type === 'radio') {
    model.value = value
    return
  }
  const checked = (event.target as HTMLInputElement).checked
  const current = Array.isArray(model.value) ? model.value : []
  model.value = checked
    ? [...current.filter(v => v !== value), value]
    : current.filter(v => v !== value)
}

const listRef = ref<HTMLElement | null>(null)
defineExpose({
  focus: () => {
    const inputs = [...(listRef.value?.querySelectorAll<HTMLInputElement>('input') ?? [])]
    ;(inputs.find(i => i.checked) ?? inputs[0])?.focus()
  },
})
</script>

<template>
  <fieldset
    class="app-atoms-field-choices"
    :class="[
      `app-atoms-field-choices--${layout}`,
      `app-atoms-field-choices--${type}`,
      {
        'app-atoms-field-choices--error': invalid,
        'app-atoms-field-choices--stack-mobile': layout === 'row' && options.length > 2,
      },
    ]"
    :aria-describedby="showError ? errorId : undefined"
  >
    <legend class="app-atoms-field-choices__legend P1 regular-text">
      {{ displayLegend }}
    </legend>

    <div ref="listRef" class="app-atoms-field-choices__list">
      <label
        v-for="option in options"
        :key="option.value"
        class="app-atoms-field-choices__card"
        :class="{ 'is-selected': isChecked(option.value) }"
      >
        <input
          class="app-atoms-field-choices__input"
          :type="type"
          :name="name"
          :value="option.value"
          :checked="isChecked(option.value)"
          :required="type === 'radio' && required"
          :aria-invalid="invalid || undefined"
          @change="onChange(option.value, $event)"
        >
        <span class="app-atoms-field-choices__indicator" aria-hidden="true">
          <svg v-if="type === 'checkbox'" viewBox="0 0 12 10" class="app-atoms-field-choices__check">
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
        <span class="app-atoms-field-choices__text">
          <span class="app-atoms-field-choices__label P1 regular-text">{{ option.label }}</span>
          <span v-if="option.description" class="app-atoms-field-choices__description P2 regular-text">{{ option.description }}</span>
        </span>
      </label>
    </div>

    <TextsP2
      v-if="showError"
      :id="errorId"
      tag="span"
      color="red"
      class="app-atoms-field-choices__error"
    >
      {{ errorMessage }}
    </TextsP2>
  </fieldset>
</template>

<style lang="scss">
.app-atoms-field-choices {
  display: flex;
  flex-direction: column;
  gap: desktop-vw(16px);
  width: 100%;
  min-width: 0;
  margin: 0;
  padding: desktop-vw(12px) 0;
  border: 0;

  @include mobile {
    gap: mobile-vw(12px);
    padding: mobile-vw(8px) 0;
  }

  &__legend {
    float: left;
    width: 100%;
    padding: 0;
    color: var(--c-black-70);
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(8px);
    width: 100%;

    @include mobile {
      gap: mobile-vw(8px);
    }
  }

  &--row &__list {
    flex-direction: row;
    gap: desktop-vw(12px);

    @include mobile {
      gap: mobile-vw(8px);
    }
  }

  &--stack-mobile &__list {
    @include mobile {
      flex-direction: column;
    }
  }

  &--stack-mobile &__card {
    @include mobile {
      flex: 0 0 auto;
    }
  }

  &__card {
    position: relative;
    display: flex;
    flex: 1 0 0;
    align-items: center;
    gap: desktop-vw(16px);
    min-width: 0;
    padding: desktop-vw(28px);
    border: 1px solid var(--c-black-20);
    border-radius: 4px;
    cursor: pointer;
    transition:
      background-color 0.25s var(--ease-out-cubic),
      border-color 0.25s var(--ease-out-cubic);

    @include mobile {
      gap: mobile-vw(12px);
      padding: mobile-vw(16px);
    }

    @include hover {
      &:hover:not(.is-selected) {
        background: var(--c-black-5);
      }
    }

    &.is-selected {
      background: var(--c-black-10);
      border-color: var(--c-black-100);
    }

    &:has(:focus-visible) {
      outline: 2px solid var(--c-black-100);
      outline-offset: 2px;
    }
  }

  &--column &__card {
    flex: 0 0 auto;
  }

  &--error &__card:not(.is-selected) {
    border-color: var(--c-red);
  }

  &__input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  &__indicator {
    position: relative;
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: desktop-vw(24px);
    height: desktop-vw(24px);
    border: 1px solid var(--c-black-40);
    border-radius: 50%;
    color: var(--c-beige);
    transition:
      border-color 0.2s var(--ease-out-cubic),
      background-color 0.2s var(--ease-out-cubic);

    @include mobile {
      width: mobile-vw(20px);
      height: mobile-vw(20px);
    }

    &::after {
      content: '';
      width: 42%;
      height: 42%;
      border-radius: 50%;
      background: var(--c-black-100);
      opacity: 0;
      transform: scale(0.4);
      transition:
        opacity 0.2s var(--ease-out-cubic),
        transform 0.2s var(--ease-out-cubic);
    }
  }

  &--checkbox &__indicator {
    border-radius: 4px;

    &::after {
      content: none;
    }
  }

  &__card.is-selected &__indicator {
    border-color: var(--c-black-100);

    &::after {
      opacity: 1;
      transform: scale(1);
    }
  }

  &--checkbox &__card.is-selected &__indicator {
    background: var(--c-black-100);
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

  &__card.is-selected &__check {
    opacity: 1;
    transform: scale(1);
  }

  &__text {
    display: flex;
    flex: 1 0 0;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  &__label {
    color: var(--c-black-100);
  }

  &__description {
    color: var(--c-black-70);
  }

  &__error {
    padding-left: desktop-vw(4px);

    @include mobile {
      padding-left: mobile-vw(4px);
    }
  }
}
</style>
