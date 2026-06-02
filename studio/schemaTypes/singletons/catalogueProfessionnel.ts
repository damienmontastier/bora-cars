import { CaseIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'
import { GROUPS } from '../constants'
import { seoType } from '../objects/seo'

const TITLE = 'Catalogue professionnel'

export const catalogueProfessionnelType = defineType({
  name: 'catalogueProfessionnel',
  title: TITLE,
  type: 'document',
  icon: CaseIcon,
  groups: [...GROUPS, { name: 'whatsapp', title: 'WhatsApp' }],
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'internationalizedArrayString',
      group: 'editorial',
    }),
    defineField({
      name: 'contentPreFooter',
      title: 'Contenu (Bloc texte)',
      type: 'textBlock',
      group: 'editorial',
      validation: Rule => Rule.required(),
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
