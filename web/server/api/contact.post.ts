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

export default defineEventHandler(async (event) => {
  const { airtableToken, airtableBaseId, airtableTableId } = useRuntimeConfig()

  if (!airtableToken || !airtableBaseId || !airtableTableId) {
    console.error('[api/contact] Missing Airtable configuration')
    throw createError({ statusCode: 500, statusMessage: 'Server misconfigured' })
  }

  const body = await readBody<ContactPayload>(event)

  // Honeypot trap — return success silently so the bot thinks it worked
  // and stops retrying with variations. Never insert into Airtable.
  if (body?.website && body.website.trim().length > 0) {
    console.warn('[api/contact] Honeypot triggered, discarding submission')
    return { ok: true }
  }

  const lastName = (body?.lastName ?? '').trim()
  const firstName = (body?.firstName ?? '').trim()
  const email = (body?.email ?? '').trim()
  const phone = (body?.phone ?? '').trim()
  const subject = (body?.subject ?? '').trim()
  const message = (body?.message ?? '').trim()

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
  const langue = (body?.locale ?? '').toUpperCase() === 'EN' ? 'EN' : 'FR'

  const fields: Record<string, unknown> = {
    'Nom complet': fullName,
    'Email': email,
    'Téléphone': phone,
    'Message': message,
    'Type de demande': subject,
    'Langue': langue,
    'Source': 'Site web',
    'Statut': 'Nouveau',
    // Consent: the form displays a visible GDPR mention above submission.
    // Submitting after seeing the mention = consent (CNIL-compliant for contact use).
    'Consentement RGPD': true,
    'Opt-in newsletter': body?.newsletter === true,
  }

  if (body?.pageUrl)
    fields['Page d\'origine'] = body.pageUrl

  if (body?.utm?.utm_source)
    fields['UTM source'] = body.utm.utm_source
  if (body?.utm?.utm_medium)
    fields['UTM medium'] = body.utm.utm_medium
  if (body?.utm?.utm_campaign)
    fields['UTM campaign'] = body.utm.utm_campaign

  try {
    await $fetch(`https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(airtableTableId)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${airtableToken}`,
        'Content-Type': 'application/json',
      },
      // typecast: true → Airtable accepts new singleSelect values dynamically
      // (creates the option on the fly instead of erroring). Source of truth = Sanity.
      body: { fields, typecast: true },
    })

    return { ok: true }
  }
  catch (err: any) {
    const status = err?.response?.status ?? err?.statusCode
    const airtablePayload = err?.response?._data ?? err?.data
    console.error('[api/contact] Airtable error', {
      status,
      airtable: airtablePayload,
      sentFields: fields,
    })
    throw createError({
      statusCode: 502,
      statusMessage: 'Upstream error',
      data: import.meta.dev ? { status, airtable: airtablePayload } : undefined,
    })
  }
})
