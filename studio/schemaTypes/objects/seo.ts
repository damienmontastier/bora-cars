import { defineField } from 'sanity'

export const seoType = defineField({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  group: 'seo',
  options: {
    collapsed: false,
    collapsible: true,
  },
  fields: [
    defineField({
      name: 'title',
      title: 'Meta title',
      type: 'internationalizedArrayString',
      description:
        'Partie descriptive UNIQUEMENT. « — BORA CARS » est ajouté automatiquement à la fin (à l’accueil il passe devant). '
        + 'N’écrivez donc pas la marque ici. Ex. : « Location de voitures premium à Paris et Genève » (et non « … — BORA CARS »).',
    }),
    defineField({
      name: 'description',
      title: 'Meta description',
      type: 'internationalizedArrayText',
    }),
    defineField({
      name: 'image',
      title: 'OG Image',
      type: 'customImage',
    }),
  ],
})
