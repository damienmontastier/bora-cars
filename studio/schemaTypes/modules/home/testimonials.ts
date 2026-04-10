import { CommentIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const testimonialsType = defineType({
  name: 'testimonials',
  title: 'Témoignages',
  type: 'object',
  icon: CommentIcon,
  fields: [
    defineField({
      name: 'items',
      title: 'Témoignages',
      type: 'array',
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'authorName',
              title: 'Nom',
              type: 'string',
              validation: (Rule) => Rule.required().max(60),
            }),
            defineField({
              name: 'authorRole',
              title: 'Rôle',
              type: 'string',
              validation: (Rule) => Rule.max(60),
            }),
            defineField({
              name: 'car',
              title: 'Voiture',
              type: 'reference',
              to: [{ type: 'car' }],
            }),
            defineField({
              name: 'quote',
              title: 'Citation',
              type: 'text',
              rows: 4,
              validation: (Rule) => Rule.required().max(300),
            }),
            defineField({
              name: 'backgroundImage',
              title: 'Image de fond',
              type: 'customImage',
            }),
          ],
          preview: {
            select: { title: 'authorName', subtitle: 'quote' },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { items: 'items' },
    prepare({ items }) {
      return { title: 'Témoignages', subtitle: `${items?.length ?? 0} témoignage(s)` }
    },
  },
})
