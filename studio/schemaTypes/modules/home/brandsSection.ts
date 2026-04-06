import { TagIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const brandsSectionType = defineType({
  name: 'brandsSection',
  title: 'Brands Section',
  type: 'object',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: 'brands',
      title: 'Brands',
      type: 'array',
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: { select: { title: 'name' } },
        }),
      ],
    }),
  ],
  preview: {
    select: { subtitle: 'description' },
    prepare({ subtitle }) {
      return { title: 'Brands Section', subtitle }
    },
  },
})
