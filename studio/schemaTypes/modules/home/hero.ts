import { ImagesIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'
import { pickLocalized } from '../../../lib/preview'

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
      name: 'variant',
      title: 'Variante',
      type: 'string',
      options: {
        list: [
          { title: 'Variante 1', value: 'variant-1' },
          { title: 'Variante 2', value: 'variant-2' },
          { title: 'Variante 3', value: 'variant-3' },
        ],
        layout: 'radio',
      },
      initialValue: 'variant-1',
      validation: (Rule) => Rule.required(),
    }),

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
      type: 'internationalizedArrayString',
      fieldset: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'internationalizedArrayText',
      fieldset: 'content',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'subtext',
      title: 'Texte au-dessus du CTA',
      type: 'internationalizedArrayString',
      fieldset: 'cta',
      description: 'Courte phrase affichée juste au-dessus du bouton. Le bouton lui-même est défini dans Paramètres → Global.',
    }),
  ],
  preview: {
    select: { heading: 'heading' },
    prepare({ heading }) {
      return { title: 'Hero', subtitle: pickLocalized(heading) }
    },
  },
})
