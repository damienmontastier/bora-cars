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
  title: 'Convert settings.contactLink from customLink to navLink with i18n label',
  documentTypes: ['settings'],
  migrate: {
    document(doc) {
      const item = doc.contactLink as any
      if (!item) return []
      if (item._type === 'navLink') return []
      return [at('contactLink', set(toNavLink(item)))]
    },
  },
})
