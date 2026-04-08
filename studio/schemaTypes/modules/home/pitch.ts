import { BlockContentIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const pitchType = defineType({
  name: 'pitch',
  title: 'Pitch',
  type: 'object',
  icon: BlockContentIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      validation: (Rule) => Rule.max(20),
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: 'subtext',
      title: 'Subtext',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.max(60),
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
      return { title: 'Pitch', subtitle }
    },
  },
})
