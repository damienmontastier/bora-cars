import { CommentIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { pickLocalized } from '../../../lib/preview'

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
              type: 'internationalizedArrayString',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'authorRole',
              title: 'Rôle',
              type: 'internationalizedArrayString',
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
              type: 'internationalizedArrayText',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'backgroundImage',
              title: 'Image de fond',
              type: 'customImage',
            }),
          ],
          preview: {
            select: { title: 'authorName', subtitle: 'quote' },
            prepare({ title, subtitle }) {
              return { title: pickLocalized(title), subtitle: pickLocalized(subtitle) }
            },
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
