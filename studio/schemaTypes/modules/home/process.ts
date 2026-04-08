import { OlistIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const processType = defineType({
  name: 'process',
  title: 'Process Steps',
  type: 'object',
  icon: OlistIcon,
  fieldsets: [
    {
      name: 'steps',
      title: 'Étapes',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'cta',
      title: 'Appel à l\'action',
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({
      name: 'steps',
      title: 'Étapes du processus',
      type: 'array',
      fieldset: 'steps',
      description: 'Chaque étape représente une ligne dans la liste numérotée',
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Intitulé',
              type: 'string',
              validation: (Rule) => Rule.required().max(40),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              description: 'Affiché sur mobile uniquement',
              type: 'text',
              rows: 2,
              validation: (Rule) => Rule.max(100),
            }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'description' },
          },
        }),
      ],
    }),

    defineField({
      name: 'cta',
      title: 'Bouton',
      type: 'customLink',
      fieldset: 'cta',
      options: { enableText: true },
    }),
  ],
  preview: {
    select: { steps: 'steps' },
    prepare({ steps }) {
      return { title: 'Process Steps', subtitle: `${steps?.length ?? 0} étapes` }
    },
  },
})
