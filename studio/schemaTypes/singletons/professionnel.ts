import { CaseIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { GROUPS } from '../constants'
import { seoType } from '../objects/seo'

const TITLE = 'Professionnel'

export const professionnelType = defineType({
  name: 'professionnel',
  title: TITLE,
  type: 'document',
  icon: CaseIcon,
  groups: GROUPS,
  fields: [
    defineField({
      name: 'modules',
      title: 'Modules',
      type: 'array',
      group: 'editorial',
      of: [
        defineArrayMember({ type: 'hero' }),
        defineArrayMember({ type: 'title' }),
        defineArrayMember({ type: 'textBlock' }),
        defineArrayMember({ type: 'faq' }),
        defineArrayMember({ type: 'cardsColumn' }),
      ],
    }),
    seoType,
  ],
  preview: {
    prepare() {
      return { media: CaseIcon, subtitle: 'Singleton', title: TITLE }
    },
  },
})
