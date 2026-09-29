import { ImageIcon } from '@sanity/icons/Image'
import { defineField, defineType } from 'sanity'
import { ModuleThumbnailPreview } from '../../../components/ModuleThumbnailPreview'
import { pickLocalized } from '../../../lib/preview'
import { requireAllLanguages } from '../../../lib/i18nValidation'

export const mediaBlockType = defineType({
  name: 'mediaBlock',
  title: 'Média + texte',
  type: 'object',
  icon: ImageIcon,
  components: { preview: ModuleThumbnailPreview },
  fields: [
    defineField({
      name: 'media',
      title: 'Média',
      type: 'customMedia',
      description: 'Image ou vidéo affichée en plein écran.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heading',
      title: 'Titre',
      type: 'internationalizedArrayString',
      validation: (Rule) => requireAllLanguages(Rule),
    }),
    defineField({
      name: 'subheading',
      title: 'Sous-titre',
      type: 'internationalizedArrayText',
      description: 'Optionnel, affiché sous le titre.',
    }),
    defineField({
      name: 'text',
      title: 'Texte',
      type: 'internationalizedArrayText',
      description: 'Optionnel, petit texte à droite, au-dessus du bouton.',
    }),
    defineField({
      name: 'showCta',
      title: 'Afficher le bouton de contact',
      type: 'boolean',
      initialValue: true,
      description: 'Le bouton est celui de Paramètres → Global.',
    }),
  ],
  preview: {
    select: { heading: 'heading', media: 'media.image' },
    prepare({ heading, media }) {
      return { title: pickLocalized(heading) || 'Média + texte', subtitle: 'Média + texte', media }
    },
  },
})
