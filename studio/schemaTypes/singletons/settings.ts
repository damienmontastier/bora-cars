import { CogIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'
import { seoType } from '../objects/seo'

const TITLE = 'Paramètres'

export const settingsType = defineType({
  name: 'settings',
  title: TITLE,
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'global', title: 'Global', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'contactLink',
      title: 'Lien de contact',
      type: 'navLink',
      group: 'global',
      description: 'Utilisé pour tous les boutons "Contact" du site',
    }),
    defineField({
      name: 'fallbackTitle',
      title: 'Fallback title (UnderConstruction.vue / Homepage)',
      type: 'internationalizedArrayString',
      group: 'seo',
    }),
    seoType,
  ],
  preview: {
    prepare() {
      return { media: CogIcon, subtitle: 'Singleton', title: TITLE }
    },
  },
})
