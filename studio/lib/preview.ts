type LocalizedEntry = { language: string, value: unknown }

export const pickLocalized = (
  v: unknown,
  fallbackLang: string = 'fr',
): string => {
  if (typeof v === 'string') return v
  if (!Array.isArray(v) || v.length === 0) return ''
  const arr = v as LocalizedEntry[]
  const fr = arr.find((x) => x?.language === fallbackLang)?.value
  if (typeof fr === 'string') return fr
  const first = arr[0]?.value
  return typeof first === 'string' ? first : ''
}

export const pickLocalizedBlock = (
  v: unknown,
  fallbackLang: string = 'fr',
): string => {
  if (!Array.isArray(v) || v.length === 0) return ''
  const arr = v as LocalizedEntry[]
  const blocks = (arr.find((x) => x?.language === fallbackLang)?.value
    ?? arr[0]?.value) as Array<{ children?: Array<{ text?: string }> }> | undefined
  if (!Array.isArray(blocks) || blocks.length === 0) return ''
  return blocks[0]?.children?.map((c) => c?.text ?? '').join('') ?? ''
}
