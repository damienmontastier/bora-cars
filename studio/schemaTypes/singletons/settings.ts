import { CogIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { seoType } from '../objects/seo'

const TITLE = 'Paramètres'

export const settingsType = defineType({
  name: 'settings',
  title: TITLE,
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'global', title: 'Global', default: true },
    { name: 'partners', title: 'Partenaires' },
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
      name: 'partners',
      title: 'Logos partenaires',
      type: 'array',
      group: 'partners',
      description: 'Logos affichés dans la marquee "Partenaires" (pages Accueil, Pro, Contact)',
      of: [
        defineArrayMember({ type: 'customImage' }),
      ],
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
