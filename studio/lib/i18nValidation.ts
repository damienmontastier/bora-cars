import { LANGUAGES } from '../../shared/languages'

const REQUIRED_LANG_IDS = LANGUAGES.map((l) => l.id)
const REQUIRED_LANG_LABEL = LANGUAGES.map((l) => l.id.toUpperCase())

type LocalizedItem = { _key?: string, language?: string, value?: unknown }

const isEmpty = (value: unknown): boolean => {
  if (value === undefined || value === null) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) {
    if (value.length === 0) return true
    const hasContent = value.some((block) => {
      if (!block || typeof block !== 'object') return true
      const children = (block as { children?: unknown[] }).children
      if (!Array.isArray(children)) return true
      return children.some((child) => {
        if (!child || typeof child !== 'object') return false
        const text = (child as { text?: unknown }).text
        return typeof text === 'string' && text.trim().length > 0
      })
    })
    return !hasContent
  }
  return false
}

export const missingLanguages = (value: unknown): string[] => {
  const items = Array.isArray(value) ? (value as LocalizedItem[]) : []
  return REQUIRED_LANG_IDS
    .filter((lang) => {
      const item = items.find((it) => it.language === lang)
      return !item || isEmpty(item.value)
    })
    .map((lang) => lang.toUpperCase())
}

export const requireAllLanguages = (rule: any) =>
  rule.custom((value: unknown) => {
    if (!Array.isArray(value) || value.length === 0) {
      return `Required for ${REQUIRED_LANG_LABEL.join(' & ')}`
    }
    const missing = missingLanguages(value)
    if (missing.length > 0) {
      return `Missing translation: ${missing.join(', ')}`
    }
    return true
  })
