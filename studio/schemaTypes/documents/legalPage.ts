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
      title: 'Slug (FR)',
      type: 'slug',
      group: 'editorial',
      description: 'URL française : /fr/legal/{slug} (ex. « mentions-legales », « conditions-generales »)',
      options: {
        source: (doc: any) => pickLocalized(doc.title) || '',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slugEn',
      title: 'Slug (EN)',
      type: 'slug',
      group: 'editorial',
      description: 'URL anglaise : /en/legal/{slug} (ex. « legal-notice », « privacy-policy »). Optionnel — si vide, l’anglais réutilise le slug FR ci-dessus.',
      options: {
        // Pré-rempli depuis le titre EN (les items i18n portent une clé `language`).
        source: (doc: any) => {
          const arr = doc.title
          const en = Array.isArray(arr) ? arr.find((x: any) => x?.language === 'en')?.value : ''
          return typeof en === 'string' ? en : ''
        },
        maxLength: 96,
      },
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
