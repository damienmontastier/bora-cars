import type { Ref } from 'vue'
import type { ProAnswers, ProFieldData, ProFormData, ProFormStepData, ProInputField } from '~/config/CONTACT_PRO_CONFIG'
import { createInjectionState } from '@vueuse/core'
import {
  emptyProAnswer,
  isProAnswerFilled,
  isProFieldRequired,
  isProFieldVisible,
  isProInputField,
  PRO_FIELD_TYPES,
  proAnswerKey,
  proFieldsByKey,
} from '~/config/CONTACT_PRO_CONFIG'

export interface ProStep extends Omit<ProFormStepData, 'fields'> {
  fields: ProFieldData[]
}

const [provideState, injectState] = createInjectionState((config: Ref<ProFormData | null | undefined>) => {
  const steps = computed<ProStep[]>(() => (config.value?.steps ?? []).map(step => ({
    ...step,
    fields: (step.fields ?? []).filter(f => PRO_FIELD_TYPES.includes(f._type)),
  })))
  const fields = computed(() => steps.value.flatMap(s => s.fields))
  const inputFields = computed(() => fields.value.filter(isProInputField))
  const byKey = computed(() => proFieldsByKey(fields.value))
  const labels = computed(() => config.value?.labels ?? null)

  const answers = reactive<ProAnswers>({})
  const errors = reactive<Record<string, string | null>>({})
  const attempted = reactive(new Set<string>())

  watch(inputFields, (list) => {
    for (const field of list) {
      const key = proAnswerKey(field)
      if (!(key in answers))
        answers[key] = emptyProAnswer(field)
    }
  }, { immediate: true })

  function visible(field: ProFieldData) {
    return isProFieldVisible(field, byKey.value, answers)
  }

  function check(field: ProInputField): string | null {
    if (!visible(field))
      return null
    const value = answers[proAnswerKey(field)]
    const message = field.errorMessage || labels.value?.requiredError || ''
    if (field._type === 'proFieldIdentity') {
      const text = typeof value === 'string' ? value.trim() : ''
      if (field.role === 'phone')
        return text.replace(/\D/g, '').length >= 8 ? null : message
      if (field.role === 'email' && text)
        return isValidEmail(text) ? null : message
    }
    return isProFieldRequired(field) && !isProAnswerFilled(field, value) ? message : null
  }

  function stepFields(stepKey: string) {
    return (steps.value.find(s => s._key === stepKey)?.fields ?? []).filter(isProInputField)
  }

  function validateStep(stepKey: string): ProInputField[] {
    attempted.add(stepKey)
    const invalid: ProInputField[] = []
    for (const field of stepFields(stepKey)) {
      const message = check(field)
      errors[proAnswerKey(field)] = message
      if (message !== null)
        invalid.push(field)
    }
    return invalid
  }

  function isStepValid(stepKey: string) {
    return stepFields(stepKey).every(field => check(field) === null)
  }

  watch(answers, () => {
    for (const stepKey of attempted) {
      for (const field of stepFields(stepKey))
        errors[proAnswerKey(field)] = check(field)
    }
  }, { deep: true })

  const visibility = computed(() => inputFields.value.map(field => [field, visible(field)] as const))
  watch(visibility, (next, prev) => {
    const wasVisible = new Map(prev?.map(([field, shown]) => [field._key, shown]))
    for (const [field, shown] of next) {
      if (!shown && wasVisible.get(field._key))
        answers[proAnswerKey(field)] = emptyProAnswer(field)
    }
  })

  function toPayload() {
    const sent: ProAnswers = {}
    const questions: Record<string, string> = {}
    for (const field of inputFields.value) {
      if (!visible(field))
        continue
      const key = proAnswerKey(field)
      const value = answers[key]!
      sent[key] = typeof value === 'string'
        ? value.trim()
        : Array.isArray(value) ? [...value] : typeof value === 'object' ? { ...value } : value
      if (field.label)
        questions[key] = field.label
    }
    return { answers: sent, questions }
  }

  return { steps, labels, answers, errors, visible, validateStep, isStepValid, toPayload }
})

export function provideContactProForm(config: Ref<ProFormData | null | undefined>) {
  return provideState(config)
}

export function useContactProForm() {
  const state = injectState()
  if (!state)
    throw new Error('useContactProForm() doit être appelé sous ElementsContactFormPro (provideContactProForm)')
  return state
}
