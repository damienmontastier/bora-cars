interface ContactPayload {
  lastName?: string
  firstName?: string
  email?: string
  phone?: string
  subjectKey?: string
  subject?: string
  message?: string
  newsletter?: boolean
  // Honeypot — must stay empty. A non-empty value means a bot filled the hidden field.
  website?: string
  locale?: string
  pageUrl?: string
  utm?: {
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
  }
}

// No `.` in domain labels: avoids catastrophic backtracking.
const EMAIL_RX = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/

const MAX_LENGTH = { name: 100, email: 254, phone: 40, subject: 200, message: 10000, meta: 2000 }

// Existing Airtable « Type de demande » choice, used when the subject can't be
// matched against Sanity (see resolveSubject).
const FALLBACK_SUBJECT = 'Autre'

// Owner option left out on purpose: FLOW or FLEX is decided with the owner.
const LEAD_TYPE_BY_SUBJECT_KEY: Record<string, string> = {
  '88b02953258b': 'LCD — Location courte durée',
  'ea34c6eaf461': 'LLD PRO — Leasing société',
  'ee37b0534b50': 'Autre',
}

// The body is untrusted: the TS interface says string, the wire can send anything.
// Non-strings become '' so they fail validation instead of crashing on .trim().
function str(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

interface SubjectOption {
  key: string
  fr: string | null
  labels: (string | null)[] | null
}

// `typecast: true` creates an Airtable option for ANY string: always send the FR label
// of a known Sanity option (by `_key`, else by any localized label), « Autre » otherwise.
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

  // Honeypot trap — return success silently so the bot thinks it worked
  // and stops retrying with variations. Never insert into Airtable.
  if (str(body?.website)) {
    console.warn('[api/contact] Honeypot triggered, discarding submission')
    return { ok: true }
  }

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

  if (invalid.length) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Invalid payload',
      data: { fields: invalid },
    })
  }

  const fullName = firstName ? `${firstName} ${lastName}` : lastName
  const resolvedSubject = await resolveSubject(subjectKey, subject)
  const leadType = resolvedSubject.key ? LEAD_TYPE_BY_SUBJECT_KEY[resolvedSubject.key] : undefined
  const langue = str(body?.locale).toUpperCase() === 'EN' ? 'EN' : 'FR'

  const fields: Record<string, unknown> = {
    'Nom complet': fullName,
    'Email': email,
    'Téléphone': phone,
    'Message': message,
    'Type de demande': resolvedSubject.label,
    ...(leadType && { 'Type de lead': leadType }),
    'Langue': langue,
    'Canal': 'Site web',
    'Étape': 'Nouveau',
    // Legacy fields still read by CRM views/automations.
    'Source': 'Site web',
    'Statut': 'Nouveau',
    // Consent: the form displays a visible GDPR mention above submission.
    // Submitting after seeing the mention = consent (CNIL-compliant for contact use).
    'Consentement RGPD': true,
    'Opt-in newsletter': body?.newsletter === true,
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

  try {
    const { dropped } = await createAirtableRecord(recordFields => $fetch(`https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(airtableTableId)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${airtableToken}`,
        'Content-Type': 'application/json',
      },
      // typecast: true → Airtable accepts new singleSelect values dynamically
      // (creates the option on the fly instead of erroring). Source of truth = Sanity,
      // enforced by resolveSubject() — the only client-driven select field.
      body: { fields: recordFields, typecast: true },
    }), fields)
    if (dropped.length)
      console.warn('[api/contact] Airtable fields no longer exist, lead saved without them:', dropped)

    return { ok: true }
  }
  catch (err: any) {
    const status = err?.response?.status ?? err?.statusCode
    const airtablePayload = err?.response?._data ?? err?.data
    // Field names only, never the values: name/email/phone/message are personal
    // data and must not end up in the function logs.
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
