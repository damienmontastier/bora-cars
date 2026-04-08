import { defineField, defineType } from 'sanity'

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
      type: 'string',
      description: 'Décrit l\'image pour les moteurs de recherche et les lecteurs d\'écran',
      validation: (Rule) => Rule.required().error('Texte alternatif est requis.'),
      hidden: ({ parent }) => !parent?.asset,
    }),
    defineField({
      name: 'caption',
      title: 'Légende',
      type: 'string',
      description: 'Optionnel — affiché sous l\'image si le composant le supporte',
      hidden: ({ parent }) => !parent?.asset,
    }),
  ],
  preview: {
    select: {
      imageUrl: 'asset.url',
      title: 'alt',
    },
  },
})
