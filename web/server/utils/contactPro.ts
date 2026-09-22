import type { ProFieldData, ProFormData, ProInputField, ProMonthYearAnswer } from '~/config/CONTACT_PRO_CONFIG'
import {
  isProFieldVisible,
  isProInputField,
  CONTACT_MAX_LENGTH as MAX,
  PRO_CONSENT_KEY,
  PRO_IDENTITY_ROLES,
  PRO_MAX_ANSWERS,
  PRO_NO,
  PRO_YES,
  proAnswerKey,
  proFieldsByKey,
  proFormFields,
  proStepLetter,
} from '~/config/CONTACT_PRO_CONFIG'
import { proFormProjection } from '~/queries/contact'

const EMAIL_RX = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/

export const PRO_RECAP_FIELD = 'Récap dossier PRO'

export const PRO_ESSENTIAL_COLUMNS = ['Nom complet', 'Téléphone', 'Email', 'Consentement RGPD', PRO_RECAP_FIELD]

const RESERVED_COLUMNS = new Set([
  ...PRO_ESSENTIAL_COLUMNS,
  'Type de demande',
  'Type de lead',
  'Langue',
  'Canal',
  'Étape',
  'Source',
  'Statut',
  'Page d\'origine',
  'UTM source',
  'UTM medium',
  'UTM campaign',
])

const NONE = '—'
const MAX_QUESTION = 300
const MAX_EXTRA_ANSWERS = 50

const PRO_FORM_SERVER_QUERY = `*[_type == "contact"][0].proForm${proFormProjection(true)}`

export async function loadProForm(): Promise<ProFormData | null> {
  try {
    return await useSanity().fetch<ProFormData | null>(PRO_FORM_SERVER_QUERY, { lang: 'fr' })
  }
  catch {
    console.warn('[api/contact] Could not load the pro form from Sanity, saving the lead from the raw answers')
    return null
  }
}

function str(value: unknown, max = Infinity) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

