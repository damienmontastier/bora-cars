import { defineField, defineType } from 'sanity'

export const customMedia = defineType({
  name: 'customMedia',
  title: 'Media',
  type: 'object',
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
      hidden: ({ parent }) => parent?.mediaType !== 'image',
    }),
    defineField({
      name: 'video',
      title: 'Vidéo',
      type: 'file',
      options: { accept: 'video/*' },
      hidden: ({ parent }) => parent?.mediaType !== 'video',
      fields: [
        defineField({
          name: 'alt',
          title: 'Texte alternatif',
          type: 'string',
          description: 'Pour l\'accessibilité',
          validation: (Rule) => Rule.required().error('Texte alternatif est requis.'),
        }),
        defineField({
          name: 'poster',
          title: 'Image de couverture',
          description: 'Affichée avant que la vidéo ne soit chargée',
          type: 'image',
          options: { hotspot: true },
        }),
      ],
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
