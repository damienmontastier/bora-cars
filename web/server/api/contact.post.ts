interface ContactPayload {
  lastName?: string
  firstName?: string
  email?: string
  phone?: string
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

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Existing Airtable « Type de demande » choice, used when the subject can't be
// matched against Sanity (see resolveSubject).
const FALLBACK_SUBJECT = 'Autre'

// The body is untrusted: the TS interface says string, the wire can send anything.
// Non-strings become '' so they fail validation instead of crashing on .trim().
function str(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

// `typecast: true` makes Airtable create a select option for ANY string, so the
// subject is checked against every localized label of the Sanity
// `contact.subjectOptions` (the form sends the label of the current locale).
// Unknown or unverifiable subjects fall back to « Autre » instead of a 422: the
// prerendered form can still offer a label renamed in Sanity until the next
// deploy, and a Sanity outage must not lose a lead.
async function resolveSubject(subject: string) {
  try {
    const labels = await useSanity().fetch<(string | null)[] | null>(
      `*[_type == "contact"][0].subjectOptions[].label[].value`,
    )
    if (labels?.some(label => label?.trim() === subject))
      return subject
  }
  catch {
    console.warn('[api/contact] Could not load subject options from Sanity')
  }
  return FALLBACK_SUBJECT
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
  const subject = str(body?.subject)
  const message = str(body?.message)

  const invalid: string[] = []
  if (!lastName) invalid.push('lastName')
  if (!email || !EMAIL_RX.test(email)) invalid.push('email')
  if (!phone || phone.replace(/\D/g, '').length < 8) invalid.push('phone')
  if (!subject) invalid.push('subject')
  if (!message) invalid.push('message')

  if (invalid.length) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Invalid payload',
      data: { fields: invalid },
    })
  }

  const fullName = firstName ? `${firstName} ${lastName}` : lastName
  const langue = str(body?.locale).toUpperCase() === 'EN' ? 'EN' : 'FR'

  const fields: Record<string, unknown> = {
    'Nom complet': fullName,
    'Email': email,
    'Téléphone': phone,
    'Message': message,
    'Type de demande': await resolveSubject(subject),
    'Langue': langue,
    'Source': 'Site web',
    'Statut': 'Nouveau',
    // Consent: the form displays a visible GDPR mention above submission.
    // Submitting after seeing the mention = consent (CNIL-compliant for contact use).
    'Consentement RGPD': true,
    'Opt-in newsletter': body?.newsletter === true,
  }

  const pageUrl = str(body?.pageUrl)
  if (pageUrl)
    fields['Page d\'origine'] = pageUrl

  const utmSource = str(body?.utm?.utm_source)
  const utmMedium = str(body?.utm?.utm_medium)
  const utmCampaign = str(body?.utm?.utm_campaign)
  if (utmSource)
    fields['UTM source'] = utmSource
  if (utmMedium)
    fields['UTM medium'] = utmMedium
  if (utmCampaign)
    fields['UTM campaign'] = utmCampaign

  try {
    await $fetch(`https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(airtableTableId)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${airtableToken}`,
        'Content-Type': 'application/json',
      },
      // typecast: true → Airtable accepts new singleSelect values dynamically
      // (creates the option on the fly instead of erroring). Source of truth = Sanity,
      // enforced by resolveSubject() — the only client-driven select field.
      body: { fields, typecast: true },
    })

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
