import { ImagesIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const heroType = defineType({
  name: 'hero',
  title: 'Hero',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'backgroundMedia',
      title: 'Background media',
      type: 'customMedia',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required().max(40),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required().max(160),
    }),
    defineField({
      name: 'subtext',
      title: 'Subtext',
      description: 'Texte affiché au-dessus du CTA',
      type: 'string',
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: 'cta',
      title: 'CTA',
      type: 'customLink',
      options: { enableText: true },
    }),
  ],
  preview: {
    select: { subtitle: 'heading' },
    prepare({ subtitle }) {
      return { title: 'Hero', subtitle }
    },
  },
})
