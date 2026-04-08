import { ThListIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

const TITLE = 'Footer'

export const footerType = defineType({
  name: 'footer',
  title: TITLE,
  type: 'document',
  icon: ThListIcon,
  fields: [
    // --- Colonne Contact ---
    defineField({
      name: 'contactTitle',
      title: 'Titre colonne Contact',
      type: 'string',
      initialValue: 'Contact',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'locations',
      title: 'Lieux',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'location' }],
        }),
      ],
    }),
    defineField({
      name: 'contactLinks',
      title: 'Liens de contact',
      description: 'Email, téléphone, ou tout autre lien de contact',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'customLink',
          options: { enableText: true },
        }),
      ],
    }),

    // --- Colonne Sitemap ---
    defineField({
      name: 'sitemapTitle',
      title: 'Titre colonne Sitemap',
      type: 'string',
      initialValue: 'Sitemap',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sitemap',
      title: 'Liens sitemap',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'customLink',
          options: { enableText: true },
        }),
      ],
    }),

    // --- Colonne Réseaux sociaux ---
    defineField({
      name: 'socialsTitle',
      title: 'Titre colonne Réseaux sociaux',
      type: 'string',
      initialValue: 'Socials',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'socials',
      title: 'Liens réseaux sociaux',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'customLink',
          options: { enableText: true },
        }),
      ],
    }),

    // --- Légal ---
    defineField({
      name: 'legalLink',
      title: 'Lien mentions légales',
      type: 'customLink',
      options: { enableText: true },
    }),
  ],
  preview: {
    prepare() {
      return {
        media: ThListIcon,
        subtitle: 'Singleton',
        title: TITLE,
      }
    },
  },
})
