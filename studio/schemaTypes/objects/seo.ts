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
    }),
    defineField({
      name: 'description',
      title: 'Meta description',
      type: 'internationalizedArrayText',
    }),
    defineField({
      name: 'image',
      title: 'OG Image',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
})
