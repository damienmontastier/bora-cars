import { defineField, defineType } from 'sanity'
import { pickLocalized } from '../../lib/preview'
import { requireAllLanguages } from '../../lib/i18nValidation'

export const customImage = defineType({
  name: 'customImage',
  title: 'Image',
  type: 'image',
  options: {
    hotspot: true,
  },
  fields: [
    defineField({
      name: 'alt',
      title: 'Texte alternatif',
      type: 'internationalizedArrayString',
      description: 'Pour l\'accessibilité',
      validation: (Rule, ctx) => (ctx?.hidden ? Rule.skip() : requireAllLanguages(Rule)),
      hidden: ({ parent }) => !parent?.asset,
    }),
  ],
  preview: {
    select: {
      imageUrl: 'asset.url',
      title: 'alt',
    },
    prepare({ imageUrl, title }) {
      return { title: pickLocalized(title), media: imageUrl }
    },
  },
})
