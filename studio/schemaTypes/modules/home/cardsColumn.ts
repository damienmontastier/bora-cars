import { StackCompactIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { pickLocalized } from '../../../lib/preview'

export const cardsColumnType = defineType({
  name: 'cardsColumn',
  title: 'Cards Column',
  type: 'object',
  icon: StackCompactIcon,
  fieldsets: [
    {
      name: 'intro',
      title: 'Intro (colonne gauche)',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'cards',
      title: 'Cartes',
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({
      name: 'heading',
      title: 'Titre',
      type: 'internationalizedArrayText',
      fieldset: 'intro',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subtext',
      title: 'Texte au-dessus du CTA',
      type: 'internationalizedArrayText',
      fieldset: 'intro',
      description: 'Courte phrase affichée juste au-dessus du bouton.',
    }),
    defineField({
      name: 'cards',
      title: 'Cartes',
      type: 'array',
      fieldset: 'cards',
      description: 'Chaque carte représente une ligne dans la colonne',
      validation: (Rule) => Rule.required().min(1),
      of: [defineArrayMember({ type: 'processStep' })],
    }),
  ],
  preview: {
    select: { heading: 'heading' },
    prepare({ heading }) {
      return { title: 'Cards Column', subtitle: pickLocalized(heading) }
    },
  },
})
