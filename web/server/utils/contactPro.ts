import type { ProOption } from '~/config/CONTACT_PRO_CONFIG'
import {
  CONTACT_MAX_LENGTH as MAX,
  PRO_BALANCE_SHEETS,
  PRO_CREATION_FIRST_YEAR,
  PRO_DEPOSITS,
  PRO_DOCUMENTS,
  PRO_DURATIONS,
  PRO_FINANCINGS,
  PRO_INCOME_NONE,
  PRO_INCOME_TYPES,
  PRO_LEGAL_FORMS,
  PRO_REVENUES,
  PRO_TIMELINES,
  PRO_USAGES,
  PRO_YES_NO,
} from '~/config/CONTACT_PRO_CONFIG'

// Parcours « Leasing professionnel » : validation du payload et conversion vers les
// champs de la table Airtable Leads. Chaque valeur de liste est comparée à la liste
// blanche de CONTACT_PRO_CONFIG puis convertie en libellé EXACT d'option Airtable :
// une valeur inconnue n'est jamais envoyée (typecast créerait une option fantôme).

// No `.` in domain labels: avoids catastrophic backtracking.
const EMAIL_RX = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/

// Champ texte long qui reçoit le récapitulatif lisible du dossier (email de notification).
export const PRO_RECAP_FIELD = 'Récap dossier PRO'

