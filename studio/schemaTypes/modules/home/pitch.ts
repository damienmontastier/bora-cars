import { BlockContentIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'
import { pickLocalized } from '../../../lib/preview'
import { requireAllLanguages } from '../../../lib/i18nValidation'

export const pitchType = defineType({
  name: 'pitch',
  title: 'Pitch',
  type: 'object',
  icon: BlockContentIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'internationalizedArrayString',
      description: 'Petit texte affiché au-dessus du titre',
    }),
    defineField({
      name: 'heading',
      title: 'Titre',
      type: 'internationalizedArrayText',
      validation: (Rule) => requireAllLanguages(Rule),
    }),
    defineField({
      name: 'subtext',
      title: 'Texte au-dessus du CTA',
      type: 'internationalizedArrayText',
      description: 'Courte phrase affichée juste au-dessus du bouton. Le bouton est défini dans Paramètres → Global.',
    }),
  ],
  preview: {
    select: { subtitle: 'heading' },
    prepare({ subtitle }) {
      return { title: 'Pitch', subtitle: pickLocalized(subtitle) }
    },
  },
})
