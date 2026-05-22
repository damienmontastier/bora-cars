import { UserIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { HeroArrayItem } from '../../components/HeroArrayItem'
import { ModuleThumbnailPreview } from '../../components/ModuleThumbnailPreview'
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
      validation: Rule => Rule.custom((modules: any[]) => {
        if (!modules?.length) return true
        const heroIndex = modules.findIndex(m => m._type === 'hero')
        if (heroIndex > 0) return 'Le module Hero doit toujours être en première position'
        return true
      }),
      of: [
        defineArrayMember({ type: 'hero', components: { item: HeroArrayItem, preview: ModuleThumbnailPreview } }),
        defineArrayMember({ type: 'pitch' }),
        defineArrayMember({ type: 'process' }),
        defineArrayMember({ type: 'testimonials' }),
        defineArrayMember({ type: 'faq' }),
        defineArrayMember({ type: 'cardsColumn' }),
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
