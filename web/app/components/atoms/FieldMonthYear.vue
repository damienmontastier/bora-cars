<script setup lang="ts">
interface Props {
  legend: string
  monthLabel: string
  yearLabel: string
  fromYear: number
  toYear: number
  disabled?: boolean
  required?: boolean
  invalid?: boolean
  errorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
  invalid: false,
  errorMessage: '',
})

const uid = useId()
const errorId = `${uid}-error`
const showError = computed(() => props.invalid && !!props.errorMessage)
const displayLegend = computed(() => props.required ? `${props.legend}*` : props.legend)

const month = defineModel<string>('month', { default: '' })
const year = defineModel<string>('year', { default: '' })

const { locale } = useI18n()

const monthOptions = computed(() => {
  const format = new Intl.DateTimeFormat(locale.value, { month: 'long' })
  return Array.from({ length: 12 }, (_, i) => {
    const name = format.format(new Date(2000, i, 1))
    return { value: String(i + 1).padStart(2, '0'), label: name.charAt(0).toUpperCase() + name.slice(1) }
  })
})

const yearOptions = computed(() => {
  const years: { value: string, label: string }[] = []
  for (let y = props.toYear; y >= props.fromYear; y -= 1)
    years.push({ value: String(y), label: String(y) })
  return years
})
</script>

<template>
  <fieldset class="app-atoms-field-month-year" :aria-describedby="showError ? errorId : undefined">
    <legend class="app-atoms-field-month-year__legend P1 regular-text">
      {{ displayLegend }}
    </legend>
    <div class="app-atoms-field-month-year__row">
      <AtomsFieldSelect
        v-model="month"
        :label="monthLabel"
        :options="monthOptions"
        :disabled="disabled"
        :invalid="invalid && !disabled && !month"
        floating-label
      />
      <AtomsFieldSelect
        v-model="year"
        :label="yearLabel"
        :options="yearOptions"
        :disabled="disabled"
        :invalid="invalid && !disabled && !year"
        floating-label
      />
    </div>
    <slot />
    <TextsP2
      v-if="showError"
      :id="errorId"
      tag="span"
      color="red"
    >
      {{ errorMessage }}
    </TextsP2>
  </fieldset>
</template>

<style lang="scss">
.app-atoms-field-month-year {
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

  &__row {
    display: flex;
    gap: desktop-vw(12px);
    width: 100%;

    @include mobile {
      gap: mobile-vw(8px);
    }

    > * {
      flex: 1 0 0;
      min-width: 0;
    }
  }
}
</style>
