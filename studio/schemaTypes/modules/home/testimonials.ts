import { CommentIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { ModuleThumbnailPreview } from '../../../components/ModuleThumbnailPreview'
import { pickLocalized } from '../../../lib/preview'
import { requireAllLanguages } from '../../../lib/i18nValidation'

export const testimonialsType = defineType({
  name: 'testimonials',
  title: 'Témoignages',
  type: 'object',
  icon: CommentIcon,
  components: { preview: ModuleThumbnailPreview },
  fields: [
    defineField({
      name: 'items',
      title: 'Témoignages',
      type: 'array',
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'authorName',
              title: 'Nom',
              type: 'internationalizedArrayString',
              validation: (Rule) => requireAllLanguages(Rule),
            }),
            defineField({
              name: 'authorRole',
              title: 'Rôle',
              type: 'internationalizedArrayString',
            }),
            defineField({
              name: 'useCar',
              title: 'Lier à une voiture',
              type: 'boolean',
              initialValue: true,
              description: 'Si activé : affiche la marque + le modèle de la voiture. Sinon : affiche le sous-titre libre ci-dessous.',
            }),
            defineField({
              name: 'car',
              title: 'Voiture',
              type: 'reference',
              to: [{ type: 'car' }],
              hidden: ({ parent }) => parent?.useCar === false,
              validation: (Rule) =>
                Rule.custom((value, context) => {
                  const parent = context.parent as { useCar?: boolean } | undefined
                  if (parent?.useCar === false) return true
                  return value ? true : 'Sélectionnez une voiture (ou désactivez « Lier à une voiture »).'
                }),
            }),
            defineField({
              name: 'subtitle',
              title: 'Sous-titre',
              type: 'internationalizedArrayString',
              description: 'Affiché à la place de la marque + modèle quand « Lier à une voiture » est désactivé.',
              hidden: ({ parent }) => parent?.useCar !== false,
              validation: (Rule, ctx) => (ctx?.hidden ? Rule.skip() : requireAllLanguages(Rule)),
            }),
            defineField({
              name: 'quote',
              title: 'Citation',
              type: 'internationalizedArrayText',
              validation: (Rule) => requireAllLanguages(Rule),
            }),
            defineField({
              name: 'backgroundImage',
              title: 'Image de fond',
              type: 'customImage',
            }),
          ],
          preview: {
            select: { title: 'authorName', subtitle: 'quote' },
            prepare({ title, subtitle }) {
              return { title: pickLocalized(title), subtitle: pickLocalized(subtitle) }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { items: 'items' },
    prepare({ items }) {
      return { title: 'Témoignages', subtitle: `${items?.length ?? 0} témoignage(s)` }
    },
  },
})
