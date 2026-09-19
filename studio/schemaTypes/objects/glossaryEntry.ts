import { defineField, defineType } from 'sanity'

type LocalizedItem = { language?: string, value?: string }

export const glossaryEntry = defineType({
  name: 'glossaryEntry',
  title: 'Entrée',
  type: 'object',
  fields: [
    defineField({
      name: 'key',
      title: 'Clé',
      type: 'string',
      readOnly: true,
      validation: Rule => Rule.required(),
      description:
        'Chemin technique de la traduction (ex. « specs.labels.gamme »). Verrouillée : '
        + 'elle sert de pont vers le code. Ajouter une nouvelle clé est une tâche dev '
        + '(nouveau $t(...) côté code + re-seed) — modifie uniquement la valeur.',
    }),
    defineField({
      name: 'value',
      title: 'Valeur',
      type: 'internationalizedArrayText',
      description:
        'Les variables entre accolades (ex. {price}, {year}) et les retours à la ligne sont conservés tels quels.',
    }),
  ],
  preview: {
    select: { key: 'key', value: 'value' },
    prepare({ key, value }: { key?: string, value?: LocalizedItem[] }) {
      const fr = Array.isArray(value) ? value.find(v => v?.language === 'fr')?.value : undefined
      return {
        title: key || '(clé manquante)',
        subtitle: fr,
      }
    },
  },
})