// Le body est non fiable : le type dit string, le réseau peut envoyer n'importe quoi.
function str(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

// Valeur de liste : '' si absente, `undefined` si hors liste (→ invalide).
function pick<O extends { value: string }>(list: readonly O[], value: unknown): O | '' | undefined {
  const raw = str(value)
  if (!raw)
    return ''
  return list.find(o => o.value === raw)
}

// Premier nombre d'une saisie libre (« 20 000 km », « 20,000 km », « 900 € / mois », « 20k »).
// Espaces, points, virgules et apostrophes = séparateurs de milliers (km et budgets sont
// des entiers). Le « k » ne multiplie que s'il est isolé (pas celui de « km »).
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

export interface ProLead {
  firstName: string
  lastName: string
  city: string
  phone: string
  email: string
  company: string
  legalForm: ProOption
  creation: string
  activity: string
  revenue: ProOption
  balanceSheets: ProOption | ''
  hasIncome: ProOption | ''
  incomeType: ProOption | ''
  deposit: ProOption
  leaseRefused: ProOption | ''
  usage: ProOption
  financing: ProOption | ''
  mileage: string
  duration: typeof PRO_DURATIONS[number] | ''
  wantsAdvice: boolean
  models: string
  vehicleCount: number
  budget: string
  timeline: ProOption | ''
  documents: ProOption[]
  message: string
  consent: true
}

/**
 * Valide un payload pro. Renvoie le dossier normalisé, ou la liste des champs invalides.
 * Champs conditionnels : une valeur dont la condition n'est pas remplie (type de revenus
 * sans « Oui », km / durée sans LOA/LLD, date avec « en cours de création ») est ignorée,
 * jamais écrite dans le CRM.
 */
export function parseProLead(body: Record<string, unknown> | undefined): { lead: ProLead, ignored: string[] } | { invalid: string[] } {
  const invalid: string[] = []
  const ignored: string[] = []

  const text = (field: string, max: number, required: boolean) => {
    const value = str(body?.[field])
    if ((required && !value) || value.length > max)
      invalid.push(field)
    return value
  }

  const firstName = text('firstName', MAX.name, true)
  const lastName = text('lastName', MAX.name, true)
  const city = text('city', MAX.city, true)
  const phone = text('phone', MAX.phone, true)
  if (phone && phone.replace(/\D/g, '').length < 8)
    invalid.push('phone')
  const email = text('email', MAX.email, false)
  if (email && !EMAIL_RX.test(email))
    invalid.push('email')
  const company = text('company', MAX.company, true)
  const activity = text('activity', MAX.activity, true)
  const mileage = text('mileage', MAX.short, false)
  const budget = text('budget', MAX.short, false)
  const models = text('models', MAX.models, false)
  const message = text('message', MAX.message, false)

  // Listes : `required` → absente = invalide ; toujours invalide si hors liste.
  const list = <O extends { value: string }>(field: string, options: readonly O[], required: boolean) => {
    const option = pick(options, body?.[field])
    if (option === undefined || (required && !option))
      invalid.push(field)
    return option || ''
  }

  const legalForm = list('legalForm', PRO_LEGAL_FORMS, true)
  const revenue = list('revenue', PRO_REVENUES, true)
  const balanceSheets = list('balanceSheets', PRO_BALANCE_SHEETS, false)
  const hasIncome = list('hasIncome', PRO_YES_NO, false)
  let incomeType: ProOption | '' = list('incomeType', PRO_INCOME_TYPES, false)
  const deposit = list('deposit', PRO_DEPOSITS, true)
  const leaseRefused = list('leaseRefused', PRO_YES_NO, false)
  const usage = list('usage', PRO_USAGES, true)
  const financing = list('financing', PRO_FINANCINGS, false)
  let duration: typeof PRO_DURATIONS[number] | '' = list('duration', PRO_DURATIONS, false)
  const timeline = list('timeline', PRO_TIMELINES, false)

  // Documents : tableau de valeurs connues, sans doublon
  const rawDocuments = body?.documents ?? []
  const documents: ProOption[] = []
  if (!Array.isArray(rawDocuments) || rawDocuments.length > PRO_DOCUMENTS.length) {
    invalid.push('documents')
  }
  else {
    for (const value of rawDocuments) {
      const option = pick(PRO_DOCUMENTS, value)
      if (!option) {
        invalid.push('documents')
        break
      }
      if (!documents.includes(option))
        documents.push(option)
    }
  }

  // Date de création : MM/AAAA, ou « En cours de création »
  const creationPending = body?.creationPending === true
  const month = str(body?.creationMonth)
  const year = str(body?.creationYear)
  let creation = ''
  if (creationPending) {
    creation = 'En cours de création'
    if (month || year)
      ignored.push('creationDate')
  }
  else if (month || year) {
    const m = Number(month)
    const y = Number(year)
    const monthOk = !month || (/^\d{2}$/.test(month) && m >= 1 && m <= 12)
    const yearOk = !year || (/^\d{4}$/.test(year) && y >= PRO_CREATION_FIRST_YEAR && y <= new Date().getFullYear())
    if (!monthOk || !yearOk)
      invalid.push('creationDate')
    else if (month && year)
      creation = `${month}/${year}`
  }

  // Nombre de véhicules : entier 1–99, 1 par défaut (comme le prototype)
  const rawCount = str(String(body?.vehicleCount ?? ''))
  let vehicleCount = 1
  if (rawCount) {
    const n = Number(rawCount)
    if (!Number.isInteger(n) || n < 1 || n > 99)
      invalid.push('vehicleCount')
    else
      vehicleCount = n
  }

  if (body?.wantsAdvice !== undefined && typeof body.wantsAdvice !== 'boolean')
    invalid.push('wantsAdvice')
  if (body?.consent !== true)
    invalid.push('consent')

  // Conditionnels vérifiés côté serveur aussi
  if (incomeType && (!hasIncome || hasIncome.value !== 'yes')) {
    ignored.push('incomeType')
    incomeType = ''
  }
  let finalMileage = mileage
  if (!financing && (mileage || duration)) {
    ignored.push('mileage/duration')
    finalMileage = ''
    duration = ''
  }

  if (invalid.length)
    return { invalid: [...new Set(invalid)] }

  return {
    ignored,
    lead: {
      firstName,
      lastName,
      city,
      phone,
      email,
      company,
      legalForm: legalForm as ProOption,
      creation,
      activity,
      revenue: revenue as ProOption,
      balanceSheets,
      hasIncome,
      incomeType,
      deposit: deposit as ProOption,
      leaseRefused,
      usage: usage as ProOption,
      financing,
      mileage: finalMileage,
      duration,
      wantsAdvice: body?.wantsAdvice === true,
      models,
      vehicleCount,
      budget,
      timeline,
      documents,
      message,
      consent: true,
    },
  }
}

// Récapitulatif lisible de tout le dossier (repris dans l'email de notification du commercial).
export function proRecap(lead: ProLead): string {
  const none = '—'
  const yesNo = (value: boolean) => (value ? 'Oui' : 'Non')
  const income = lead.hasIncome
    ? (lead.hasIncome.value === 'yes' ? `Oui${lead.incomeType ? ` (${lead.incomeType.airtable})` : ''}` : 'Non')
    : none
  return [
    'DOSSIER LEASING PROFESSIONNEL',
    '',
    '(A) Vous',
    `Nom : ${lead.firstName} ${lead.lastName}`,
    `Ville : ${lead.city}`,
    `Téléphone WhatsApp : ${lead.phone}`,
    `Email : ${lead.email || none}`,
    `Société : ${lead.company}`,
    '',
    '(B) Société',
    `Forme juridique : ${lead.legalForm.airtable}`,
    `Date de création : ${lead.creation || none}`,
    `Domaine d'activité : ${lead.activity}`,
    `Chiffre d'affaires annuel : ${lead.revenue.airtable}`,
    `Bilans comptables clôturés disponibles : ${lead.balanceSheets ? lead.balanceSheets.airtable : none}`,
    '',
    '(C) Situation',
    `Revenus personnels : ${income}`,
    `Apport disponible : ${lead.deposit.airtable}`,
    `Refus de leasing (concession, banque) : ${lead.leaseRefused ? lead.leaseRefused.airtable : none}`,
    '',
    '(D) Projet',
    `Usage prévu : ${lead.usage.airtable}`,
    `Je recherche : ${lead.financing ? lead.financing.airtable : none}`,
    ...(lead.financing
      ? [
          `Kilomètres / an : ${lead.mileage || none}`,
          `Durée : ${lead.duration ? `${lead.duration.months} mois` : none}`,
        ]
      : []),
    `Souhaite être conseillé : ${yesNo(lead.wantsAdvice)}`,
    `Modèle(s) souhaité(s) : ${lead.models || none}`,
    `Nombre de véhicules : ${lead.vehicleCount}`,
    `Budget mensuel : ${lead.budget || none}`,
    `Délai : ${lead.timeline ? lead.timeline.airtable : none}`,
    '',
    '(E) Justificatifs',
    `Documents disponibles : ${lead.documents.length ? lead.documents.map(d => d.airtable).join(', ') : 'aucun coché'}`,
    `Autre chose à nous dire : ${lead.message || none}`,
  ].join('\n')
}

// Champs Airtable propres au parcours pro (les champs communs — langue, canal, UTM… —
// sont posés par l'API).
export function proAirtableFields(lead: ProLead): Record<string, unknown> {
  const fields: Record<string, unknown> = {
    'Nom complet': `${lead.firstName} ${lead.lastName}`,
    'Téléphone': lead.phone,
    'Ville': lead.city,
    'Société': lead.company,
    'Forme juridique': lead.legalForm.airtable,
    'Domaine d\'activité': lead.activity,
    'CA société': lead.revenue.airtable,
    'Apport disponible': lead.deposit.airtable,
    'Usage prévu': lead.usage.airtable,
    'Nombre de véhicules': lead.vehicleCount,
    'Souhaite être conseillé': lead.wantsAdvice,
    'Refusé en concession': lead.leaseRefused ? lead.leaseRefused.value === 'yes' : false,
    [PRO_RECAP_FIELD]: proRecap(lead),
  }

  if (lead.email)
    fields.Email = lead.email
  if (lead.creation)
    fields['Société créée le'] = lead.creation
  if (lead.balanceSheets)
    fields['Bilans disponibles'] = lead.balanceSheets.airtable
  if (lead.hasIncome)
    fields['Revenus personnels'] = lead.hasIncome.value === 'yes' ? (lead.incomeType ? lead.incomeType.airtable : undefined) : PRO_INCOME_NONE
  if (lead.financing)
    fields['Type de financement'] = lead.financing.airtable
  if (lead.duration)
    fields['Durée (mois)'] = lead.duration.months
  const km = lead.mileage ? extractNumber(lead.mileage) : undefined
  if (km)
    fields['Km / an'] = km
  const budget = lead.budget ? extractNumber(lead.budget) : undefined
  if (budget)
    fields['Budget mensuel (€)'] = budget
  if (lead.models)
    fields['Véhicule (texte libre)'] = lead.models
  if (lead.timeline)
    fields['Délai'] = lead.timeline.airtable
  if (lead.documents.length)
    fields['Documents disponibles'] = lead.documents.map(d => d.airtable)
  if (lead.message)
    fields.Message = lead.message

  // Pas d'`undefined` dans le body Airtable (ex. revenus « Oui » sans type précisé)
  return Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined))
}
