/**
 * Parcours « Leasing professionnel » de la page Contact : valeurs des listes.
 *
 * Source unique, lue par le formulaire (`ElementsContactFormPro`) ET par l'API
 * (`server/api/contact.post.ts`, via l'alias `~/config`).
 *
 * - `value` : identifiant stable envoyé dans le payload. Il sert aussi de clé au
 *   libellé affiché : `contact.pro.options.<liste>.<value>` dans le glossaire
 *   Sanity (FR/EN, modifiable par le client).
 * - `airtable` : libellé EXACT de l'option dans la table Leads. L'API écrit avec
 *   `typecast: true` : une valeur inconnue créerait une option fantôme dans le CRM,
 *   d'où la liste blanche. Ces valeurs ne sont JAMAIS modifiables depuis le Studio.
 *
 * Renommer une option côté CRM ⇒ renommer son `airtable` ici (et inversement).
 */

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

// Oui / Non des questions « revenus personnels » et « refus de leasing ».
export const PRO_YES_NO = [
  { value: 'yes', airtable: 'Oui' },
  { value: 'no', airtable: 'Non' },
] as const satisfies readonly ProOption[]

// Champ Airtable « Revenus personnels » : « Non », ou le type quand la réponse est Oui.
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

// Usages pour lesquels l'encart d'aide de l'étape (E) s'affiche (comme le prototype).
export const PRO_USAGES_WITH_DOCS_HINT: readonly string[] = ['personal', 'both']

// `airtable` = option du champ « Type de financement » (existantes : LOA / LLD).
export const PRO_FINANCINGS = [
  { value: 'loa', airtable: 'LOA' },
  { value: 'lld', airtable: 'LLD' },
] as const satisfies readonly ProOption[]

// Champ Airtable « Durée (mois) » : nombre, pas un select.
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

// Options qui portent une 2e ligne (« indice ») sous leur libellé, comme dans le
// prototype : clé glossaire `contact.pro.options.documents.<value>Hint`.
export const PRO_DOCUMENTS_WITH_HINT: readonly string[] = ['socialProof']

// Première année proposée pour la date de création (le prototype remonte à 1980).
export const PRO_CREATION_FIRST_YEAR = 1980

// Les 5 étapes, dans l'ordre. `letter` = repère affiché dans l'indicateur « (A) ».
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

// Parcours de la page Contact (sélecteur « Demande générale » / « Leasing professionnel »).
// `general` = le formulaire historique ; valeur par défaut quand le payload n'en porte pas.
export const CONTACT_PROFILES = ['general', 'pro'] as const
export type ContactProfile = typeof CONTACT_PROFILES[number]

// Paramètre du lien direct `/{fr|en}/contact?profil=pro`.
export const CONTACT_PROFILE_QUERY = 'profil'

// Longueurs maximales des champs texte des deux parcours : `maxlength` des champs du
// formulaire ET contrôle de l'API. Le navigateur bloque la saisie à la même limite que le
// serveur : une saisie trop longue ne finit jamais en refus incompréhensible.
export const CONTACT_MAX_LENGTH = {
  name: 100,
  email: 254,
  phone: 40,
  city: 100,
  company: 200,
  activity: 200,
  // Km / an, budget mensuel (saisie libre dont l'API extrait le 1er nombre)
  short: 100,
  models: 300,
  message: 10000,
} as const

/** Payload envoyé par le parcours Leasing pro à `POST /api/contact`. */
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
