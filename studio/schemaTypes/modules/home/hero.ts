import { ImagesIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const heroType = defineType({
  name: 'hero',
  title: 'Hero',
  type: 'object',
  icon: ImagesIcon,
  fieldsets: [
    {
      name: 'media',
      title: 'Média',
      options: { collapsible: true, collapsed: false },
    },
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
      name: 'backgroundMedia',
      title: 'Média de fond',
      type: 'customMedia',
      fieldset: 'media',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'heading',
      title: 'Titre principal',
      type: 'string',
      fieldset: 'content',
      validation: (Rule) => Rule.required().max(65),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'text',
      fieldset: 'content',
      rows: 3,
      validation: (Rule) => Rule.required().max(160),
    }),

    defineField({
      name: 'subtext',
      title: 'Texte au-dessus du CTA',
      type: 'string',
      fieldset: 'cta',
      description: 'Courte phrase affichée juste au-dessus du bouton. Le bouton lui-même est défini dans Paramètres → Global.',
      validation: (Rule) => Rule.max(80),
    }),
  ],
  preview: {
    select: { subtitle: 'heading' },
    prepare({ subtitle }) {
      return { title: 'Hero', subtitle }
    },
  },
})
