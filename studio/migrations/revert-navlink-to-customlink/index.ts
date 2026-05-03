import { at, defineMigration, set } from 'sanity/migrate'

const ARRAY_FIELDS = ['links', 'contactLinks', 'sitemap', 'socials'] as const
const SINGLE_FIELDS = ['legalLink'] as const

function flattenNavLink(item: any, keepKey = true) {
  if (item._type !== 'navLink') return item
  const { label, link, _key, _type: _ } = item
  const { _type: _linkType, ...linkFields } = link ?? {}
  return {
    ...(keepKey && _key ? { _key } : {}),
    _type: 'customLink',
    label,
    ...linkFields,
  }
}

export default defineMigration({
  title: 'Revert navLink items back to flat customLink with label field',
  documentTypes: ['menu', 'footer', 'homepage', 'professionnel'],
  migrate: {
    document(doc) {
      const patches = []

      for (const field of ARRAY_FIELDS) {
        const items = doc[field] as any[]
        if (!Array.isArray(items) || items.length === 0) continue
        if (!items.some(item => item._type === 'navLink')) continue
        patches.push(at(field, set(items.map(item => flattenNavLink(item)))))
      }

      for (const field of SINGLE_FIELDS) {
        const item = doc[field] as any
        if (!item || item._type !== 'navLink') continue
        patches.push(at(field, set(flattenNavLink(item, false))))
      }

      // fullscreenMarquee cta inside modules[]
      const modules = doc.modules as any[]
      if (Array.isArray(modules)) {
        modules.forEach((mod, i) => {
          if (mod._type !== 'fullscreenMarquee') return
          if (!mod.cta || mod.cta._type !== 'navLink') return
          patches.push(at(`modules[${i}].cta`, set(flattenNavLink(mod.cta, false))))
        })
      }

      return patches
    },
  },
})
