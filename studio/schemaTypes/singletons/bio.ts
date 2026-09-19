import { LinkIcon } from '@sanity/icons/Link'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { seoType } from '../objects/seo'
import { BioWhatsappMessageInput } from '../../components/WhatsappTokenEditor'

const TITLE = 'Bio (réseaux sociaux)'

export const bioType = defineType({
  name: 'bio',
  title: TITLE,
  type: 'document',
  icon: LinkIcon,
  groups: [
    { name: 'voitures', title: 'Voitures', default: true },
    { name: 'whatsapp', title: 'WhatsApp' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'cars',
      title: 'Voitures citées sur les réseaux',
      type: 'array',
      group: 'voitures',
      description:
        'Une voiture = une story plein écran. L’ordre de cette liste = l’ordre d’affichage : glissez la voiture du dernier post tout en haut, elle reçoit le badge « Dernier post ». Au-delà de 6 voitures la page devient longue : retirez les plus anciennes. Photo principale utilisée en cadrage vertical — réglez le point focal (hotspot) de la voiture si besoin. Une voiture non publiée (brouillon) n’apparaîtra pas sur le site.',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'car' }],
        }),
      ],
      validation: Rule => Rule.unique(),
    }),
    defineField({
      name: 'whatsappMessage',
      title: 'Message WhatsApp pré-rempli',
      type: 'internationalizedArrayText',
      group: 'whatsapp',
      description:
        'Gabarit du message pré-rempli par le bouton WhatsApp de chaque story. Glisse les tags dans le texte : ils sont remplacés par la voiture de la story — Marque, Modèle, Prix (montant avec devise, vide si pas de prix), Période (« par jour » / « par mois »), Lien fiche. Ex. « Bonjour, j’ai vu la [Marque] [Modèle] sur votre Instagram, est-elle disponible ? ». Laisser vide pour un message vierge.',
      components: { input: BioWhatsappMessageInput },
    }),
    seoType,
  ],
  preview: {
    prepare() {
      return { media: LinkIcon, subtitle: 'Singleton — /bio', title: TITLE }
    },
  },
})
