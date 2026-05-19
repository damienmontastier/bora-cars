import { TagIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'
import { GROUPS } from '../constants'
import { seoType } from '../objects/seo'

const TITLE = 'Page Voiture'

export const carPageType = defineType({
  name: 'carPage',
  title: TITLE,
  type: 'document',
  icon: TagIcon,
  groups: GROUPS,
  fields: [
    defineField({
      name: 'contentPreFooter',
      title: 'Contenu (Bloc texte)',
      type: 'textBlock',
      group: 'editorial',
      validation: Rule => Rule.required(),
    }),
    seoType,
  ],
  preview: {
    prepare() {
      return { media: TagIcon, subtitle: 'Singleton', title: TITLE }
    },
  },
})
