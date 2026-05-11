import { defineField, defineType } from 'sanity'
import { pickLocalized } from '../../lib/preview'

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
      options: { collapsible: false, hotspot: true },
      hidden: ({ parent }) => parent?.mediaType !== 'image',
      validation: (Rule, ctx) =>
        ctx?.hidden ? Rule.skip() : Rule.required().error('Une image est requise.'),
    }),
    defineField({
      name: 'video',
      title: 'Vidéo',
      type: 'customVideo',
      options: { collapsible: false },
      hidden: ({ parent }) => parent?.mediaType !== 'video',
      validation: (Rule, ctx) =>
        ctx?.hidden ? Rule.skip() : Rule.required().error('Une vidéo est requise.'),
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
        subtitle: pickLocalized(mediaType === 'video' ? videoAlt : alt),
        media: image,
      }
    },
  },
})
