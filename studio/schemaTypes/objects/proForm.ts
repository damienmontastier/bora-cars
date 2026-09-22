import type { ComponentType } from 'react'
import { CalendarIcon } from '@sanity/icons/Calendar'
import { CheckmarkIcon } from '@sanity/icons/Checkmark'
import { CheckmarkCircleIcon } from '@sanity/icons/CheckmarkCircle'
import { DocumentTextIcon } from '@sanity/icons/DocumentText'
import { InfoOutlineIcon } from '@sanity/icons/InfoOutline'
import { LockIcon } from '@sanity/icons/Lock'
import { StackIcon } from '@sanity/icons/Stack'
import { TextIcon } from '@sanity/icons/Text'
import { UlistIcon } from '@sanity/icons/Ulist'
import { UserIcon } from '@sanity/icons/User'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { ProFieldConditionInput } from '../../components/ProFieldConditionInput'
import { requireAllLanguages } from '../../lib/i18nValidation'
import { pickLocalized } from '../../lib/preview'

export const PRO_IDENTITY_ROLES = [
  { value: 'firstName', title: 'Prénom' },
  { value: 'lastName', title: 'Nom' },
  { value: 'phone', title: 'Téléphone' },
  { value: 'email', title: 'Email' },
]

export const PRO_CONDITION_SOURCE_TYPES = ['proFieldChoice', 'proFieldYesNo', 'proFieldCheckbox']

export const PRO_RESERVED_COLUMNS = [
  'Nom complet',
  'Téléphone',
  'Email',
  'Consentement RGPD',
  'Récap dossier PRO',
  'Type de demande',
  'Type de lead',
  'Langue',
  'Canal',
  'Étape',
  'Source',
  'Statut',
  'Page d\'origine',
  'UTM source',
  'UTM medium',
  'UTM campaign',
]

const TYPE_TITLES: Record<string, string> = {
  proFieldIdentity: 'Coordonnée (verrouillée)',
  proFieldConsent: 'Consentement (verrouillé)',
  proFieldText: 'Texte court',
  proFieldTextarea: 'Texte long',
  proFieldChoice: 'Liste de choix',
  proFieldYesNo: 'Oui / Non',
  proFieldCheckbox: 'Case à cocher',
  proFieldMonthYear: 'Mois et année',
  proFieldNote: 'Message d’aide',
}

function labelField(description?: string) {
  return defineField({
    name: 'label',
    title: 'Question',
    type: 'internationalizedArrayString',
    description,
    validation: Rule => requireAllLanguages(Rule),
  })
}

function placeholderField() {
  return defineField({
    name: 'placeholder',
    title: 'Exemple dans le champ',
    type: 'internationalizedArrayString',
    description: 'Texte grisé affiché tant que le champ est vide (facultatif).',
  })
}

function requiredField() {
  return defineField({
    name: 'required',
    title: 'Réponse obligatoire',
    type: 'boolean',
    initialValue: false,
  })
}

function errorField(hidden = true) {
  return defineField({
    name: 'errorMessage',
    title: 'Message si la réponse manque',
    type: 'internationalizedArrayString',
    description: 'Facultatif. Sans message, le site affiche le « Message d’erreur par défaut » des textes communs.',
    hidden: hidden ? ({ parent }) => !parent?.required : undefined,
  })
}

function widthField() {
  return defineField({
    name: 'width',
    title: 'Largeur',
    type: 'string',
    description: 'Deux champs « Demi-largeur » qui se suivent s’affichent côte à côte (l’un sous l’autre sur téléphone).',
    options: {
      list: [
        { value: 'full', title: 'Pleine largeur' },
        { value: 'half', title: 'Demi-largeur' },
      ],
      layout: 'radio',
      direction: 'horizontal',
    },
    initialValue: 'full',
  })
}

function showIfField() {
  return defineField({
    name: 'showIf',
    title: 'Afficher seulement si…',
    type: 'object',
    description: 'Laisser vide pour toujours afficher ce champ. Placé juste sous la question dont il dépend, il s’affiche en retrait sous elle. Masqué, sa réponse est effacée et n’est pas envoyée.',
    components: { input: ProFieldConditionInput as ComponentType<any> },
    fields: [
      defineField({ name: 'field', title: 'Question', type: 'string' }),
      defineField({ name: 'values', title: 'Réponses', type: 'array', of: [{ type: 'string' }] }),
    ],
  })
}

function airtableColumnField(description = 'Facultatif. Nom EXACT d’une colonne de la table « Leads » à remplir avec la réponse. Toutes les réponses figurent de toute façon dans « Récap dossier PRO » (et dans l’email de notification). Si la colonne n’existe pas ou refuse la valeur, le dossier est quand même enregistré, sans elle.') {
  return defineField({
    name: 'airtableColumn',
    title: 'Colonne Airtable',
    type: 'string',
    description,
    validation: Rule => Rule.custom((value?: string) => {
      if (value && PRO_RESERVED_COLUMNS.includes(value.trim()))
        return `« ${value.trim()} » est rempli automatiquement par le site : choisissez une autre colonne.`
      return true
    }),
  })
}

