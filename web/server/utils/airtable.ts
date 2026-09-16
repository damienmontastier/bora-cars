interface AirtableError {
  error?: { type?: string, message?: string }
}

// Airtable rejects the whole record when a single field no longer exists (renamed or
// deleted in the CRM). Drop that field and retry, so a CRM change never loses a lead.
export async function createAirtableRecord(
  post: (fields: Record<string, unknown>) => Promise<unknown>,
  fields: Record<string, unknown>,
): Promise<{ dropped: string[] }> {
  const remaining = { ...fields }
  const dropped: string[] = []

  while (true) {
    try {
      await post(remaining)
      return { dropped }
    }
    catch (err: any) {
      const body: AirtableError | undefined = err?.response?._data ?? err?.data
      const unknownField = body?.error?.type === 'UNKNOWN_FIELD_NAME'
        ? body.error.message?.match(/"(.+)"/)?.[1]
        : undefined
      if (!unknownField || !(unknownField in remaining))
        throw err
      delete remaining[unknownField]
      dropped.push(unknownField)
    }
  }
}
