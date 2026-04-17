import { EnvelopeIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'
import { GROUPS } from '../constants'
import { seoType } from '../objects/seo'

const TITLE = 'Contact'

export const contactType = defineType({
  name: 'contact',
  title: TITLE,
  type: 'document',
  icon: EnvelopeIcon,
  groups: GROUPS,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      group: 'editorial',
    }),
    seoType,
  ],
  preview: {
    prepare() {
      return { media: EnvelopeIcon, subtitle: 'Singleton', title: TITLE }
    },
  },
})
