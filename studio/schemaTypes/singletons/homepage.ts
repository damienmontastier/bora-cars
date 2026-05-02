import { HomeIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { HeroArrayItem } from '../../components/HeroArrayItem'
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
      validation: Rule => Rule.custom((modules: any[]) => {
        if (!modules?.length) return true
        const heroIndex = modules.findIndex(m => m._type === 'hero')
        if (heroIndex > 0) return 'Le module Hero doit toujours être en première position'
        return true
      }),
      of: [
        defineArrayMember({ type: 'hero', components: { item: HeroArrayItem } }),
        defineArrayMember({ type: 'serviceCards' }),
        defineArrayMember({ type: 'pitch' }),
        defineArrayMember({ type: 'process' }),
        defineArrayMember({ type: 'brandsSection' }),
        defineArrayMember({ type: 'servicePitch' }),
        defineArrayMember({ type: 'fullscreenMarquee' }),
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
