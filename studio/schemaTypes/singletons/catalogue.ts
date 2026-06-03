import { ArchiveIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'
import { seoType } from '../objects/seo'
import { CatalogueCarsPreview } from '../../components/CatalogueCarsPreview'

const TITLE = 'Catalogue'

export const catalogueType = defineType({
  name: 'catalogue',
  title: TITLE,
  type: 'document',
  icon: ArchiveIcon,
  groups: [
    { name: 'editorial', title: 'Editorial', default: true },
    { name: 'apercu', title: 'Aperçu' },
    { name: 'seo', title: 'SEO' },
    { name: 'whatsapp', title: 'WhatsApp' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'internationalizedArrayString',
      group: 'editorial',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'internationalizedArrayText',
      group: 'editorial',
      description: 'Texte d’introduction affiché en haut du catalogue.',
    }),
    defineField({
      name: 'carsPreview',
      title: 'Véhicules dans ce catalogue',
      type: 'string',
      group: 'apercu',
      readOnly: true,
      components: { input: CatalogueCarsPreview as any },
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
      return { media: ArchiveIcon, subtitle: 'Singleton', title: TITLE }
    },
  },
})
