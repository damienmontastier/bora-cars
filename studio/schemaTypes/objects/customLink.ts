import { LinkIcon } from '@sanity/icons'
import { defineType } from 'sanity'

export const customLink = defineType({
  name: 'customLink',
  title: 'Lien',
  type: 'link',
  icon: LinkIcon,
})
