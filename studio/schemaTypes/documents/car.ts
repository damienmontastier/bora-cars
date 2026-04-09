import { TagIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const carType = defineType({
  name: 'car',
  title: 'Voiture',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'marque',
      title: 'Marque',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'modele',
      title: 'Modèle',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Lieu',
      type: 'reference',
      to: [{ type: 'location' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'customImage',
    }),
    defineField({
      name: 'rentalTypes',
      title: 'Types de location',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: {
        list: [
          { title: 'Longue durée', value: 'longue-duree' },
          { title: 'Professionnel', value: 'professionnel' },
          { title: 'Particulier', value: 'particulier' },
        ],
        layout: 'grid',
      },
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: { marque: 'marque', modele: 'modele' },
    prepare({ marque, modele }) {
      return { title: [marque, modele].filter(Boolean).join(' ') }
    },
  },
})
