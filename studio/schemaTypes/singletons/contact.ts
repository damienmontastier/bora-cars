import { EnvelopeIcon } from '@sanity/icons/Envelope'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { pickLocalized } from '../../lib/preview'
import { requireAllLanguages } from '../../lib/i18nValidation'
import { GROUPS } from '../constants'
import { seoType } from '../objects/seo'
import { validateProSteps } from '../objects/proForm'

const TITLE = 'Contact'

function i18nString(name: string, title: string, description?: string, required = true) {
  return defineField({
    name,
    title,
    type: 'internationalizedArrayString',
    description,
    validation: required ? Rule => requireAllLanguages(Rule) : undefined,
  })
}

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
      name: 'profileSwitch',
      title: 'Onglets du formulaire',
      type: 'object',
      group: 'editorial',
      description: 'Les deux gros boutons en haut du formulaire, pour passer de « Demande générale » à « Leasing professionnel ».',
      options: { collapsible: true, collapsed: true },
      fields: [
        i18nString('label', 'Intitulé pour les lecteurs d’écran', 'Non affiché, lu par les logiciels pour malvoyants (ex. « Type de demande »).'),
        i18nString('generalTitle', 'Demande générale — titre'),
        i18nString('generalSubtitle', 'Demande générale — sous-titre', undefined, false),
        i18nString('proTitle', 'Leasing professionnel — titre'),
        i18nString('proSubtitle', 'Leasing professionnel — sous-titre', undefined, false),
      ],
    }),
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
      description: 'Colonne de gauche de la page quand l’onglet « Leasing professionnel » est ouvert.',
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
      name: 'proForm',
      title: 'Formulaire',
      type: 'object',
      group: 'pro',
      description: 'Étapes, questions, choix et textes du formulaire « Leasing professionnel ». Ajouter une étape ou un champ : bouton « Ajouter » en bas de la liste. Prénom, nom, téléphone, email et consentement sont verrouillés (indispensables au CRM) : on peut les déplacer et les reformuler, pas les retirer.',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: 'steps',
          title: 'Étapes',
          type: 'array',
          description: 'Une étape = un onglet (A, B, C…). La lettre suit l’ordre des étapes.',
          of: [defineArrayMember({ type: 'proFormStep' })],
          validation: Rule => Rule.min(1).custom(steps => validateProSteps(steps as any)),
        }),
        defineField({
          name: 'labels',
          title: 'Textes communs',
          type: 'object',
          options: { collapsible: true, collapsed: true },
          fields: [
            i18nString('stepsLabel', 'Intitulé de la barre des étapes', 'Non affiché, lu par les logiciels pour malvoyants (ex. « Étapes du dossier »).'),
            i18nString('stepCounter', 'Compteur d’étapes', 'Écrivez {current} et {total} là où doivent apparaître les numéros (ex. « Étape {current} / {total} »).'),
            i18nString('start', 'Bouton de la 1re étape', 'Ex. « Commencer ».'),
            i18nString('next', 'Bouton « suivant »', 'Ex. « Continuer ».'),
            i18nString('back', 'Bouton « précédent »'),
            i18nString('submit', 'Bouton d’envoi (dernière étape)', 'Ex. « Envoyer mon dossier ».'),
            i18nString('yes', 'Réponse « Oui »', 'Utilisé par les questions Oui / Non.'),
            i18nString('no', 'Réponse « Non »'),
            i18nString('requiredError', 'Message d’erreur par défaut', 'Affiché sous une question obligatoire sans réponse, si elle n’a pas son propre message.'),
            defineField({
              name: 'note',
              title: 'Mention sous les boutons',
              type: 'internationalizedArrayText',
            }),
            defineField({
              name: 'sendError',
              title: 'Message si l’envoi échoue',
              type: 'internationalizedArrayText',
              validation: Rule => requireAllLanguages(Rule),
            }),
          ],
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
