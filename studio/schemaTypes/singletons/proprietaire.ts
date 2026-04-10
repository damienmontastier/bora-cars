import { UserIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { GROUPS } from '../constants'
import { seoType } from '../objects/seo'

const TITLE = 'Propriétaire'

export const proprietaireType = defineType({
  name: 'proprietaire',
  title: TITLE,
  type: 'document',
  icon: UserIcon,
  groups: GROUPS,
  fields: [
    defineField({
      name: 'modules',
      title: 'Modules',
      type: 'array',
      group: 'editorial',
      of: [
        defineArrayMember({ type: 'hero' }),
        defineArrayMember({ type: 'pitch' }),
        defineArrayMember({ type: 'process' }),
      ],
    }),
    seoType,
  ],
  preview: {
    prepare() {
      return { media: UserIcon, subtitle: 'Singleton', title: TITLE }
    },
  },
})
