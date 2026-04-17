import { TextIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'
import { pickLocalized } from '../../../lib/preview'

export const titleType = defineType({
  name: 'title',
  title: 'Title',
  type: 'object',
  icon: TextIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'internationalizedArrayString',
      description: 'Petit label inline avec le titre, ex: (FAQ)',
    }),
    defineField({
      name: 'heading',
      title: 'Titre',
      type: 'internationalizedArrayText',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { heading: 'heading', eyebrow: 'eyebrow' },
    prepare({ heading, eyebrow }) {
      const h = pickLocalized(heading)
      const e = pickLocalized(eyebrow)
      return { title: 'Title', subtitle: e ? `${e} — ${h}` : h }
    },
  },
})
