import { ImagesIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const serviceCardsType = defineType({
  name: 'serviceCards',
  title: 'Service Cards',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'cards',
      title: 'Cards',
      type: 'array',
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'media',
              title: 'Media',
              type: 'customMedia',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'categoryLabel',
              title: 'Category label',
              type: 'string',
              validation: (Rule) => Rule.required().max(20),
            }),
            defineField({
              name: 'subtitle',
              title: 'Subtitle',
              type: 'string',
              validation: (Rule) => Rule.max(30),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: 'categoryLabel', subtitle: 'subtitle' },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { cards: 'cards' },
    prepare({ cards }) {
      return { title: 'Service Cards', subtitle: `${cards?.length ?? 0} cards` }
    },
  },
})
