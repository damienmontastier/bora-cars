import { HomeIcon } from '@sanity/icons/Home'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { HeroArrayItem } from '../../components/HeroArrayItem'
import { validateHeroModules } from '../../lib/heroValidation'
import { ModuleThumbnailPreview } from '../../components/ModuleThumbnailPreview'
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
      validation: Rule => Rule.custom((modules: Array<{ _type: string }> | undefined) => validateHeroModules(modules)),
      of: [
        defineArrayMember({ type: 'hero', components: { item: HeroArrayItem, preview: ModuleThumbnailPreview } }),
        defineArrayMember({ type: 'serviceCards' }),
        defineArrayMember({ type: 'pitch' }),
        defineArrayMember({ type: 'process' }),
        defineArrayMember({ type: 'brandsSection' }),
        defineArrayMember({ type: 'fullscreenMarquee' }),
        defineArrayMember({ type: 'faq' }),
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
