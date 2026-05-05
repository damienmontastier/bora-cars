import { TagIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const carType = defineType({
  name: 'car',
  title: 'Voiture',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'marque',
      title: 'Marque',
      type: 'internationalizedArrayString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: (doc: any) => {
          const pickFr = (v: { language: string, value: string }[]) =>
            v?.find(x => x.language === 'fr')?.value ?? v?.[0]?.value ?? ''
          return `${pickFr(doc.marque)}-${pickFr(doc.modele)}`
        },
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'modele',
      title: 'Modèle',
      type: 'internationalizedArrayString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Lieu',
      type: 'reference',
      to: [{ type: 'location' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'customImage',
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [defineArrayMember({ type: 'customImage' })],
    }),
    defineField({
      name: 'rentalTypes',
      title: 'Types de location',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: {
        list: [
          { title: 'Longue durée', value: 'longue-duree' },
          { title: 'Professionnel', value: 'professionnel' },
          { title: 'Courte durée', value: 'courte-duree' },
        ],
        layout: 'grid',
      },
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'gamme',
      title: 'Gamme',
      type: 'string',
      options: {
        list: [
          { title: 'SUV', value: 'suv' },
          { title: 'Sportive', value: 'sportive' },
          { title: 'Berline', value: 'berline' },
          { title: 'Citadine', value: 'citadine' },
          { title: 'Compacte', value: 'compacte' },
          { title: 'Break', value: 'break' },
        ],
      },
    }),
    defineField({
      name: 'puissance',
      title: 'Nombre de CV',
      type: 'number',
    }),
    defineField({
      name: 'annee',
      title: 'Année',
      type: 'string',
      options: {
        list: Array.from({ length: new Date().getFullYear() - 1950 + 1 }, (_, i) => {
          const year = String(new Date().getFullYear() - i)
          return { title: year, value: year }
        }),
      },
    }),
    defineField({
      name: 'boiteVitesse',
      title: 'Boîte de vitesse',
      type: 'string',
      options: {
        list: [
          { title: 'Automatique', value: 'automatique' },
          { title: 'Manuelle', value: 'manuelle' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'nombrePlaces',
      title: 'Nombre de places',
      type: 'number',
    }),
    defineField({
      name: 'carburant',
      title: 'Carburant',
      type: 'string',
      options: {
        list: [
          { title: 'Essence', value: 'essence' },
          { title: 'Électrique', value: 'electrique' },
          { title: 'Diesel', value: 'diesel' },
          { title: 'Hybride Rechargeable', value: 'hybride-rechargeable' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'ageMinimum',
      title: 'Âge minimum (ans)',
      type: 'number',
      validation: (Rule) => Rule.min(18).integer(),
    }),
    defineField({
      name: 'anciennetePermis',
      title: 'Ancienneté de permis minimum (ans)',
      type: 'number',
      validation: (Rule) => Rule.min(0).integer(),
    }),
    defineField({
      name: 'dureeMinimum',
      title: 'Durée minimum de location (jours)',
      type: 'number',
      validation: (Rule) => Rule.min(1).integer(),
    }),
    defineField({
      name: 'kmJourInclus',
      title: 'Km par jour inclus',
      type: 'number',
    }),
    defineField({
      name: 'prixJournalier',
      title: 'Prix journalier (€)',
      type: 'number',
    }),
    defineField({
      name: 'caution',
      title: 'Caution (€)',
      type: 'number',
    }),
    defineField({
      name: 'prixKmSupplementaire',
      title: 'Prix km supplémentaire',
      type: 'object',
      fields: [
        defineField({
          name: 'prix',
          title: 'Prix (€)',
          type: 'number',
        }),
        defineField({
          name: 'km',
          title: 'Par X km',
          type: 'number',
        }),
      ],
    }),
    defineField({
      name: 'equipements',
      title: 'Équipements',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'paiementsAcceptes',
      title: 'Paiements acceptés',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: {
        list: [
          { title: 'Virement', value: 'virement' },
          { title: 'Carte', value: 'carte' },
          { title: 'Espèces', value: 'especes' },
        ],
        layout: 'grid',
      },
    }),
  ],
  preview: {
    select: { marque: 'marque', modele: 'modele' },
    prepare({ marque, modele }) {
      const pickFr = (v: { language: string, value: string }[] | string | undefined) =>
        Array.isArray(v) ? (v.find((x) => x.language === 'fr')?.value ?? v[0]?.value ?? '') : (v ?? '')
      return { title: [pickFr(marque as never), pickFr(modele as never)].filter(Boolean).join(' ') }
    },
  },
})
