import { CaseIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { HeroArrayItem } from '../../components/HeroArrayItem'
import { ModuleThumbnailPreview } from '../../components/ModuleThumbnailPreview'
import { GROUPS } from '../constants'
import { seoType } from '../objects/seo'

const TITLE = 'Professionnel'

export const professionnelType = defineType({
  name: 'professionnel',
  title: TITLE,
  type: 'document',
  icon: CaseIcon,
  groups: [...GROUPS, { name: 'whatsapp', title: 'WhatsApp' }],
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
        defineArrayMember({ type: 'title' }),
        defineArrayMember({ type: 'textBlock' }),
        defineArrayMember({ type: 'faq' }),
        defineArrayMember({ type: 'cardsColumn' }),
        defineArrayMember({ type: 'fullscreenMarquee' }),
      ],
    }),
    defineField({
      name: 'whatsappMessage',
      title: 'Message WhatsApp pré-rempli',
      type: 'internationalizedArrayText',
      group: 'whatsapp',
      description: 'Texte pré-rempli dans WhatsApp au clic sur un CTA de contact de cette page. Laisser vide pour un message vierge.',
    }),
    seoType,
  ],
  preview: {
    prepare() {
      return { media: CaseIcon, subtitle: 'Singleton', title: TITLE }
    },
  },
})
