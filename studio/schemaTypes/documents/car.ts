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
      type: 'internationalizedArrayString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: (doc: any) => {
          const pickFr = (v: { language: string, value: string }[]) =>
            v?.find(x => x.language === 'fr')?.value ?? v?.[0]?.value ?? ''
          return `${pickFr(doc.marque)}-${pickFr(doc.modele)}`
        },
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'modele',
      title: 'Modèle',
      type: 'internationalizedArrayString',
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
      const pickFr = (v: { language: string, value: string }[] | string | undefined) =>
        Array.isArray(v) ? (v.find((x) => x.language === 'fr')?.value ?? v[0]?.value ?? '') : (v ?? '')
      return { title: [pickFr(marque as never), pickFr(modele as never)].filter(Boolean).join(' ') }
    },
  },
})
