export interface ProOption<V extends string = string> {
  value: V
  airtable: string
}

export const PRO_LEGAL_FORMS = [
  { value: 'micro', airtable: 'Auto-entrepreneur / Micro-entreprise' },
  { value: 'ei', airtable: 'Entreprise individuelle (EI)' },
  { value: 'eirl', airtable: 'EIRL' },
  { value: 'eurl', airtable: 'EURL' },
  { value: 'sarl', airtable: 'SARL' },
  { value: 'sasu', airtable: 'SASU' },
  { value: 'sas', airtable: 'SAS' },
  { value: 'sa', airtable: 'SA' },
  { value: 'association', airtable: 'Association' },
  { value: 'autre', airtable: 'Autre' },
] as const satisfies readonly ProOption[]

export const PRO_REVENUES = [
  { value: 'upTo50k', airtable: 'Entre 0 et 50 000 €' },
  { value: 'from50kTo100k', airtable: 'Entre 50 000 et 100 000 €' },
  { value: 'from100kTo500k', airtable: 'Entre 100 000 et 500 000 €' },
  { value: 'over500k', airtable: 'Plus de 500 000 €' },
] as const satisfies readonly ProOption[]

export const PRO_BALANCE_SHEETS = [
  { value: 'none', airtable: '0' },
  { value: 'one', airtable: '1' },
  { value: 'two', airtable: '2' },
  { value: 'threePlus', airtable: '3 et +' },
] as const satisfies readonly ProOption[]

export const PRO_YES_NO = [
  { value: 'yes', airtable: 'Oui' },
  { value: 'no', airtable: 'Non' },
] as const satisfies readonly ProOption[]

export const PRO_INCOME_NONE = 'Non'

export const PRO_INCOME_TYPES = [
  { value: 'cdi', airtable: 'CDI' },
  { value: 'cdd', airtable: 'CDD' },
  { value: 'interim', airtable: 'Intérim' },
  { value: 'independent', airtable: 'Indépendant' },
] as const satisfies readonly ProOption[]

export const PRO_DEPOSITS = [
  { value: 'under5k', airtable: 'Moins de 5 000 €' },
  { value: 'over5k', airtable: 'Plus de 5 000 €' },
  { value: 'none', airtable: 'Aucun' },
] as const satisfies readonly ProOption[]

export const PRO_USAGES = [
  { value: 'personal', airtable: 'Usage personnel (pour ma société)' },
  { value: 'sublet', airtable: 'Sous-location' },
  { value: 'both', airtable: 'Les deux' },
] as const satisfies readonly ProOption[]

export const PRO_USAGES_WITH_DOCS_HINT: readonly string[] = ['personal', 'both']

export const PRO_FINANCINGS = [
  { value: 'loa', airtable: 'LOA' },
  { value: 'lld', airtable: 'LLD' },
] as const satisfies readonly ProOption[]

export const PRO_DURATIONS = [
  { value: 'y3', months: 36 },
  { value: 'y4', months: 48 },
  { value: 'y5plus', months: 60 },
] as const

export const PRO_TIMELINES = [
  { value: 'urgent', airtable: 'Urgent' },
  { value: 'withinMonth', airtable: 'Sous 1 mois' },
  { value: 'flexible', airtable: 'Flexible' },
] as const satisfies readonly ProOption[]

export const PRO_DOCUMENTS = [
  { value: 'kbis', airtable: 'Extrait KBIS (de moins de 3 mois)' },
  { value: 'bankStatements', airtable: 'Relevés de compte professionnel (12 derniers mois)' },
  { value: 'id', airtable: 'Pièce d\'identité' },
  { value: 'license', airtable: 'Permis de conduire' },
  { value: 'lease', airtable: 'Bail commercial' },
  { value: 'balanceSheet', airtable: 'Dernier bilan comptable' },
  { value: 'socialProof', airtable: 'Preuve sociale ou supports digitaux (site internet, réseaux sociaux…)' },
] as const satisfies readonly ProOption[]

export const PRO_DOCUMENTS_WITH_HINT: readonly string[] = ['socialProof']

export const PRO_CREATION_FIRST_YEAR = 1980

export const PRO_STEPS = [
  { id: 'a', letter: 'A' },
  { id: 'b', letter: 'B' },
  { id: 'c', letter: 'C' },
  { id: 'd', letter: 'D' },
  { id: 'e', letter: 'E' },
] as const

export type ProStepId = typeof PRO_STEPS[number]['id']
export type ProLegalForm = typeof PRO_LEGAL_FORMS[number]['value']
export type ProRevenue = typeof PRO_REVENUES[number]['value']
export type ProBalanceSheets = typeof PRO_BALANCE_SHEETS[number]['value']
export type ProYesNo = typeof PRO_YES_NO[number]['value']
export type ProIncomeType = typeof PRO_INCOME_TYPES[number]['value']
export type ProDeposit = typeof PRO_DEPOSITS[number]['value']
export type ProUsage = typeof PRO_USAGES[number]['value']
export type ProFinancing = typeof PRO_FINANCINGS[number]['value']
export type ProDuration = typeof PRO_DURATIONS[number]['value']
export type ProTimeline = typeof PRO_TIMELINES[number]['value']
export type ProDocument = typeof PRO_DOCUMENTS[number]['value']

export const CONTACT_PROFILES = ['general', 'pro'] as const
export type ContactProfile = typeof CONTACT_PROFILES[number]

export const CONTACT_PROFILE_QUERY = 'profil'

export const CONTACT_MAX_LENGTH = {
  name: 100,
  email: 254,
  phone: 40,
  city: 100,
  company: 200,
  activity: 200,
  short: 100,
  models: 300,
  message: 10000,
} as const

export interface ProLeadPayload {
  firstName: string
  lastName: string
  city: string
  phone: string
  email: string
  company: string
  legalForm: ProLegalForm | ''
  creationPending: boolean
  creationMonth: string
  creationYear: string
  activity: string
  revenue: ProRevenue | ''
  balanceSheets: ProBalanceSheets | ''
  hasIncome: ProYesNo | ''
  incomeType: ProIncomeType | ''
  deposit: ProDeposit | ''
  leaseRefused: ProYesNo | ''
  usage: ProUsage | ''
  financing: ProFinancing | ''
  mileage: string
  duration: ProDuration | ''
  wantsAdvice: boolean
  models: string
  vehicleCount: string
  budget: string
  timeline: ProTimeline | ''
  documents: ProDocument[]
  message: string
  consent: boolean
}
