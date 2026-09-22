import { CONTACT_MAX_LENGTH, CONTACT_PROFILES } from '~/config/CONTACT_PRO_CONFIG'

interface ContactPayload {
  profile?: string
  lastName?: string
  firstName?: string
  email?: string
  phone?: string
  subjectKey?: string
  subject?: string
  message?: string
  newsletter?: boolean
  website?: string
  locale?: string
  pageUrl?: string
  utm?: {
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
  }
}

const EMAIL_RX = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/

const MAX_LENGTH = { ...CONTACT_MAX_LENGTH, subject: 200, meta: 2000 }

const FALLBACK_SUBJECT = 'Autre'

const LEAD_TYPE_BY_SUBJECT_KEY: Record<string, string> = {
  ea34c6eaf461: 'LLD PRO — Leasing société',
  ee37b0534b50: 'Autre',
}

const PRO_LEAD_TYPE = 'LLD PRO — Leasing société'
const PRO_REQUEST_TYPE = 'Leasing professionnel'
const PRO_FIXED_COLUMNS = ['Type de demande', 'Type de lead']

function str(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

interface SubjectOption {
  key: string
  fr: string | null
  labels: (string | null)[] | null
}

async function resolveSubject(key: string, label: string): Promise<{ label: string, key?: string }> {
  try {
    const options = await useSanity().fetch<SubjectOption[] | null>(
      `*[_type == "contact"][0].subjectOptions[]{
        "key": _key,
        "fr": label[language == "fr"][0].value,
        "labels": label[].value
      }`,
    )
    const option = options?.find(o => !!key && o.key === key)
      ?? options?.find(o => !!label && !!o.labels?.some(l => l?.trim() === label))
    const fr = option?.fr?.trim()
    if (fr)
      return { label: fr, key: option!.key }
  }
  catch {
    console.warn('[api/contact] Could not load subject options from Sanity')
  }
  return { label: FALLBACK_SUBJECT }
}

export default defineEventHandler(async (event) => {
  const { airtableToken, airtableBaseId, airtableTableId } = useRuntimeConfig()

  if (!airtableToken || !airtableBaseId || !airtableTableId) {
    console.error('[api/contact] Missing Airtable configuration')
    throw createError({ statusCode: 500, statusMessage: 'Server misconfigured' })
  }

  const body = await readBody<ContactPayload>(event)

  if (str(body?.website)) {
    console.warn('[api/contact] Honeypot triggered, discarding submission')
    return { ok: true }
  }

  const rawProfile = str(body?.profile) || 'general'
  if (!(CONTACT_PROFILES as readonly string[]).includes(rawProfile))
    invalidPayload(['profile'])

  const isPro = rawProfile === 'pro'
  const fields = isPro
    ? await proFields(body as Record<string, unknown>)
    : await generalFields(body)

  Object.assign(fields, commonFields(body))

  try {
    const { dropped } = await createAirtableRecord(recordFields => $fetch(`https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(airtableTableId)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${airtableToken}`,
        'Content-Type': 'application/json',
      },
      body: { fields: recordFields, typecast: true },
    }), fields, isPro ? [...PRO_ESSENTIAL_COLUMNS, ...PRO_FIXED_COLUMNS, ...Object.keys(commonFields(body))] : undefined)
    if (dropped.length)
      console.warn('[api/contact] Airtable refused some fields, lead saved without them:', dropped)

    return { ok: true }
  }
  catch (err: any) {
    const status = err?.response?.status ?? err?.statusCode
    const airtablePayload = err?.response?._data ?? err?.data
    console.error('[api/contact] Airtable error', {
      status,
      airtable: airtablePayload,
      fields: Object.keys(fields),
    })
    throw createError({
      statusCode: 502,
      statusMessage: 'Upstream error',
      data: import.meta.dev ? { status, airtable: airtablePayload } : undefined,
    })
  }
})

function invalidPayload(fields: string[]): never {
  throw createError({
    statusCode: 422,
    statusMessage: 'Invalid payload',
    data: { fields },
  })
}

async function proFields(body: Record<string, unknown> | undefined): Promise<Record<string, unknown>> {
  const parsed = parseProLead(body, await loadProForm())
  if ('invalid' in parsed)
    invalidPayload(parsed.invalid)
  if (parsed.lead.ignored.length)
    console.warn('[api/contact] Pro lead: answers ignored (hidden or unknown)', parsed.lead.ignored)

  return {
    ...proAirtableFields(parsed.lead),
    'Type de demande': PRO_REQUEST_TYPE,
    'Type de lead': PRO_LEAD_TYPE,
    'Consentement RGPD': true,
  }
}

function commonFields(body: ContactPayload | undefined): Record<string, unknown> {
  const fields: Record<string, unknown> = {
    Langue: str(body?.locale).toUpperCase() === 'EN' ? 'EN' : 'FR',
    Canal: 'Site web',
    Étape: 'Nouveau',
    Source: 'Site web',
    Statut: 'Nouveau',
  }

  const pageUrl = str(body?.pageUrl).slice(0, MAX_LENGTH.meta)
  if (pageUrl)
    fields['Page d\'origine'] = pageUrl

  const utmSource = str(body?.utm?.utm_source).slice(0, MAX_LENGTH.subject)
  const utmMedium = str(body?.utm?.utm_medium).slice(0, MAX_LENGTH.subject)
  const utmCampaign = str(body?.utm?.utm_campaign).slice(0, MAX_LENGTH.subject)
  if (utmSource)
    fields['UTM source'] = utmSource
  if (utmMedium)
    fields['UTM medium'] = utmMedium
  if (utmCampaign)
    fields['UTM campaign'] = utmCampaign

  return fields
}

async function generalFields(body: ContactPayload | undefined): Promise<Record<string, unknown>> {
  const lastName = str(body?.lastName)
  const firstName = str(body?.firstName)
  const email = str(body?.email)
  const phone = str(body?.phone)
  const subjectKey = str(body?.subjectKey)
  const subject = str(body?.subject)
  const message = str(body?.message)

  const invalid: string[] = []
  if (!lastName || lastName.length > MAX_LENGTH.name)
    invalid.push('lastName')
  if (firstName.length > MAX_LENGTH.name)
    invalid.push('firstName')
  if (!email || email.length > MAX_LENGTH.email || !EMAIL_RX.test(email))
    invalid.push('email')
  if (!phone || phone.length > MAX_LENGTH.phone || phone.replace(/\D/g, '').length < 8)
    invalid.push('phone')
  if ((!subjectKey && !subject) || subjectKey.length > MAX_LENGTH.subject || subject.length > MAX_LENGTH.subject)
    invalid.push('subject')
  if (!message || message.length > MAX_LENGTH.message)
    invalid.push('message')

  if (invalid.length)
    invalidPayload(invalid)

  const fullName = firstName ? `${firstName} ${lastName}` : lastName
  const resolvedSubject = await resolveSubject(subjectKey, subject)
  const leadType = resolvedSubject.key ? LEAD_TYPE_BY_SUBJECT_KEY[resolvedSubject.key] : undefined

  return {
    'Nom complet': fullName,
    'Email': email,
    'Téléphone': phone,
    'Message': message,
    'Type de demande': resolvedSubject.label,
    ...(leadType && { 'Type de lead': leadType }),
    'Consentement RGPD': true,
    'Opt-in newsletter': body?.newsletter === true,
  }
}
