import { defineField, defineType } from 'sanity'
import { NavLinkPreview } from '../../components/NavLinkPreview'

export const navLink = defineType({
  name: 'navLink',
  title: 'Lien de navigation',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'link',
      title: 'Lien',
      type: 'customLink',
    }),
  ],
  preview: {
    select: {
      label: 'label',
    },
  },
  components: {
    preview: NavLinkPreview,
  },
})
