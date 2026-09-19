import { CogIcon } from '@sanity/icons/Cog'
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
    { name: 'business', title: 'Établissement (SEO local)' },
    { name: 'devise', title: 'Devise' },
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
      name: 'email',
      title: 'Email (marque)',
      type: 'string',
      group: 'business',
      description: 'Email de contact public commun (schema.org email de l’Organization).',
    }),
    defineField({
      name: 'priceRange',
      title: 'Gamme de prix',
      type: 'string',
      group: 'business',
      initialValue: '€€€€',
      description: 'Indicateur schema.org priceRange (appliqué à chaque agence).',
      options: {
        list: [
          { title: '€', value: '€' },
          { title: '€€', value: '€€' },
          { title: '€€€', value: '€€€' },
          { title: '€€€€', value: '€€€€' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'areaServed',
      title: 'Zones desservies',
      type: 'array',
      group: 'business',
      description: 'Villes / régions couvertes, ex. Paris, Genève, Monaco (schema.org areaServed de la marque).',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'socialLinks',
      title: 'Réseaux sociaux (marque)',
      type: 'array',
      group: 'business',
      description: 'URLs des profils sociaux officiels de la MARQUE (Instagram, LinkedIn…) → schema.org sameAs de l’Organization. Les fiches Google de chaque agence se mettent dans le champ « Lien » du Lieu correspondant, pas ici.',
      of: [defineArrayMember({ type: 'url' })],
    }),
    defineField({
      name: 'tauxChf',
      title: 'Taux de conversion CHF',
      type: 'number',
      group: 'devise',
      description: 'Combien vaut 1 € en francs suisses (ex. 0.94). Laisser vide pour masquer le sélecteur EUR / CHF sur les fiches voiture et les cartes du catalogue.',
      validation: (Rule) => Rule.positive(),
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
