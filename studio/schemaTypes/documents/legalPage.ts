import { DocumentTextIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'
import { pickLocalized } from '../../lib/preview'
import { requireAllLanguages } from '../../lib/i18nValidation'
import { GROUPS } from '../constants'
import { seoType } from '../objects/seo'

export const legalPageType = defineType({
  name: 'legalPage',
  title: 'Page légale',
  type: 'document',
  icon: DocumentTextIcon,
  groups: GROUPS,
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'internationalizedArrayString',
      group: 'editorial',
      description: 'Ex. « Conditions Générales de Vente et de Location »',
      validation: (Rule) => requireAllLanguages(Rule),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'editorial',
      description: 'URL : /legal/{slug} (ex. « mentions-legales », « conditions-generales »)',
      options: {
        source: (doc: any) => pickLocalized(doc.title) || '',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Contenu',
      type: 'internationalizedArrayLegalBlock',
      group: 'editorial',
      description: 'Texte riche — H3, paragraphe, gras, souligné, liste',
      validation: (Rule) => requireAllLanguages(Rule),
    }),
    seoType,
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current' },
    prepare({ title, slug }) {
      return {
        title: pickLocalized(title) || 'Page légale',
        subtitle: slug ? `/legal/${slug}` : 'Slug manquant',
      }
    },
  },
})
