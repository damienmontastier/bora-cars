import { BlockContentIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const textType = defineType({
  name: 'textBlock',
  title: 'Text Block',
  type: 'object',
  icon: BlockContentIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'Petit label inline avec le premier bloc, ex: (de A à Z)',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'body',
      title: 'Contenu',
      type: 'array',
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'H3', value: 'h3' },
          ],
          lists: [],
          marks: {
            decorators: [
              { title: 'Gras', value: 'strong' },
              { title: 'Italique', value: 'em' },
            ],
            annotations: [],
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { eyebrow: 'eyebrow', body: 'body' },
    prepare({ eyebrow, body }) {
      const firstBlock = body?.[0]
      const text = firstBlock?.children?.map((c: any) => c.text).join('') ?? ''
      return {
        title: 'Text',
        subtitle: eyebrow ? `${eyebrow} — ${text}` : text,
      }
    },
  },
})
