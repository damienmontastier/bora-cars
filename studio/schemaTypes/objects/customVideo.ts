import { defineField, defineType } from 'sanity'
import { pickLocalized } from '../../lib/preview'
import { requireAllLanguages } from '../../lib/i18nValidation'

export const customVideo = defineType({
  name: 'customVideo',
  title: 'Vidéo',
  type: 'file',
  options: {
    accept: 'video/*',
    collapsible: false,
  },
  fields: [
    defineField({
      name: 'alt',
      title: 'Texte alternatif',
      type: 'internationalizedArrayString',
      description: 'Pour l\'accessibilité',
      validation: (Rule) => requireAllLanguages(Rule),
    }),
    defineField({
      name: 'poster',
      title: 'Image de couverture',
      description: 'Affichée avant que la vidéo ne soit chargée',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: {
      title: 'alt',
    },
    prepare({ title }) {
      return { title: pickLocalized(title) }
    },
  },
})
