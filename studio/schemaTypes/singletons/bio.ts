import { LinkIcon } from '@sanity/icons/Link'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { seoType } from '../objects/seo'

const TITLE = 'Bio (réseaux sociaux)'

/**
 * Page « link in bio » — boracars.com/bio (maquette Figma « piste C · Stories »).
 *
 * Destination unique du lien en bio Instagram : quand un post/story parle d'une
 * voiture (« lien en bio »), on l'ajoute ici et le visiteur la retrouve en tête
 * de page, en plein écran, avec WhatsApp et la fiche. C'est une liste ORDONNÉE à
 * la main (glisser-déposer) et non un filtre automatique : l'ordre doit suivre la
 * chronologie des publications, pas celle du catalogue.
 *
 * Titre, surtitre et textes fixes (« Dernier post », boutons, fin de liste) sont
 * dans le Glossaire, onglet « Bio (Instagram) » : la page n'a que 3 champs.
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
        'Gabarit du message pré-rempli par le bouton WhatsApp de chaque story. Jetons remplacés par la voiture de la story : {marque}, {modele}, {prix} (montant avec devise, vide si pas de prix), {periode} (« par jour » / « par mois »), {url} (lien de sa fiche). Ex. « Bonjour, j’ai vu la {marque} {modele} sur votre Instagram, est-elle disponible ? ». Laisser vide pour un message vierge.',
    }),
    seoType,
  ],
  preview: {
    prepare() {
      return { media: LinkIcon, subtitle: 'Singleton — /bio', title: TITLE }
    },
  },
})
