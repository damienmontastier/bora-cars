import { MenuIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

const TITLE = 'Menu'

export const menuType = defineType({
  name: 'menu',
  title: TITLE,
  type: 'document',
  icon: MenuIcon,
  fieldsets: [
    {
      name: 'labels',
      title: 'Labels du bouton burger',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'navigation',
      title: 'Navigation',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'locations',
      title: 'Emplacements',
      description: 'Agences affichées en bas du panneau de navigation',
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({
      name: 'menuLabel',
      title: 'Label "Ouvrir"',
      type: 'internationalizedArrayString',
      fieldset: 'labels',
      description: 'Texte affiché sur le bouton pour ouvrir le menu',
    }),
    defineField({
      name: 'closeLabel',
      title: 'Label "Fermer"',
      type: 'internationalizedArrayString',
      fieldset: 'labels',
      description: 'Texte affiché sur le bouton pour fermer le menu',
    }),

    defineField({
      name: 'links',
      title: 'Liens',
      type: 'array',
      fieldset: 'navigation',
      description: 'Pages accessibles depuis le panneau de navigation',
      of: [
        defineArrayMember({
          type: 'navLink',
        }),
      ],
    }),

    defineField({
      name: 'locations',
      title: 'Lieux',
      type: 'array',
      fieldset: 'locations',
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
