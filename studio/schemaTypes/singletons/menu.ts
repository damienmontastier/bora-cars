import { MenuIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

const TITLE = 'Menu'

export const menuType = defineType({
  name: 'menu',
  title: TITLE,
  type: 'document',
  icon: MenuIcon,
  fields: [
    // Labels du bouton burger
    defineField({
      name: 'menuLabel',
      title: 'Label "Menu"',
      type: 'string',
      initialValue: 'Menu',
    }),
    defineField({
      name: 'closeLabel',
      title: 'Label "Close"',
      type: 'string',
      initialValue: 'Close',
    }),

    // CTA dans la barre du menu
    defineField({
      name: 'cta',
      title: 'CTA',
      type: 'customLink',
      options: { enableText: true },
    }),

    // Liens de navigation dans le panel
    defineField({
      name: 'links',
      title: 'Liens de navigation',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'customLink',
          options: { enableText: true },
        }),
      ],
    }),

    // Lieux affichés en bas du panel
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
  ],
  preview: {
    prepare() {
      return { media: MenuIcon, subtitle: 'Singleton', title: TITLE }
    },
  },
})
