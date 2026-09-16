import { LinkIcon } from '@sanity/icons/Link'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { seoType } from '../objects/seo'

const TITLE = 'Bio (réseaux sociaux)'

/**
 * Page « link in bio » — boracars.com/bio.
 *
 * Destination unique du lien en bio Instagram : quand un post/story parle d'une
 * voiture (« lien en bio »), on l'ajoute ici et le visiteur la retrouve en haut
 * de page. C'est une liste ORDONNÉE à la main (glisser-déposer) et non un filtre
 * automatique : l'ordre doit suivre la chronologie des publications, pas celle
 * du catalogue.
 *
 * La page est volontairement en `noindex, follow` côté site (contenu qui
 * doublonne le catalogue + durée de vie courte) — cf. `web/app/pages/bio.vue`.
 */
export const bioType = defineType({
  name: 'bio',
  title: TITLE,
  type: 'document',
  icon: LinkIcon,
  groups: [
    { name: 'editorial', title: 'Editorial', default: true },
    { name: 'voitures', title: 'Voitures' },
    { name: 'liens', title: 'Liens rapides' },
    { name: 'whatsapp', title: 'WhatsApp' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'internationalizedArrayString',
      group: 'editorial',
      description: 'Titre affiché en haut de la page (ex. « Vu sur nos réseaux »).',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'internationalizedArrayText',
      group: 'editorial',
      description: 'Texte d’introduction sous le titre. Facultatif.',
    }),
    defineField({
      name: 'cars',
      title: 'Voitures citées sur les réseaux',
      type: 'array',
      group: 'voitures',
      description:
        'Les voitures mentionnées dans les posts / stories. L’ordre de cette liste = l’ordre d’affichage sur la page : glissez la dernière publiée tout en haut. Une voiture non publiée (brouillon) n’apparaîtra pas sur le site.',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'car' }],
        }),
      ],
      validation: Rule => Rule.unique(),
    }),
    defineField({
      name: 'quickLinks',
      title: 'Liens rapides',
      type: 'array',
      group: 'liens',
      description:
        'Boutons affichés sous le titre (WhatsApp, catalogue, contact, Instagram…). Laisser vide pour n’afficher que les voitures.',
      of: [
        defineArrayMember({
          type: 'navLink',
        }),
      ],
    }),
    defineField({
      name: 'whatsappMessage',
      title: 'Message WhatsApp pré-rempli',
      type: 'internationalizedArrayText',
      group: 'whatsapp',
      description:
        'Texte pré-rempli dans WhatsApp au clic sur un lien rapide WhatsApp de cette page. Utile pour repérer les contacts venus d’Instagram (ex. « Bonjour, je viens de votre Instagram… »). Laisser vide pour un message vierge.',
    }),
    seoType,
  ],
  preview: {
    prepare() {
      return { media: LinkIcon, subtitle: 'Singleton — /bio', title: TITLE }
    },
  },
})
