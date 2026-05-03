import { ArchiveIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'
import { GROUPS } from '../constants'
import { seoType } from '../objects/seo'

const TITLE = 'Catalogue'

export const catalogueType = defineType({
  name: 'catalogue',
  title: TITLE,
  type: 'document',
  icon: ArchiveIcon,
  groups: GROUPS,
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'internationalizedArrayString',
      group: 'editorial',
    }),
    seoType,
  ],
  preview: {
    prepare() {
      return { media: ArchiveIcon, subtitle: 'Singleton', title: TITLE }
    },
  },
})
