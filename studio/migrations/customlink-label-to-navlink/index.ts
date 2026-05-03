import { at, defineMigration, set } from 'sanity/migrate'

const ARRAY_FIELDS = ['links', 'contactLinks', 'sitemap', 'socials'] as const
const SINGLE_FIELDS = ['legalLink'] as const

function toNavLink(item: any, keepKey = true) {
  if (item._type !== 'customLink') return item
  const { label, _key, _type: _, ...linkFields } = item
  return {
    ...(keepKey && _key ? { _key } : {}),
    _type: 'navLink',
    label: label ?? [],
    link: {
      _type: 'customLink',
      ...linkFields,
    },
  }
}

export default defineMigration({
  title: 'Convert flat customLink with label back to navLink',
  documentTypes: ['menu', 'footer', 'homepage', 'professionnel'],
  migrate: {
    document(doc) {
      const patches = []

      for (const field of ARRAY_FIELDS) {
        const items = doc[field] as any[]
        if (!Array.isArray(items) || items.length === 0) continue
        if (!items.some(item => item._type === 'customLink' && item.label)) continue
        patches.push(at(field, set(items.map(item => toNavLink(item)))))
      }

      for (const field of SINGLE_FIELDS) {
        const item = doc[field] as any
        if (!item || item._type !== 'customLink' || !item.label) continue
        patches.push(at(field, set(toNavLink(item, false))))
      }

      const modules = doc.modules as any[]
      if (Array.isArray(modules)) {
        modules.forEach((mod, i) => {
          if (mod._type !== 'fullscreenMarquee') return
          if (!mod.cta || mod.cta._type !== 'customLink' || !mod.cta.label) return
          patches.push(at(`modules[${i}].cta`, set(toNavLink(mod.cta, false))))
        })
      }

      return patches
    },
  },
})
