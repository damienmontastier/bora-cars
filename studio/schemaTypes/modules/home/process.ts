import { OlistIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const processType = defineType({
  name: 'process',
  title: 'Process Steps',
  type: 'object',
  icon: OlistIcon,
  fields: [
    defineField({
      name: 'steps',
      title: 'Étapes du processus',
      type: 'array',
      description: 'Chaque étape représente une ligne dans la liste numérotée',
      validation: (Rule) => Rule.required().min(1),
      of: [defineArrayMember({ type: 'processStep' })],
    }),
  ],
  preview: {
    select: { steps: 'steps' },
    prepare({ steps }) {
      return { title: 'Process Steps', subtitle: `${steps?.length ?? 0} étapes` }
    },
  },
})