export function extractNumber(text: string): number | undefined {
  const match = text.match(/(\d[\d\s.,']*)(k(?![a-z]))?/i)
  if (!match)
    return undefined
  const digits = match[1]!.replace(/\D/g, '')
  if (!digits)
    return undefined
  const value = Number.parseInt(digits, 10) * (match[2] ? 1000 : 1)
  return Number.isSafeInteger(value) ? value : undefined
}

interface Parsed {
  display: string
  column?: unknown
}

function parseMonthYear(field: Extract<ProFieldData, { _type: 'proFieldMonthYear' }>, raw: unknown, ignored: string[]): Parsed {
  const value = record(raw) as Partial<ProMonthYearAnswer>
  if (value.pending === true && field.pendingLabel) {
    const label = field.pendingLabel.trim()
    return { display: label, column: field.pendingCrmValue?.trim() || label }
  }
  const month = str(value.month)
  const year = str(value.year)
  if (!month && !year)
    return { display: NONE }
  const m = Number(month)
  const y = Number(year)
  const monthOk = !month || (/^\d{2}$/.test(month) && m >= 1 && m <= 12)
  const yearOk = !year || (/^\d{4}$/.test(year) && y >= 1900 && y <= new Date().getFullYear())
  if (!monthOk || !yearOk) {
    ignored.push(field.label ?? field._key)
    return { display: NONE }
  }
  if (month && year)
    return { display: `${month}/${year}`, column: `${month}/${year}` }
  return { display: year || month }
}

function parseField(field: ProInputField, raw: unknown, form: ProFormData | null, ignored: string[]): Parsed {
  const yes = form?.labels?.yes?.trim() || 'Oui'
  const no = form?.labels?.no?.trim() || 'Non'

  switch (field._type) {
    case 'proFieldText': {
      const value = str(raw, field.format === 'number' ? MAX.proNumber : MAX.proText)
      if (!value)
        return { display: NONE }
      return { display: value, column: field.format === 'number' ? extractNumber(value) : value }
    }
    case 'proFieldTextarea': {
      const value = str(raw, MAX.message)
      return value ? { display: value, column: value } : { display: NONE }
    }
    case 'proFieldChoice': {
      const options = field.options ?? []
      const values = field.multiple ? (Array.isArray(raw) ? raw : []) : [raw]
      const picked = [...new Set(values.map(v => str(v)).filter(Boolean))]
        .map((key) => {
          const option = options.find(o => o._key === key)
          if (!option)
            ignored.push(field.label ?? field._key)
          return option
        })
        .filter(o => !!o)
      if (!picked.length)
        return { display: field.multiple ? 'aucun coché' : NONE }
      const crm = picked.map(o => o.crmValue?.trim() || o.label?.trim() || o._key)
      return {
        display: picked.map(o => o.label?.trim() || o._key).join(', '),
        column: field.multiple ? crm : crm[0],
      }
    }
    case 'proFieldYesNo': {
      if (raw !== PRO_YES && raw !== PRO_NO)
        return { display: NONE }
      const isYes = raw === PRO_YES
      return {
        display: isYes ? yes : no,
        column: field.airtableFormat === 'text' ? (isYes ? yes : no) : isYes,
      }
    }
    case 'proFieldCheckbox':
      return { display: raw === true ? yes : no, column: raw === true }
    case 'proFieldMonthYear':
      return parseMonthYear(field, raw, ignored)
    case 'proFieldConsent':
      return { display: yes }
    case 'proFieldIdentity':
      return { display: str(raw) || NONE }
  }
}

function displayRaw(value: unknown): string {
  if (typeof value === 'string')
    return str(value, MAX.message) || NONE
  if (typeof value === 'boolean')
    return value ? 'Oui' : 'Non'
  if (Array.isArray(value))
    return value.map(v => str(v, MAX.proText)).filter(Boolean).join(', ') || NONE
  const v = record(value)
  if ('month' in v || 'year' in v || 'pending' in v)
    return v.pending === true ? 'En attente' : [str(v.month), str(v.year)].filter(Boolean).join('/') || NONE
  return NONE
}

export interface ProLead {
  firstName: string
  lastName: string
  phone: string
  email: string
  columns: Record<string, unknown>
  recap: string
  ignored: string[]
}

export function parseProLead(body: Record<string, unknown> | undefined, form: ProFormData | null): { lead: ProLead } | { invalid: string[] } {
  const answers = record(body?.answers)
  const questions = record(body?.questions)
  const invalid: string[] = []

  if (Object.keys(answers).length > PRO_MAX_ANSWERS)
    return { invalid: ['answers'] }

  const fields = proFormFields(form)
  const emailField = fields.find(f => f._type === 'proFieldIdentity' && f.role === 'email')

  const firstName = str(answers.firstName)
  const lastName = str(answers.lastName)
  const phone = str(answers.phone)
  const email = str(answers.email)
  if (!firstName || firstName.length > MAX.name)
    invalid.push('firstName')
  if (!lastName || lastName.length > MAX.name)
    invalid.push('lastName')
  if (!phone || phone.length > MAX.phone || phone.replace(/\D/g, '').length < 8)
    invalid.push('phone')
  if (email.length > MAX.email || (email && !EMAIL_RX.test(email)) || (!email && !!emailField?.required))
    invalid.push('email')
  if (answers[PRO_CONSENT_KEY] !== true)
    invalid.push('consent')
  if (invalid.length)
    return { invalid }

  const ignored: string[] = []
  const columns: Record<string, unknown> = {}
  const byKey = proFieldsByKey(fields)
  const known = new Set<string>([...PRO_IDENTITY_ROLES, PRO_CONSENT_KEY])
  const lines = ['DOSSIER LEASING PROFESSIONNEL']
  if (!form?.steps?.length)
    lines.push('', `Nom : ${firstName} ${lastName}`, `Téléphone : ${phone}`, `Email : ${email || NONE}`)

  for (const [index, step] of (form?.steps ?? []).entries()) {
    const stepLines: string[] = []
    for (const field of (step.fields ?? []).filter(f => fields.includes(f))) {
      if (!isProInputField(field))
        continue
      const key = proAnswerKey(field)
      known.add(key)
      if (!isProFieldVisible(field, byKey, answers)) {
        if (key in answers && field._type !== 'proFieldConsent')
          ignored.push(field.label ?? key)
        continue
      }
      const parsed = parseField(field, answers[key], form, ignored)
      const question = field._type === 'proFieldConsent' ? 'Consentement RGPD' : field.label?.trim() || key
      stepLines.push(`${question} : ${parsed.display}`)
      const column = field.airtableColumn?.trim()
      if (column && !RESERVED_COLUMNS.has(column) && parsed.column !== undefined && parsed.column !== '')
        columns[column] = parsed.column
    }
    if (stepLines.length)
      lines.push('', `(${proStepLetter(index)}) ${step.tab?.trim() ?? ''}`.trim(), ...stepLines)
  }

  const extra = Object.keys(answers).filter(key => !known.has(key)).slice(0, MAX_EXTRA_ANSWERS)
  if (extra.length) {
    lines.push('', form ? 'Autres réponses (formulaire modifié entre-temps)' : 'Réponses')
    for (const key of extra)
      lines.push(`${str(questions[key], MAX_QUESTION) || key} : ${displayRaw(answers[key])}`)
  }

  return { lead: { firstName, lastName, phone, email, columns, recap: lines.join('\n'), ignored } }
}

export function proAirtableFields(lead: ProLead): Record<string, unknown> {
  return {
    ...lead.columns,
    'Nom complet': `${lead.firstName} ${lead.lastName}`,
    'Téléphone': lead.phone,
    ...(lead.email && { Email: lead.email }),
    [PRO_RECAP_FIELD]: lead.recap,
  }
}