function fieldPreview(extra: Record<string, string> = {}) {
  return {
    select: { label: 'label', text: 'text', role: 'role', required: 'required', showIf: 'showIf.field', column: 'airtableColumn', ...extra },
    prepare(value: Record<string, any>) {
      const { label, text, role, required, showIf, column, _type } = value
      const parts = [TYPE_TITLES[_type] ?? '']
      if (role)
        parts[0] = PRO_IDENTITY_ROLES.find(r => r.value === role)?.title ?? parts[0]
      if (required || _type === 'proFieldConsent' || (_type === 'proFieldIdentity' && role !== 'email'))
        parts.push('obligatoire')
      if (showIf)
        parts.push('conditionnel')
      if (column)
        parts.push(`→ ${column}`)
      return {
        title: pickLocalized(label) || pickLocalized(text) || TYPE_TITLES[_type] || 'Champ',
        subtitle: parts.filter(Boolean).join(' · '),
      }
    },
  }
}

function withTypePreview(type: string) {
  const preview = fieldPreview()
  return {
    ...preview,
    prepare: (value: Record<string, any>) => preview.prepare({ ...value, _type: type }),
  }
}

export const proFieldIdentityType = defineType({
  name: 'proFieldIdentity',
  title: TYPE_TITLES.proFieldIdentity,
  type: 'object',
  icon: UserIcon,
  description: 'Prénom, nom, téléphone et email sont indispensables au CRM : ces champs ne peuvent pas être retirés, seulement déplacés et reformulés.',
  fields: [
    defineField({
      name: 'role',
      title: 'Coordonnée',
      type: 'string',
      options: { list: PRO_IDENTITY_ROLES, layout: 'radio', direction: 'horizontal' },
      validation: Rule => Rule.required(),
    }),
    labelField(),
    placeholderField(),
    defineField({
      name: 'required',
      title: 'Réponse obligatoire',
      type: 'boolean',
      description: 'Seul l’email peut être facultatif : prénom, nom et téléphone sont toujours obligatoires.',
      initialValue: false,
      hidden: ({ parent }) => parent?.role !== 'email',
    }),
    defineField({
      name: 'errorMessage',
      title: 'Message si la réponse manque ou est invalide',
      type: 'internationalizedArrayString',
      description: 'Ex. « Merci d’indiquer un numéro valide (au moins 8 chiffres). » Sans message, le site affiche le message d’erreur par défaut.',
    }),
    widthField(),
  ],
  preview: withTypePreview('proFieldIdentity'),
})

export const proFieldConsentType = defineType({
  name: 'proFieldConsent',
  title: TYPE_TITLES.proFieldConsent,
  type: 'object',
  icon: LockIcon,
  description: 'Case obligatoire (RGPD) : le dossier n’est pas envoyé sans elle. Elle ne peut pas être retirée.',
  fields: [
    defineField({
      name: 'before',
      title: 'Texte avant le lien',
      type: 'internationalizedArrayText',
      validation: Rule => requireAllLanguages(Rule),
    }),
    defineField({
      name: 'linkLabel',
      title: 'Texte du lien',
      type: 'internationalizedArrayString',
      description: 'Lien vers la politique de confidentialité.',
      validation: Rule => requireAllLanguages(Rule),
    }),
    defineField({
      name: 'after',
      title: 'Texte après le lien',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'errorMessage',
      title: 'Message si la case n’est pas cochée',
      type: 'internationalizedArrayString',
    }),
  ],
  preview: {
    select: { text: 'before' },
    prepare: ({ text }) => ({
      title: 'Case de consentement',
      subtitle: pickLocalized(text)?.slice(0, 80) || 'obligatoire',
    }),
  },
})

