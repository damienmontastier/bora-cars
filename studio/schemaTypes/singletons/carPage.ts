import { TagIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'
import { GROUPS } from '../constants'
import { seoType } from '../objects/seo'
import { WhatsappTemplateInput } from '../../components/WhatsappTemplateInput'

const TITLE = 'Page Voiture'

export const carPageType = defineType({
  name: 'carPage',
  title: TITLE,
  type: 'document',
  icon: TagIcon,
  groups: [...GROUPS, { name: 'specs', title: 'Specs' }, { name: 'whatsapp', title: 'WhatsApp' }],
  fields: [
    defineField({
      name: 'contentPreFooter',
      title: 'Contenu (Bloc texte)',
      type: 'textBlock',
      group: 'editorial',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'specsLayout',
      title: 'Mise en page des specs (global)',
      type: 'specsLayout',
      group: 'specs',
      description: 'Ordre et répartition des caractéristiques, communs à TOUTES les fiches voiture. Sur une voiture, une spec ne s\'affiche que si son champ est renseigné — laisse le champ vide pour la masquer sur ce véhicule.',
      initialValue: {
        fixed: ['gamme', 'annee', 'boiteVitesse', 'carburant'],
        list: ['nombrePlaces', 'nombrePortes', 'teinteExterieure', 'teinteInterieure'],
      },
    }),
    defineField({
      name: 'whatsappMessage',
      title: 'Message WhatsApp (template)',
      type: 'internationalizedArrayText',
      group: 'whatsapp',
      description: 'Modèle du message pré-rempli dans WhatsApp (CTA « Contacter » de la fiche). Insère les variables via les boutons au-dessus du champ. Laisser vide pour le message par défaut.',
      components: { input: WhatsappTemplateInput },
    }),
    seoType,
  ],
  preview: {
    prepare() {
      return { media: TagIcon, subtitle: 'Singleton', title: TITLE }
    },
  },
})
