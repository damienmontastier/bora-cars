interface AirtableError {
  error?: { type?: string, message?: string }
}

const FIELD_ERRORS = new Set(['UNKNOWN_FIELD_NAME', 'INVALID_VALUE_FOR_COLUMN'])

function refusedField(err: any, remaining: Record<string, unknown>): string | undefined {
  const body: AirtableError | undefined = err?.response?._data ?? err?.data
  if (!body?.error?.type || !FIELD_ERRORS.has(body.error.type))
    return undefined
  const message = body.error.message ?? ''
  const candidates = [
    ...[...message.matchAll(/"([^"]+)"/g)].map(m => m[1]!),
    message.match(/field (.+?)\.?$/i)?.[1]?.trim(),
  ]
  return candidates.find(name => !!name && name in remaining)
}

export async function createAirtableRecord(
  post: (fields: Record<string, unknown>) => Promise<unknown>,
  fields: Record<string, unknown>,
  essentials?: string[],
): Promise<{ dropped: string[] }> {
  let remaining = { ...fields }
  const dropped: string[] = []
  let reduced = false

  while (true) {
    try {
      await post(remaining)
      return { dropped }
    }
    catch (err: any) {
      const field = refusedField(err, remaining)
      if (field) {
        delete remaining[field]
        dropped.push(field)
        continue
      }
      const status = err?.response?.status ?? err?.statusCode
      const extra = Object.keys(remaining).filter(key => !essentials?.includes(key))
      if (!essentials || reduced || status !== 422 || !extra.length)
        throw err
      reduced = true
      dropped.push(...extra)
      remaining = Object.fromEntries(Object.entries(remaining).filter(([key]) => essentials.includes(key)))
    }
  }
}
