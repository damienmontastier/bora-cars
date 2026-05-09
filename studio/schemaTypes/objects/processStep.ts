import { defineField, defineType } from 'sanity'
import { pickLocalized } from '../../lib/preview'
import { requireAllLanguages } from '../../lib/i18nValidation'

export const processStepType = defineType({
  name: 'processStep',
  title: 'Étape',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Intitulé',
      type: 'internationalizedArrayString',
      validation: (Rule) => requireAllLanguages(Rule),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'internationalizedArrayText',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'description' },
    prepare({ title, subtitle }) {
      return { title: pickLocalized(title), subtitle: pickLocalized(subtitle) }
    },
  },
})
