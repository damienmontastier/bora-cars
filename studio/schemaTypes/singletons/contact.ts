import { EnvelopeIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { pickLocalized } from '../../lib/preview'
import { requireAllLanguages } from '../../lib/i18nValidation'
import { GROUPS } from '../constants'
import { seoType } from '../objects/seo'

const TITLE = 'Contact'

export const contactType = defineType({
  name: 'contact',
  title: TITLE,
  type: 'document',
  icon: EnvelopeIcon,
  groups: GROUPS,
  fieldsets: [
    {
      name: 'form',
      title: 'Formulaire',
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({
      name: 'heading',
      title: 'Titre',
      type: 'internationalizedArrayText',
      group: 'editorial',
      description: 'Titre principal de la page. Les retours à la ligne sont préservés.',
      validation: Rule => requireAllLanguages(Rule),
    }),
    defineField({
      name: 'submitLabel',
      title: 'Libellé du bouton',
      type: 'internationalizedArrayString',
      group: 'editorial',
      fieldset: 'form',
      description: 'Texte du bouton de soumission (ex. « Envoyer ma demande »)',
      validation: Rule => requireAllLanguages(Rule),
    }),
    defineField({
      name: 'subjectOptions',
      title: 'Objets de la demande',
      type: 'array',
      group: 'editorial',
      fieldset: 'form',
      description: 'Options disponibles dans le menu déroulant « Objet de la demande »',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'subjectOption',
          fields: [
            defineField({
              name: 'label',
              title: 'Libellé',
              type: 'internationalizedArrayString',
              validation: Rule => requireAllLanguages(Rule),
            }),
          ],
          preview: {
            select: { label: 'label' },
            prepare({ label }) {
              return { title: pickLocalized(label) || 'Option' }
            },
          },
        }),
      ],
    }),
    seoType,
  ],
  preview: {
    prepare() {
      return { media: EnvelopeIcon, subtitle: 'Singleton', title: TITLE }
    },
  },
})
