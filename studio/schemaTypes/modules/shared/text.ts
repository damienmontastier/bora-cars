import { BlockContentIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'
import { pickLocalized, pickLocalizedBlock } from '../../../lib/preview'

export const textType = defineType({
  name: 'textBlock',
  title: 'Text Block',
  type: 'object',
  icon: BlockContentIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'internationalizedArrayString',
      description: 'Petit label inline avec le premier bloc, ex: (de A à Z)',
    }),
    defineField({
      name: 'body',
      title: 'Contenu',
      type: 'internationalizedArrayBlock',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { eyebrow: 'eyebrow', body: 'body' },
    prepare({ eyebrow, body }) {
      const e = pickLocalized(eyebrow)
      const text = pickLocalizedBlock(body)
      return {
        title: 'Text',
        subtitle: e ? `${e} — ${text}` : text,
      }
    },
  },
})
