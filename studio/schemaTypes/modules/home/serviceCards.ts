import { ImagesIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { GridMakerInput } from '../../../components/GridMakerInput'

export const serviceCardsType = defineType({
  name: 'serviceCards',
  title: 'Service Cards',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'cards',
      title: 'Cartes de service',
      type: 'array',
      description: 'Chaque carte représente un service ou une catégorie de véhicules. Faites glisser pour réorganiser.',
      validation: (Rule) => Rule.required().min(1),
      components: { input: GridMakerInput },
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'cardType',
              title: 'Format',
              type: 'string',
              options: {
                list: [
                  { title: 'XXL — Large paysage', value: 'xxl' },
                  { title: 'XL — Paysage', value: 'xl' },
                  { title: 'L — Portrait grand', value: 'l' },
                  { title: 'M — Portrait', value: 'm' },
                ],
                layout: 'radio',
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'media',
              title: 'Média',
              type: 'customMedia',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'categoryLabel',
              title: 'Catégorie',
              type: 'string',
              description: 'Ex: "Mariage", "SUV Premium"…',
              validation: (Rule) => Rule.required().max(35),
            }),
            defineField({
              name: 'subtitle',
              title: 'Sous-titre',
              type: 'string',
              validation: (Rule) => Rule.max(30),
            }),
            defineField({
              name: 'link',
              title: 'Lien',
              type: 'customLink',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'grid',
              title: 'Position dans la grille',
              type: 'object',
              hidden: true,
              fields: [
                defineField({ name: 'x', title: 'X', type: 'number', initialValue: 0 }),
                defineField({ name: 'y', title: 'Y', type: 'number', initialValue: 0 }),
                defineField({ name: 'w', title: 'Largeur', type: 'number', initialValue: 4 }),
                defineField({ name: 'h', title: 'Hauteur', type: 'number', initialValue: 8 }),
              ],
            }),
          ],
          preview: {
            select: { title: 'categoryLabel', subtitle: 'cardType' },
            prepare({ title, subtitle }) {
              const labels: Record<string, string> = { xxl: 'XXL', xl: 'XL', l: 'L', m: 'M' }
              return { title, subtitle: labels[subtitle] ?? subtitle }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { cards: 'cards' },
    prepare({ cards }) {
      return { title: 'Service Cards', subtitle: `${cards?.length ?? 0} cartes` }
    },
  },
})
