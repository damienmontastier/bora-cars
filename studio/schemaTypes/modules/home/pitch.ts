import { BlockContentIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const pitchType = defineType({
  name: 'pitch',
  title: 'Pitch',
  type: 'object',
  icon: BlockContentIcon,
  fieldsets: [
    {
      name: 'content',
      title: 'Contenu',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'cta',
      title: 'Appel à l\'action',
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      fieldset: 'content',
      description: 'Petit texte affiché au-dessus du titre',
      validation: (Rule) => Rule.max(20),
    }),
    defineField({
      name: 'heading',
      title: 'Titre',
      type: 'string',
      fieldset: 'content',
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: 'subtext',
      title: 'Sous-titre',
      type: 'text',
      fieldset: 'content',
      rows: 2,
      validation: (Rule) => Rule.max(60),
    }),

    defineField({
      name: 'cta',
      title: 'Bouton',
      type: 'customLink',
      fieldset: 'cta',
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
