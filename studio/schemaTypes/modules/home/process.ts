import { OlistIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const processType = defineType({
  name: 'process',
  title: 'Process Steps',
  type: 'object',
  icon: OlistIcon,
  fields: [
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required().max(40),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              description: 'Affiché sur mobile uniquement',
              type: 'text',
              rows: 2,
              validation: (Rule) => Rule.max(100),
            }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'description' },
          },
        }),
      ],
    }),
    defineField({
      name: 'cta',
      title: 'CTA',
      type: 'customLink',
      options: { enableText: true },
    }),
  ],
  preview: {
    select: { steps: 'steps' },
    prepare({ steps }) {
      return { title: 'Process Steps', subtitle: `${steps?.length ?? 0} étapes` }
    },
  },
})
