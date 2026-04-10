import { TextIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const titleType = defineType({
  name: 'title',
  title: 'Title',
  type: 'object',
  icon: TextIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'Petit label inline avec le titre, ex: (FAQ)',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'heading',
      title: 'Titre',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required().max(200),
    }),
  ],
  preview: {
    select: { heading: 'heading', eyebrow: 'eyebrow' },
    prepare({ heading, eyebrow }) {
      return { title: 'Title', subtitle: eyebrow ? `${eyebrow} — ${heading}` : heading }
    },
  },
})
