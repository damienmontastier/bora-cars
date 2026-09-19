import { EnvelopeIcon } from '@sanity/icons/Envelope'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { pickLocalized } from '../../lib/preview'
import { requireAllLanguages } from '../../lib/i18nValidation'
import { GROUPS } from '../constants'
import { seoType } from '../objects/seo'

const TITLE = 'Contact'

function linkCardField(name: string, title: string, description: string) {
  return defineField({
    name,
    title,
    type: 'object',
    description,
    options: { collapsible: true, collapsed: false },
    fields: [
      defineField({
        name: 'title',
        title: 'Texte du bouton',
        type: 'internationalizedArrayString',
        validation: Rule => requireAllLanguages(Rule),
      }),
      defineField({
        name: 'subtitle',
        title: 'Sous-titre',
        type: 'internationalizedArrayString',
        description: 'Petite ligne sous le texte du bouton (facultatif).',
      }),
      defineField({
        name: 'url',
        title: 'Adresse du lien',
        type: 'url',
        description: 'Adresse complète, qui commence par https://. Le lien s’ouvre dans un nouvel onglet.',
        validation: Rule => Rule.uri({ scheme: ['https'] }),
      }),
    ],
  })
}

export const contactType = defineType({
  name: 'contact',
  title: TITLE,
  type: 'document',
  icon: EnvelopeIcon,
  groups: [GROUPS[0]!, { name: 'pro', title: 'Leasing professionnel' }, ...GROUPS.slice(1)],
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
      description: 'Titre principal de la page, affiché avec l’onglet « Demande générale ». Les retours à la ligne sont préservés.',
      validation: Rule => requireAllLanguages(Rule),
    }),
    defineField({
      name: 'submitLabel',
      title: 'Libellé du bouton',
      type: 'internationalizedArrayString',
      group: 'editorial',
      fieldset: 'form',
      description: 'Texte du bouton d’envoi de l’onglet « Demande générale » (ex. « Envoyer ma demande »)',
      validation: Rule => requireAllLanguages(Rule),
    }),
    defineField({
      name: 'subjectOptions',
      title: 'Objets de la demande',
      type: 'array',
      group: 'editorial',
      fieldset: 'form',
      description: 'Options du menu déroulant « Objet de la demande » de l’onglet « Demande générale ». Les demandes de leasing pour les sociétés passent par l’onglet « Leasing professionnel ».',
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
    defineField({
      name: 'proIntro',
      title: 'Texte d’accueil',
      type: 'object',
      group: 'pro',
      description: 'Colonne de gauche de la page quand l’onglet « Leasing professionnel » est ouvert. Les textes du formulaire lui-même (étapes, questions, choix, boutons, messages d’erreur, case de consentement) sont dans le Glossaire, onglet « Contact », clés « pro.… » et « profile.… ».',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: 'heading',
          title: 'Titre',
          type: 'internationalizedArrayText',
          validation: Rule => requireAllLanguages(Rule),
        }),
        defineField({
          name: 'lead',
          title: 'Accroche',
          type: 'internationalizedArrayText',
          description: 'Phrase sous le titre, en plus gros que le texte.',
        }),
        defineField({
          name: 'text',
          title: 'Texte',
          type: 'internationalizedArrayText',
          description: 'Paragraphe sous l’accroche (déroulé et délai de réponse).',
        }),
      ],
    }),
    defineField({
      name: 'proSuccess',
      title: 'Écran de confirmation',
      type: 'object',
      group: 'pro',
      description: 'Remplace le formulaire une fois le dossier « Leasing professionnel » envoyé.',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: 'kicker',
          title: 'Surtitre',
          type: 'internationalizedArrayString',
          description: 'Petite ligne orange au-dessus du titre (facultatif).',
        }),
        defineField({
          name: 'title',
          title: 'Titre',
          type: 'internationalizedArrayString',
          validation: Rule => requireAllLanguages(Rule),
        }),
        defineField({
          name: 'text',
          title: 'Message',
          type: 'internationalizedArrayText',
          description: 'Écrivez {prenom} là où doit apparaître le prénom saisi dans le formulaire. Ex. « Merci {prenom}. Notre équipe l’étudie et revient vers vous sous 48 h avec les solutions possibles. »',
        }),
        defineField({
          name: 'linksTitle',
          title: 'Titre des liens',
          type: 'internationalizedArrayString',
          description: 'Ligne au-dessus des boutons (ex. « En attendant, restons en contact »).',
        }),
        linkCardField('whatsapp', 'Bouton principal (chaîne WhatsApp)', 'Bouton orange. Adresse de la chaîne WhatsApp.'),
        linkCardField('instagram', 'Bouton Instagram', 'Bouton encadré. Sur téléphone, le site essaie d’ouvrir l’appli Instagram sur ce profil, sinon le profil s’ouvre dans le navigateur.'),
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
