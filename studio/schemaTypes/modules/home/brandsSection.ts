import { TagIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { pickLocalized } from '../../../lib/preview'

export const brandsSectionType = defineType({
  name: 'brandsSection',
  title: 'Brands Section',
  type: 'object',
  icon: TagIcon,
  fieldsets: [
    {
      name: 'lists',
      title: 'Listes de voitures',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'text',
      title: 'Texte',
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({
      name: 'carsLeft',
      title: 'Colonne gauche',
      type: 'array',
      fieldset: 'lists',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'car' }] })],
    }),
    defineField({
      name: 'carsRight',
      title: 'Colonne droite',
      type: 'array',
      fieldset: 'lists',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'car' }] })],
    }),

    defineField({
      name: 'description',
      title: 'Description',
      type: 'internationalizedArrayString',
      fieldset: 'text',
      description: 'Texte affiché en bas des listes (ex: "Une collection soigneusement sélectionnée.")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'surtitle',
      title: 'Surtitle',
      type: 'internationalizedArrayString',
      fieldset: 'text',
      description: 'Petit texte avant le heading (ex: "de A à Z")',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'internationalizedArrayText',
      fieldset: 'text',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { subtitle: 'heading' },
    prepare({ subtitle }) {
      return { title: 'Brands Section', subtitle: pickLocalized(subtitle) }
    },
  },
})