export const proFieldTextType = defineType({
  name: 'proFieldText',
  title: TYPE_TITLES.proFieldText,
  type: 'object',
  icon: TextIcon,
  fields: [
    labelField(),
    placeholderField(),
    defineField({
      name: 'format',
      title: 'Type de réponse',
      type: 'string',
      options: {
        list: [
          { value: 'text', title: 'Texte' },
          { value: 'number', title: 'Nombre' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      description: '« Nombre » ouvre le clavier numérique sur téléphone et envoie à Airtable le premier nombre saisi (« 20 000 km » → 20000).',
      initialValue: 'text',
    }),
    defineField({
      name: 'defaultValue',
      title: 'Valeur pré-remplie',
      type: 'string',
      description: 'Facultatif. Ex. « 1 » pour un nombre de véhicules.',
    }),
    requiredField(),
    errorField(),
    widthField(),
    showIfField(),
    airtableColumnField(),
  ],
  preview: withTypePreview('proFieldText'),
})

export const proFieldTextareaType = defineType({
  name: 'proFieldTextarea',
  title: TYPE_TITLES.proFieldTextarea,
  type: 'object',
  icon: DocumentTextIcon,
  fields: [
    labelField(),
    placeholderField(),
    requiredField(),
    errorField(),
    showIfField(),
    airtableColumnField(),
  ],
  preview: withTypePreview('proFieldTextarea'),
})

export const proFieldChoiceType = defineType({
  name: 'proFieldChoice',
  title: TYPE_TITLES.proFieldChoice,
  type: 'object',
  icon: UlistIcon,
  fields: [
    labelField(),
    defineField({
      name: 'display',
      title: 'Affichage',
      type: 'string',
      options: {
        list: [
          { value: 'select', title: 'Menu déroulant' },
          { value: 'list', title: 'Boutons, l’un sous l’autre' },
          { value: 'row', title: 'Boutons, sur une ligne' },
        ],
        layout: 'radio',
      },
      description: 'Menu déroulant pour les longues listes, boutons pour 2 à 5 choix courts.',
      initialValue: 'list',
      hidden: ({ parent }) => !!parent?.multiple,
    }),
    defineField({
      name: 'multiple',
      title: 'Plusieurs réponses possibles',
      type: 'boolean',
      description: 'Affiche des cases à cocher, l’une sous l’autre.',
      initialValue: false,
    }),
    defineField({
      name: 'options',
      title: 'Choix',
      type: 'array',
      validation: Rule => Rule.required().min(1),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'proFieldOption',
          fields: [
            defineField({
              name: 'label',
              title: 'Libellé',
              type: 'internationalizedArrayString',
              validation: Rule => requireAllLanguages(Rule),
            }),
            defineField({
              name: 'description',
              title: 'Précision',
              type: 'internationalizedArrayString',
              description: 'Petite ligne grise sous le libellé (boutons et cases seulement, facultatif).',
            }),
            defineField({
              name: 'crmValue',
              title: 'Valeur envoyée à Airtable',
              type: 'string',
              description: 'Facultatif. Nom EXACT de l’option dans Airtable, si elle diffère du libellé français. Sans valeur, le libellé français est envoyé ; une option qui n’existe pas encore est créée dans Airtable.',
            }),
          ],
          preview: {
            select: { label: 'label', crmValue: 'crmValue' },
            prepare: ({ label, crmValue }) => ({
              title: pickLocalized(label) || 'Choix',
              subtitle: crmValue ? `Airtable : ${crmValue}` : undefined,
            }),
          },
        }),
      ],
    }),
    requiredField(),
    errorField(),
    widthField(),
    showIfField(),
    airtableColumnField(),
  ],
  preview: withTypePreview('proFieldChoice'),
})

export const proFieldYesNoType = defineType({
  name: 'proFieldYesNo',
  title: TYPE_TITLES.proFieldYesNo,
  type: 'object',
  icon: CheckmarkCircleIcon,
  description: 'Deux boutons « Oui » / « Non » (libellés dans les textes communs).',
  fields: [
    labelField(),
    requiredField(),
    errorField(),
    showIfField(),
    airtableColumnField(),
    defineField({
      name: 'airtableFormat',
      title: 'Format dans Airtable',
      type: 'string',
      options: {
        list: [
          { value: 'checkbox', title: 'Case à cocher (cochée si « Oui »)' },
          { value: 'text', title: 'Texte « Oui » / « Non »' },
        ],
        layout: 'radio',
      },
      initialValue: 'checkbox',
      hidden: ({ parent }) => !parent?.airtableColumn,
    }),
  ],
  preview: withTypePreview('proFieldYesNo'),
})

export const proFieldCheckboxType = defineType({
  name: 'proFieldCheckbox',
  title: TYPE_TITLES.proFieldCheckbox,
  type: 'object',
  icon: CheckmarkIcon,
  description: 'Une case seule (ex. « Je souhaite être conseillé »). Airtable : colonne de type case à cocher.',
  fields: [
    labelField('Texte à côté de la case.'),
    showIfField(),
    airtableColumnField(),
  ],
  preview: withTypePreview('proFieldCheckbox'),
})

