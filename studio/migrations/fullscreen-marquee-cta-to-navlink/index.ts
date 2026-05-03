import { at, defineMigration, set } from 'sanity/migrate'

const DEFAULT_LANGUAGE = 'fr'

function toNavLink(item: any) {
  const { text, _type: _, ...linkFields } = item
  return {
    _type: 'navLink',
    label: [
      {
        _key: DEFAULT_LANGUAGE,
        _type: 'internationalizedArrayStringValue',
        language: DEFAULT_LANGUAGE,
        value: text ?? '',
      },
    ],
    link: {
      _type: 'customLink',
      ...linkFields,
    },
  }
}

export default defineMigration({
  title: 'Convert fullscreenMarquee cta from customLink to navLink',
  documentTypes: ['homepage', 'professionnel'],
  migrate: {
    document(doc) {
      const modules = doc.modules as any[]
      if (!Array.isArray(modules)) return []

      const patches = []

      modules.forEach((mod, i) => {
        if (mod._type !== 'fullscreenMarquee') return
        if (!mod.cta || mod.cta._type !== 'customLink') return
        patches.push(at(`modules[${i}].cta`, set(toNavLink(mod.cta))))
      })

      return patches
    },
  },
})
