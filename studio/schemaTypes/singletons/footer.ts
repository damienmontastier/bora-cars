import { ThListIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

const TITLE = 'Footer'

export const footerType = defineType({
  name: 'footer',
  title: TITLE,
  type: 'document',
  icon: ThListIcon,
  fieldsets: [
    {
      name: 'contact',
      title: 'Colonne Contact',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'sitemap',
      title: 'Colonne Sitemap',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'socials',
      title: 'Colonne Réseaux sociaux',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'legal',
      title: 'Mentions légales',
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({
      name: 'contactTitle',
      title: 'Titre',
      type: 'string',
      fieldset: 'contact',
      initialValue: 'Contact',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'locations',
      title: 'Lieux',
      type: 'array',
      fieldset: 'contact',
      description: 'Agences affichées dans la colonne Contact',
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
      type: 'array',
      fieldset: 'contact',
      description: 'Email, téléphone, ou tout autre lien de contact',
      of: [
        defineArrayMember({
          type: 'customLink',
          options: { enableText: true },
        }),
      ],
    }),

    defineField({
      name: 'sitemapTitle',
      title: 'Titre',
      type: 'string',
      fieldset: 'sitemap',
      initialValue: 'Sitemap',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sitemap',
      title: 'Liens',
      type: 'array',
      fieldset: 'sitemap',
      description: 'Pages principales du site',
      of: [
        defineArrayMember({
          type: 'customLink',
          options: { enableText: true },
        }),
      ],
    }),

    defineField({
      name: 'socialsTitle',
      title: 'Titre',
      type: 'string',
      fieldset: 'socials',
      initialValue: 'Socials',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'socials',
      title: 'Liens',
      type: 'array',
      fieldset: 'socials',
      description: 'Liens vers les réseaux sociaux (Instagram, LinkedIn…)',
      of: [
        defineArrayMember({
          type: 'customLink',
          options: { enableText: true },
        }),
      ],
    }),

    defineField({
      name: 'legalLink',
      title: 'Lien mentions légales',
      type: 'customLink',
      fieldset: 'legal',
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
