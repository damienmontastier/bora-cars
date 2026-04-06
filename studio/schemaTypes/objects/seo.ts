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
      type: 'string',
      validation: (Rule) =>
        Rule.max(60).warning('Les titres trop longs peuvent être tronqués par les moteurs de recherche'),
    }),
    defineField({
      name: 'description',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      validation: (Rule) =>
        Rule.max(160).warning('Les descriptions trop longues peuvent être tronquées par les moteurs de recherche'),
    }),
    defineField({
      name: 'image',
      title: 'OG Image',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
})
