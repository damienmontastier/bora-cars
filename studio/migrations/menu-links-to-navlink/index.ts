import { at, defineMigration, set } from 'sanity/migrate'

const DEFAULT_LANGUAGE = 'fr'

function randomKey(length = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < length; i += 1) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export default defineMigration({
  title: 'Convert menu links from customLink to navLink with i18n label',
  documentTypes: ['menu'],
  migrate: {
    document(doc) {
      const links = doc.links as any[]
      if (!Array.isArray(links) || links.length === 0) return []

      const hasOldFormat = links.some((item) => item._type === 'customLink')
      if (!hasOldFormat) return []

      const converted = links.map((item) => {
        if (item._type !== 'customLink') return item

        const { text, _key, _type: _, ...linkFields } = item

        return {
          _key: _key ?? randomKey(),
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
      })

      return [at('links', set(converted))]
    },
  },
})
