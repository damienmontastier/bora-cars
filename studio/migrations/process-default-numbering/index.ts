import { at, defineMigration, set } from 'sanity/migrate'

export default defineMigration({
  title: 'Set default numbering = "letter" on existing process modules',
  documentTypes: ['homepage', 'proprietaire'],
  migrate: {
    document(doc) {
      const modules = doc.modules as any[]
      if (!Array.isArray(modules)) return []

      const patches: any[] = []

      modules.forEach((mod, i) => {
        if (mod._type !== 'process') return
        if (mod.numbering) return
        patches.push(at(`modules[${i}].numbering`, set('letter')))
      })

      return patches
    },
  },
})
