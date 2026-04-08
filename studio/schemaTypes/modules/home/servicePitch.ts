import { BlockContentIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const servicePitchType = defineType({
  name: 'servicePitch',
  title: 'Service Pitch',
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
      name: 'body',
      title: 'Corps de texte',
      type: 'text',
      fieldset: 'content',
      rows: 4,
      validation: (Rule) => Rule.required().max(160),
    }),

    defineField({
      name: 'ctaLabel',
      title: 'Libellé du bouton',
      type: 'string',
      fieldset: 'cta',
      validation: (Rule) => Rule.required().max(30),
    }),
    defineField({
      name: 'ctaUrl',
      title: 'URL du bouton',
      type: 'url',
      fieldset: 'cta',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { subtitle: 'heading' },
    prepare({ subtitle }) {
      return { title: 'Service Pitch', subtitle }
    },
  },
})
