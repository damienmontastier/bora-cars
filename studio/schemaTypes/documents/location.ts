import { PinIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const locationType = defineType({
  name: 'location',
  title: 'Lieu',
  type: 'document',
  icon: PinIcon,
  fields: [
    defineField({
      name: 'city',
      title: 'Ville',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'address',
      title: 'Adresse',
      type: 'text',
      rows: 2,
      description: 'Adresse postale complète de l\'agence',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'customLink',
      description: 'Ex: mailto:contact@bora-cars.fr',
      options: { enableText: true },
    }),
    defineField({
      name: 'phone',
      title: 'Téléphone',
      type: 'customLink',
      description: 'Ex: tel:+33612345678',
      options: { enableText: true },
    }),
  ],
  preview: {
    select: { title: 'city', subtitle: 'address' },
  },
})
