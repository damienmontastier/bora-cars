<script setup lang="ts">
// Mois + année (DS « Form / Motifs › Date de création ») : deux listes dans un
// fieldset. Les noms de mois viennent d'Intl (langue courante), pas du code.
// Le slot par défaut reçoit ce qui suit les listes (ex. case « en cours de création »).
interface Props {
  legend: string
  monthLabel: string
  yearLabel: string
  fromYear: number
  toYear: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

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
  <fieldset class="app-atoms-field-month-year">
    <legend class="app-atoms-field-month-year__legend P1 regular-text">
      {{ legend }}
    </legend>
    <div class="app-atoms-field-month-year__row">
      <AtomsFieldSelect
        v-model="month"
        :label="monthLabel"
        :options="monthOptions"
        :disabled="disabled"
        floating-label
      />
      <AtomsFieldSelect
        v-model="year"
        :label="yearLabel"
        :options="yearOptions"
        :disabled="disabled"
        floating-label
      />
    </div>
    <slot />
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
    // Cf. AtomsFieldChoices : legend flottant = enfant flex ordinaire (suit le gap)
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
