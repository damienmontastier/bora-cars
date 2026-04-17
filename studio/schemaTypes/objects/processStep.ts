import { defineField, defineType } from 'sanity'
import { pickLocalized } from '../../lib/preview'

export const processStepType = defineType({
  name: 'processStep',
  title: 'Étape',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Intitulé',
      type: 'internationalizedArrayString',
      validation: (Rule) => Rule.required(),
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
