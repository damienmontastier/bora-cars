import { HomeIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { GROUPS } from '../constants'
import { seoType } from '../objects/seo'

const TITLE = 'Homepage'

export const homepageType = defineType({
  name: 'homepage',
  title: TITLE,
  type: 'document',
  icon: HomeIcon,
  groups: GROUPS,
  fields: [
    defineField({
      name: 'modules',
      title: 'Modules',
      type: 'array',
      group: 'editorial',
      of: [
        defineArrayMember({ type: 'hero' }),
        defineArrayMember({ type: 'serviceCards' }),
        defineArrayMember({ type: 'pitch' }),
        defineArrayMember({ type: 'process' }),
        defineArrayMember({ type: 'brandsSection' }),
        defineArrayMember({ type: 'servicePitch' }),
      ],
    }),
    seoType,
  ],
  preview: {
    prepare() {
      return {
        media: HomeIcon,
        subtitle: 'Singleton',
        title: TITLE,
      }
    },
  },
})
