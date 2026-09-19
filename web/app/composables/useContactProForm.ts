import type { ProLeadPayload, ProStepId } from '~/config/CONTACT_PRO_CONFIG'
import { createInjectionState } from '@vueuse/core'
import { PRO_USAGES_WITH_DOCS_HINT } from '~/config/CONTACT_PRO_CONFIG'

export type ProField = keyof ProLeadPayload

const STEP_FIELDS: Record<ProStepId, ProField[]> = {
  a: ['firstName', 'lastName', 'city', 'phone', 'email', 'company'],
  b: ['legalForm', 'activity', 'revenue'],
  c: ['deposit'],
  d: ['usage'],
  e: ['consent'],
}

function emptyForm(): ProLeadPayload {
  return {
    firstName: '',
    lastName: '',
    city: '',
    phone: '',
    email: '',
    company: '',
    legalForm: '',
    creationPending: false,
    creationMonth: '',
    creationYear: '',
    activity: '',
    revenue: '',
    balanceSheets: '',
    hasIncome: '',
    incomeType: '',
    deposit: '',
    leaseRefused: '',
    usage: '',
    financing: '',
    mileage: '',
    duration: '',
    wantsAdvice: false,
    models: '',
    vehicleCount: '1',
    budget: '',
    timeline: '',
    documents: [],
    message: '',
    consent: false,
  }
}

const [provideState, injectState] = createInjectionState(() => {
  const { t, tm } = useI18n()

  function options(list: string, values: readonly { value: string }[], hints: readonly string[] = []) {
    return values.map(o => ({
      value: o.value,
      label: t(`contact.pro.options.${list}.${o.value}`),
      description: hints.includes(o.value) ? t(`contact.pro.options.${list}.${o.value}Hint`) : undefined,
    }))
  }

  const rawMessage = tm as unknown as (key: string) => unknown
  function placeholder(field: ProField): string | undefined {
    const raw = rawMessage(`contact.pro.placeholders.${field}`)
    return typeof raw === 'string' && raw ? raw : undefined
  }

  const form = reactive<ProLeadPayload>(emptyForm())
  const errors = reactive<Partial<Record<ProField, string>>>({})
  const attempted = reactive(new Set<ProStepId>())

  function check(field: ProField): string {
    const msg = () => t(`contact.pro.errors.${field}`)
    switch (field) {
      case 'phone':
        return form.phone.replace(/\D/g, '').length >= 8 ? '' : msg()
      case 'email':
        return !form.email.trim() || isValidEmail(form.email.trim()) ? '' : msg()
      case 'consent':
        return form.consent ? '' : msg()
      default: {
        const value = form[field]
        return typeof value === 'string' && value.trim() ? '' : msg()
      }
    }
  }

  function validateStep(step: ProStepId): ProField[] {
    attempted.add(step)
    const invalid: ProField[] = []
    for (const field of STEP_FIELDS[step]) {
      const message = check(field)
      errors[field] = message
      if (message)
        invalid.push(field)
    }
    return invalid
  }

  function isStepValid(step: ProStepId) {
    return STEP_FIELDS[step].every(field => !check(field))
  }

  watch(form, () => {
    for (const step of attempted) {
      for (const field of STEP_FIELDS[step])
        errors[field] = check(field)
    }
  }, { deep: true })

  watch(() => form.hasIncome, (value) => {
    if (value !== 'yes')
      form.incomeType = ''
  })
  watch(() => form.creationPending, (pending) => {
    if (pending) {
      form.creationMonth = ''
      form.creationYear = ''
    }
  })
  watch(() => form.financing, (value) => {
    if (!value) {
      form.mileage = ''
      form.duration = ''
    }
  })
  watch(() => form.vehicleCount, (value) => {
    const digits = value.replace(/\D/g, '')
    if (digits !== value)
      form.vehicleCount = digits
  })

  const showDocumentsHint = computed(() => PRO_USAGES_WITH_DOCS_HINT.includes(form.usage))

  function toPayload(): ProLeadPayload {
    const trimmed = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]),
    ) as unknown as ProLeadPayload
    return { ...trimmed, documents: [...form.documents] }
  }

  return { form, errors, validateStep, isStepValid, showDocumentsHint, toPayload, options, placeholder }
})

export function provideContactProForm() {
  return provideState()
}

export function useContactProForm() {
  const state = injectState()
  if (!state)
    throw new Error('useContactProForm() doit être appelé sous ElementsContactFormPro (provideContactProForm)')
  return state
}
