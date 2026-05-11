import { LANGUAGES } from '../../shared/languages'

const REQUIRED_LANG_IDS = LANGUAGES.map((l) => l.id)
const REQUIRED_LANG_LABEL = LANGUAGES.map((l) => l.id.toUpperCase())

type LocalizedItem = { _key?: string, language?: string, value?: unknown }

const isEmpty = (value: unknown): boolean => {
  if (value === undefined || value === null) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) {
    if (value.length === 0) return true
    // Portable text: check that at least one block has content
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

/**
 * Validation for required internationalizedArray* fields.
 * Ensures every supported language has a non-empty value.
 *
 * Usage:
 *   validation: (Rule) => requireAllLanguages(Rule)
 *
 * For fields that can be hidden by an ancestor (e.g. inside a conditional
 * `hidden` block), prefer the Sanity-idiomatic skip at the call site:
 *   validation: (Rule, ctx) => ctx?.hidden ? Rule.skip() : requireAllLanguages(Rule)
 */
export const requireAllLanguages = (rule: any) =>
  rule.custom((value: unknown) => {
    if (!Array.isArray(value) || value.length === 0) {
      return `Required for ${REQUIRED_LANG_LABEL.join(' & ')}`
    }
    const items = value as LocalizedItem[]
    const missing: string[] = []
    for (const lang of REQUIRED_LANG_IDS) {
      const item = items.find((it) => it.language === lang)
      if (!item || isEmpty(item.value)) {
        missing.push(lang.toUpperCase())
      }
    }
    if (missing.length > 0) {
      return `Missing translation: ${missing.join(', ')}`
    }
    return true
  })
