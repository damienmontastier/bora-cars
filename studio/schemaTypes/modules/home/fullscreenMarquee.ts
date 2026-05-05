import { TextIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const fullscreenMarqueeType = defineType({
  name: 'fullscreenMarquee',
  title: 'Fullscreen Marquee',
  type: 'object',
  icon: TextIcon,
  fields: [
    defineField({
      name: 'items',
      title: 'Voitures',
      type: 'array',
      description: 'Voitures à afficher. L\'array est splitté en deux lignes automatiquement.',
      validation: Rule => Rule.min(2),
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'car' }],
        }),
      ],
    }),
    defineField({
      name: 'cta',
      title: 'Bouton CTA',
      description: 'Affiché au milieu de la deuxième ligne.',
      type: 'object',
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
      name: 'backgroundMedia',
      title: 'Média de fond',
      type: 'customMedia',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Fullscreen Marquee' }
    },
  },
})
