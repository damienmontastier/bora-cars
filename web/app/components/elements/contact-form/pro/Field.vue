<script setup lang="ts">
import type { ProFieldData, ProMonthYearAnswer } from '~/config/CONTACT_PRO_CONFIG'
import { CONTACT_MAX_LENGTH, isProFieldRequired, isProInputField, PRO_NO, PRO_YES, proAnswerKey } from '~/config/CONTACT_PRO_CONFIG'

const props = defineProps<{
  field: ProFieldData
}>()

const { t } = useI18n()
const { answers, errors, labels } = useContactProForm()

const key = computed(() => proAnswerKey(props.field))
const label = computed(() => props.field.label ?? '')
const required = computed(() => isProInputField(props.field) && isProFieldRequired(props.field))
const error = computed(() => errors[key.value] ?? null)
const invalid = computed(() => error.value !== null)
const placeholder = computed(() => ('placeholder' in props.field && props.field.placeholder) || undefined)

const text = computed({
  get: () => (typeof answers[key.value] === 'string' ? answers[key.value] as string : ''),
  set: (value: string) => { answers[key.value] = value },
})
const checked = computed({
  get: () => answers[key.value] === true,
  set: (value: boolean) => { answers[key.value] = value },
})
const choice = computed({
  get: () => answers[key.value] as string | string[],
  set: (value: string | string[]) => { answers[key.value] = value },
})
const single = computed({
  get: () => (typeof answers[key.value] === 'string' ? answers[key.value] as string : ''),
  set: (value: string) => { answers[key.value] = value },
})
const monthYear = computed(() => answers[key.value] as ProMonthYearAnswer | undefined)

const options = computed(() => props.field._type === 'proFieldChoice'
  ? (props.field.options ?? []).map(o => ({ value: o._key, label: o.label ?? '', description: o.description || undefined }))
  : [])
const yesNoOptions = computed(() => [
  { value: PRO_YES, label: labels.value?.yes ?? '' },
  { value: PRO_NO, label: labels.value?.no ?? '' },
])

const identity = computed(() => {
  if (props.field._type !== 'proFieldIdentity')
    return null
  switch (props.field.role) {
    case 'firstName':
      return { autocomplete: 'given-name', maxlength: CONTACT_MAX_LENGTH.name }
    case 'lastName':
      return { autocomplete: 'family-name', maxlength: CONTACT_MAX_LENGTH.name }
    case 'email':
      return { autocomplete: 'email', maxlength: CONTACT_MAX_LENGTH.email }
    default:
      return { autocomplete: 'tel', maxlength: CONTACT_MAX_LENGTH.phone }
  }
})

const currentYear = useState('contact-pro-current-year', () => new Date().getFullYear())

watch(() => monthYear.value?.pending, (pending) => {
  if (pending && monthYear.value) {
    monthYear.value.month = ''
    monthYear.value.year = ''
  }
})
</script>

<template>
  <template v-if="field._type === 'proFieldIdentity'">
    <AtomsFieldPhone
      v-if="field.role === 'phone'"
      v-model="text"
      :label="label"
      :maxlength="identity!.maxlength"
      :placeholder="placeholder"
      :invalid="invalid"
      :error-message="error ?? ''"
      required
    />
    <AtomsFieldText
      v-else
      v-model="text"
      :type="field.role === 'email' ? 'email' : 'text'"
      :inputmode="field.role === 'email' ? 'email' : undefined"
      :label="label"
      :maxlength="identity!.maxlength"
      :placeholder="placeholder"
      :autocomplete="identity!.autocomplete"
      :invalid="invalid"
      :error-message="error ?? ''"
      :required="required"
    />
  </template>

  <AtomsFieldText
    v-else-if="field._type === 'proFieldText'"
    v-model="text"
    :label="label"
    :maxlength="field.format === 'number' ? CONTACT_MAX_LENGTH.proNumber : CONTACT_MAX_LENGTH.proText"
    :inputmode="field.format === 'number' ? 'numeric' : undefined"
    :placeholder="placeholder"
    :invalid="invalid"
    :error-message="error ?? ''"
    :required="required"
  />

  <AtomsFieldTextarea
    v-else-if="field._type === 'proFieldTextarea'"
    v-model="text"
    :label="label"
    :maxlength="CONTACT_MAX_LENGTH.message"
    :placeholder="placeholder"
    :invalid="invalid"
    :error-message="error ?? ''"
    :required="required"
  />

  <template v-else-if="field._type === 'proFieldChoice'">
    <AtomsFieldSelect
      v-if="field.display === 'select' && !field.multiple"
      v-model="single"
      :label="label"
      :options="options"
      :invalid="invalid"
      :error-message="error ?? ''"
      :required="required"
      floating-label
    />
    <AtomsFieldChoices
      v-else
      v-model="choice"
      :type="field.multiple ? 'checkbox' : 'radio'"
      :layout="field.display === 'row' && !field.multiple ? 'row' : 'column'"
      :legend="label"
      :options="options"
      :invalid="invalid"
      :error-message="error ?? ''"
      :required="required"
    />
  </template>

  <AtomsFieldChoices
    v-else-if="field._type === 'proFieldYesNo'"
    v-model="choice"
    layout="row"
    :legend="label"
    :options="yesNoOptions"
    :invalid="invalid"
    :error-message="error ?? ''"
    :required="required"
  />

  <AtomsFieldCheckbox
    v-else-if="field._type === 'proFieldCheckbox'"
    v-model="checked"
    class="app-elements-contact-form-pro__option"
    :label="label"
    size="md"
  />

  <AtomsFieldMonthYear
    v-else-if="field._type === 'proFieldMonthYear' && monthYear"
    v-model:month="monthYear.month"
    v-model:year="monthYear.year"
    :legend="label"
    :month-label="field.monthLabel ?? ''"
    :year-label="field.yearLabel ?? ''"
    :from-year="Math.min(field.firstYear ?? 1980, currentYear)"
    :to-year="currentYear"
    :disabled="monthYear.pending"
    :invalid="invalid"
    :error-message="error ?? ''"
    :required="required"
  >
    <AtomsFieldCheckbox
      v-if="field.pendingLabel"
      v-model="monthYear.pending"
      :label="field.pendingLabel"
      size="md"
    />
  </AtomsFieldMonthYear>

  <AtomsHelpNote v-else-if="field._type === 'proFieldNote'">
    {{ field.text }}
  </AtomsHelpNote>

  <AtomsFieldCheckbox
    v-else-if="field._type === 'proFieldConsent'"
    v-model="checked"
    class="app-elements-contact-form-pro__consent"
    size="md"
    :invalid="invalid"
    :error-message="error ?? ''"
    required
  >
    {{ field.before }}
    <UtilsBaseLink
      :to="{ name: 'legal-slug', params: { slug: t('legal.privacySlug') } }"
      target="_blank"
      rel="noopener"
    >
      {{ field.linkLabel }}
    </UtilsBaseLink>{{ field.after }}
  </AtomsFieldCheckbox>
</template>