export const proFieldMonthYearType = defineType({
  name: 'proFieldMonthYear',
  title: TYPE_TITLES.proFieldMonthYear,
  type: 'object',
  icon: CalendarIcon,
  description: 'Deux menus déroulants (mois, année). Airtable reçoit « MM/AAAA ».',
  fields: [
    labelField(),
    defineField({
      name: 'monthLabel',
      title: 'Libellé « Mois »',
      type: 'internationalizedArrayString',
      validation: Rule => requireAllLanguages(Rule),
    }),
    defineField({
      name: 'yearLabel',
      title: 'Libellé « Année »',
      type: 'internationalizedArrayString',
      validation: Rule => requireAllLanguages(Rule),
    }),
    defineField({
      name: 'firstYear',
      title: 'Première année proposée',
      type: 'number',
      description: 'La liste va de l’année en cours jusqu’à celle-ci.',
      initialValue: 1980,
      validation: Rule => Rule.required().integer().min(1900).max(2100),
    }),
    defineField({
      name: 'pendingLabel',
      title: 'Case « pas encore »',
      type: 'internationalizedArrayString',
      description: 'Facultatif. Case sous les menus qui les désactive (ex. « Société en cours de création »).',
    }),
    defineField({
      name: 'pendingCrmValue',
      title: 'Valeur envoyée à Airtable si la case est cochée',
      type: 'string',
      description: 'Sans valeur, le libellé français de la case est envoyé.',
      hidden: ({ parent }) => !parent?.pendingLabel?.length,
    }),
    requiredField(),
    errorField(),
    showIfField(),
    airtableColumnField(),
  ],
  preview: withTypePreview('proFieldMonthYear'),
})

export const proFieldNoteType = defineType({
  name: 'proFieldNote',
  title: TYPE_TITLES.proFieldNote,
  type: 'object',
  icon: InfoOutlineIcon,
  description: 'Encadré d’information, sans réponse à saisir.',
  fields: [
    defineField({
      name: 'text',
      title: 'Texte',
      type: 'internationalizedArrayText',
      validation: Rule => requireAllLanguages(Rule),
    }),
    showIfField(),
  ],
  preview: withTypePreview('proFieldNote'),
})

export const PRO_FIELD_TYPES = [
  'proFieldIdentity',
  'proFieldText',
  'proFieldTextarea',
  'proFieldChoice',
  'proFieldYesNo',
  'proFieldCheckbox',
  'proFieldMonthYear',
  'proFieldNote',
  'proFieldConsent',
]

export const proFormStepType = defineType({
  name: 'proFormStep',
  title: 'Étape',
  type: 'object',
  icon: StackIcon,
  fields: [
    defineField({
      name: 'tab',
      title: 'Nom de l’onglet',
      type: 'internationalizedArrayString',
      description: 'Mot court affiché dans la barre des étapes (ex. « Société »).',
      validation: Rule => requireAllLanguages(Rule),
    }),
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'internationalizedArrayString',
      validation: Rule => requireAllLanguages(Rule),
    }),
    defineField({
      name: 'subtitle',
      title: 'Sous-titre',
      type: 'internationalizedArrayText',
    }),
    defineField({
      name: 'fields',
      title: 'Champs',
      type: 'array',
      of: PRO_FIELD_TYPES.map(type => defineArrayMember({ type })),
    }),
  ],
  preview: {
    select: { tab: 'tab', title: 'title', fields: 'fields' },
    prepare: ({ tab, title, fields }) => ({
      title: pickLocalized(tab) || 'Étape',
      subtitle: [pickLocalized(title), `${fields?.length ?? 0} champ(s)`].filter(Boolean).join(' · '),
    }),
  },
})

interface StepValue {
  fields?: { _key: string, _type: string, role?: string, showIf?: { field?: string, values?: string[] } }[]
}

export function validateProSteps(steps: StepValue[] | undefined): string | true {
  const fields = (steps ?? []).flatMap(step => step.fields ?? [])
  const problems: string[] = []

  for (const role of PRO_IDENTITY_ROLES) {
    const count = fields.filter(f => f._type === 'proFieldIdentity' && f.role === role.value).length
    if (count === 0)
      problems.push(`le champ « ${role.title} » manque (Coordonnée verrouillée, indispensable au CRM)`)
    if (count > 1)
      problems.push(`le champ « ${role.title} » est présent ${count} fois`)
  }
  const consents = fields.filter(f => f._type === 'proFieldConsent').length
  if (consents === 0)
    problems.push('la case de consentement manque (obligatoire, RGPD)')
  if (consents > 1)
    problems.push('la case de consentement est présente plusieurs fois')

  for (const field of fields) {
    const source = field.showIf?.field
    if (!source)
      continue
    const target = fields.find(f => f._key === source)
    if (!target || !PRO_CONDITION_SOURCE_TYPES.includes(target._type) || target._key === field._key)
      problems.push('un champ dépend d’une question qui n’existe plus : revoir son « Afficher seulement si… »')
    else if (!field.showIf?.values?.length)
      problems.push('un champ conditionnel n’a aucune réponse cochée dans « Afficher seulement si… »')
  }

  return problems.length ? `Formulaire incomplet : ${[...new Set(problems)].join(' ; ')}.` : true
}
