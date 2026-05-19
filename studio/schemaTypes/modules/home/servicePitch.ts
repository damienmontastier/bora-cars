import { BlockContentIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'
import { ModuleThumbnailPreview } from '../../../components/ModuleThumbnailPreview'
import { pickLocalized } from '../../../lib/preview'
import { requireAllLanguages } from '../../../lib/i18nValidation'

export const servicePitchType = defineType({
  name: 'servicePitch',
  title: 'Service Pitch',
  type: 'object',
  icon: BlockContentIcon,
  components: { preview: ModuleThumbnailPreview },
  fieldsets: [
    {
      name: 'content',
      title: 'Contenu',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'cta',
      title: 'Appel à l\'action',
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'internationalizedArrayString',
      fieldset: 'content',
      description: 'Petit texte affiché au-dessus du titre',
    }),
    defineField({
      name: 'heading',
      title: 'Titre',
      type: 'internationalizedArrayString',
      fieldset: 'content',
      validation: (Rule) => requireAllLanguages(Rule),
    }),
    defineField({
      name: 'body',
      title: 'Corps de texte',
      type: 'internationalizedArrayText',
      fieldset: 'content',
      validation: (Rule) => requireAllLanguages(Rule),
    }),

    defineField({
      name: 'ctaLabel',
      title: 'Libellé du bouton',
      type: 'internationalizedArrayString',
      fieldset: 'cta',
      validation: (Rule) => requireAllLanguages(Rule),
    }),
    defineField({
      name: 'ctaUrl',
      title: 'URL du bouton',
      type: 'url',
      fieldset: 'cta',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { subtitle: 'heading' },
    prepare({ subtitle }) {
      return { title: 'Service Pitch', subtitle: pickLocalized(subtitle) }
    },
  },
})
