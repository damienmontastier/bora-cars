export const CONTACT_PROFILES = ['general', 'pro'] as const
export type ContactProfile = typeof CONTACT_PROFILES[number]

export const CONTACT_PROFILE_QUERY = 'profil'

export const CONTACT_MAX_LENGTH = {
  name: 100,
  email: 254,
  phone: 40,
  proText: 300,
  proNumber: 100,
  message: 10000,
} as const

export const PRO_MAX_ANSWERS = 200

export const PRO_IDENTITY_ROLES = ['firstName', 'lastName', 'phone', 'email'] as const
export type ProIdentityRole = typeof PRO_IDENTITY_ROLES[number]

export const PRO_CONSENT_KEY = 'consent'

export interface ProFieldCondition {
  field: string | null
  values: string[] | null
}

interface ProFieldBase {
  _key: string
  label: string | null
  required: boolean | null
  errorMessage: string | null
  width: 'full' | 'half' | null
  showIf: ProFieldCondition | null
  airtableColumn?: string | null
}

export interface ProFieldOption {
  _key: string
  label: string | null
  description: string | null
  crmValue?: string | null
}

export interface ProFieldIdentity extends ProFieldBase {
  _type: 'proFieldIdentity'
  role: ProIdentityRole
  placeholder: string | null
}

export interface ProFieldConsent extends ProFieldBase {
  _type: 'proFieldConsent'
  before: string | null
  linkLabel: string | null
  after: string | null
}

export interface ProFieldText extends ProFieldBase {
  _type: 'proFieldText'
  placeholder: string | null
  format: 'text' | 'number' | null
  defaultValue: string | null
}

export interface ProFieldTextarea extends ProFieldBase {
  _type: 'proFieldTextarea'
  placeholder: string | null
}

export interface ProFieldChoice extends ProFieldBase {
  _type: 'proFieldChoice'
  display: 'select' | 'list' | 'row' | null
  multiple: boolean | null
  options: ProFieldOption[] | null
}

export interface ProFieldYesNo extends ProFieldBase {
  _type: 'proFieldYesNo'
  airtableFormat?: 'checkbox' | 'text' | null
}

export interface ProFieldCheckbox extends ProFieldBase {
  _type: 'proFieldCheckbox'
}

export interface ProFieldMonthYear extends ProFieldBase {
  _type: 'proFieldMonthYear'
  monthLabel: string | null
  yearLabel: string | null
  firstYear: number | null
  pendingLabel: string | null
  pendingCrmValue?: string | null
}

export interface ProFieldNote extends ProFieldBase {
  _type: 'proFieldNote'
  text: string | null
}

export type ProFieldData
  = | ProFieldIdentity
    | ProFieldConsent
    | ProFieldText
    | ProFieldTextarea
    | ProFieldChoice
    | ProFieldYesNo
    | ProFieldCheckbox
    | ProFieldMonthYear
    | ProFieldNote

export type ProInputField = Exclude<ProFieldData, ProFieldNote>

export interface ProFormStepData {
  _key: string
  tab: string | null
  title: string | null
  subtitle: string | null
  fields: ProFieldData[] | null
}

export interface ProFormLabels {
  stepsLabel: string | null
  stepCounter: string | null
  start: string | null
  next: string | null
  back: string | null
  submit: string | null
  yes: string | null
  no: string | null
  requiredError: string | null
  note: string | null
  sendError: string | null
}

export interface ProFormData {
  steps: ProFormStepData[] | null
  labels: ProFormLabels | null
}

export interface ProMonthYearAnswer {
  month: string
  year: string
  pending: boolean
}

export type ProAnswer = string | string[] | boolean | ProMonthYearAnswer
export type ProAnswers = Record<string, ProAnswer>

export const PRO_YES = 'yes'
export const PRO_NO = 'no'
export const PRO_CHECKED = 'checked'

export const PRO_FIELD_TYPES = [
  'proFieldIdentity',
  'proFieldConsent',
  'proFieldText',
  'proFieldTextarea',
  'proFieldChoice',
  'proFieldYesNo',
  'proFieldCheckbox',
  'proFieldMonthYear',
  'proFieldNote',
] as const satisfies readonly ProFieldData['_type'][]

export function isProInputField(field: ProFieldData): field is ProInputField {
  return field._type !== 'proFieldNote'
}

export function proStepLetter(index: number) {
  return String.fromCharCode(65 + index)
}

export function proFormFields(form: ProFormData | null | undefined): ProFieldData[] {
  return (form?.steps ?? []).flatMap(step => (step.fields ?? []).filter(f => PRO_FIELD_TYPES.includes(f._type)))
}

export function proAnswerKey(field: ProFieldData) {
  if (field._type === 'proFieldIdentity')
    return field.role
  if (field._type === 'proFieldConsent')
    return PRO_CONSENT_KEY
  return field._key
}

export function isProFieldRequired(field: ProInputField) {
  if (field._type === 'proFieldConsent')
    return true
  if (field._type === 'proFieldIdentity')
    return field.role !== 'email' || !!field.required
  if (field._type === 'proFieldCheckbox')
    return false
  return !!field.required
}

export function emptyProAnswer(field: ProInputField): ProAnswer {
  switch (field._type) {
    case 'proFieldConsent':
    case 'proFieldCheckbox':
      return false
    case 'proFieldChoice':
      return field.multiple ? [] : ''
    case 'proFieldMonthYear':
      return { month: '', year: '', pending: false }
    case 'proFieldText':
      return field.defaultValue?.trim() ?? ''
    default:
      return ''
  }
}

export function isProAnswerFilled(field: ProInputField, value: unknown): boolean {
  switch (field._type) {
    case 'proFieldConsent':
    case 'proFieldCheckbox':
      return value === true
    case 'proFieldChoice':
      return field.multiple ? Array.isArray(value) && value.length > 0 : typeof value === 'string' && !!value
    case 'proFieldMonthYear': {
      const v = value as Partial<ProMonthYearAnswer> | undefined
      return !!v && (v.pending === true || (!!v.month && !!v.year))
    }
    default:
      return typeof value === 'string' && !!value.trim()
  }
}

function conditionMet(source: ProFieldData, value: unknown, values: string[]) {
  switch (source._type) {
    case 'proFieldCheckbox':
      return value === true && values.includes(PRO_CHECKED)
    case 'proFieldChoice':
      return Array.isArray(value) ? value.some(v => values.includes(v)) : typeof value === 'string' && values.includes(value)
    case 'proFieldYesNo':
      return typeof value === 'string' && values.includes(value)
    default:
      return false
  }
}

export function isProFieldVisible(
  field: ProFieldData,
  byKey: Map<string, ProFieldData>,
  answers: Record<string, unknown>,
  seen: Set<string> = new Set(),
): boolean {
  if (field._type === 'proFieldIdentity' || field._type === 'proFieldConsent')
    return true
  const sourceKey = field.showIf?.field
  if (!sourceKey)
    return true
  const source = byKey.get(sourceKey)
  if (!source || seen.has(field._key))
    return true
  seen.add(field._key)
  if (!isProFieldVisible(source, byKey, answers, seen))
    return false
  return conditionMet(source, answers[proAnswerKey(source)], field.showIf?.values ?? [])
}

export function proFieldsByKey(fields: ProFieldData[]) {
  return new Map(fields.map(f => [f._key, f]))
}
