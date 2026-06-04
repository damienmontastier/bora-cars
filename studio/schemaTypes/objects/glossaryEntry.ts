import { defineField, defineType } from 'sanity'

type LocalizedItem = { language?: string, value?: string }

/**
 * Entrée du Glossaire : une chaîne d'interface (`$t(...)` côté Nuxt).
 *
 * `key` est le chemin pointé À L'INTÉRIEUR de l'onglet (= namespace i18n).
 * Ex. dans l'onglet « Voiture » : `specs.labels.gamme` → `car.specs.labels.gamme`.
 * Cette clé est le pont avec le code : `web/scripts/sync-i18n.mjs` reconstruit
 * l'arbre JSON à partir d'elle. NE PAS la modifier sur une entrée existante.
 */
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
