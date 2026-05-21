import { TagIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { ModuleThumbnailPreview } from '../../../components/ModuleThumbnailPreview'
import { pickLocalized } from '../../../lib/preview'
import { requireAllLanguages } from '../../../lib/i18nValidation'

export const brandsSectionType = defineType({
  name: 'brandsSection',
  title: 'Brands Section',
  type: 'object',
  icon: TagIcon,
  components: { preview: ModuleThumbnailPreview },
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
      validation: (Rule) => requireAllLanguages(Rule),
    }),
    defineField({
      name: 'cta',
      title: 'CTA',
      type: 'object',
      fieldset: 'text',
      fields: [
        defineField({
          name: 'label',
          title: 'Texte du bouton',
          type: 'internationalizedArrayString',
        }),
        defineField({
          name: 'link',
          title: 'Lien',
          type: 'customLink',
        }),
      ],
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'internationalizedArrayString',
      fieldset: 'text',
      description: 'Texte affiché en bas des listes (ex: "Une collection soigneusement sélectionnée.")',
      validation: (Rule) => requireAllLanguages(Rule),
    }),
  ],
  preview: {
    select: { subtitle: 'heading' },
    prepare({ subtitle }) {
      return { title: 'Brands Section', subtitle: pickLocalized(subtitle) }
    },
  },
})
