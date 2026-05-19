import { HelpCircleIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { ModuleThumbnailPreview } from '../../../components/ModuleThumbnailPreview'
import { pickLocalized } from '../../../lib/preview'
import { requireAllLanguages } from '../../../lib/i18nValidation'

export const faqType = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'object',
  icon: HelpCircleIcon,
  components: { preview: ModuleThumbnailPreview },
  fields: [
    defineField({
      name: 'items',
      title: 'Questions',
      type: 'array',
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'internationalizedArrayString',
              validation: (Rule) => requireAllLanguages(Rule),
            }),
            defineField({
              name: 'answer',
              title: 'Réponse',
              type: 'internationalizedArrayText',
              validation: (Rule) => requireAllLanguages(Rule),
            }),
          ],
          preview: {
            select: { title: 'question' },
            prepare({ title }) {
              return { title: pickLocalized(title) }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { items: 'items' },
    prepare({ items }) {
      return { title: 'FAQ', subtitle: `${items?.length ?? 0} question(s)` }
    },
  },
})
