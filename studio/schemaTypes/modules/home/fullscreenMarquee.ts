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
      type: 'customLink',
      options: { enableText: true },
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
