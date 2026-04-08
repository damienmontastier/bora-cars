import { TagIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const brandsSectionType = defineType({
  name: 'brandsSection',
  title: 'Brands Section',
  type: 'object',
  icon: TagIcon,
  fieldsets: [
    {
      name: 'intro',
      title: 'Introduction',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'brands',
      title: 'Marques',
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      fieldset: 'intro',
      description: 'Texte d\'accroche affiché au-dessus du défilé de marques',
      rows: 2,
      validation: (Rule) => Rule.required().max(60),
    }),

    defineField({
      name: 'brands',
      title: 'Marques',
      type: 'array',
      fieldset: 'brands',
      description: 'Noms des marques automobiles affichés dans le défilé',
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Nom de la marque',
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
