import { defineField, defineType } from 'sanity'

export const customMedia = defineType({
  name: 'customMedia',
  title: 'Media',
  type: 'object',
  options: { collapsible: false },
  fields: [
    defineField({
      name: 'mediaType',
      title: 'Type de média',
      type: 'string',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Vidéo', value: 'video' },
        ],
        layout: 'radio',
      },
      initialValue: 'image',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'customImage',
      options: { collapsible: false },
      hidden: ({ parent }) => parent?.mediaType !== 'image',
      validation: (Rule) =>
        Rule.custom((value, { parent }: any) => {
          if (parent?.mediaType === 'image' && !value)
            return 'Une image est requise.'
          return true
        }),
    }),
    defineField({
      name: 'video',
      title: 'Vidéo',
      type: 'customVideo',
      options: { collapsible: false },
      hidden: ({ parent }) => parent?.mediaType !== 'video',
      validation: (Rule) =>
        Rule.custom((value, { parent }: any) => {
          if (parent?.mediaType === 'video' && !value)
            return 'Une vidéo est requise.'
          return true
        }),
    }),
  ],
  preview: {
    select: {
      mediaType: 'mediaType',
      image: 'image',
      alt: 'image.alt',
      videoAlt: 'video.alt',
    },
    prepare({ mediaType, image, alt, videoAlt }) {
      return {
        title: mediaType === 'video' ? '🎬 Vidéo' : '🖼 Image',
        subtitle: mediaType === 'video' ? videoAlt : alt,
        media: image,
      }
    },
  },
})
