import { defineField, defineType } from 'sanity'

export const processStepType = defineType({
  name: 'processStep',
  title: 'Étape',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Intitulé',
      type: 'string',
      validation: (Rule) => Rule.required().max(40),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.max(120),
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'description' },
  },
})
