import { HelpCircleIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const faqType = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'items',
      title: 'Questions',
      type: 'array',
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (Rule) => Rule.required().max(150),
            }),
            defineField({
              name: 'answer',
              title: 'Réponse',
              type: 'text',
              rows: 4,
              validation: (Rule) => Rule.required().max(600),
            }),
          ],
          preview: {
            select: { title: 'question' },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { items: 'items' },
    prepare({ items }) {
      return { title: 'FAQ', subtitle: `${items?.length ?? 0} question(s)` }
    },
  },
})
