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
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'customLink',
      options: { enableText: true },
    }),
    defineField({
      name: 'phone',
      title: 'Téléphone',
      type: 'customLink',
      options: { enableText: true },
    }),
  ],
  preview: {
    select: { title: 'city', subtitle: 'address' },
  },
})
