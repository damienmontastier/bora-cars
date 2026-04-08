import { CogIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

const TITLE = 'Paramètres'

export const settingsType = defineType({
  name: 'settings',
  title: TITLE,
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'global', title: 'Global', default: true },
  ],
  fields: [
    defineField({
      name: 'contactLink',
      title: 'Lien de contact',
      type: 'customLink',
      group: 'global',
      description: 'Utilisé pour tous les boutons "Contact" du site',
      options: { enableText: true },
    }),
  ],
  preview: {
    prepare() {
      return { media: CogIcon, subtitle: 'Singleton', title: TITLE }
    },
  },
})
