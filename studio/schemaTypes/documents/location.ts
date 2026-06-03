import { PinIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { requireAllLanguages } from '../../lib/i18nValidation'

export const locationType = defineType({
  name: 'location',
  title: 'Lieu',
  type: 'document',
  icon: PinIcon,
  fields: [
    defineField({
      name: 'city',
      title: 'Ville (libellé affiché)',
      type: 'internationalizedArrayString',
      description: 'Nom court de l’agence affiché sur le site + dans le nom schema.org (ex. « Paris »). Peut être un libellé marketing différent de la ville postale réelle (ex. agence à Neuilly affichée « Paris »).',
      validation: (Rule) => requireAllLanguages(Rule),
    }),
    defineField({
      name: 'address',
      title: 'Adresse — Rue',
      type: 'text',
      rows: 2,
      description: 'N° + voie uniquement, ex. « 12 avenue Charles de Gaulle ». Non traduit. → schema.org streetAddress.',
    }),
    defineField({
      name: 'postalCode',
      title: 'Code postal',
      type: 'string',
      description: 'Ex. 92200. → schema.org postalCode.',
    }),
    defineField({
      name: 'addressLocality',
      title: 'Ville (adresse réelle)',
      type: 'string',
      description: 'La VRAIE ville de l’adresse postale, ex. « Neuilly-sur-Seine » (≠ le libellé affiché). → schema.org addressLocality.',
    }),
    defineField({
      name: 'country',
      title: 'Pays (code ISO)',
      type: 'string',
      initialValue: 'FR',
      description: 'Code ISO 3166-1 alpha-2 — FR (France), CH (Suisse), MC (Monaco). → schema.org addressCountry.',
    }),
    defineField({
      name: 'description',
      title: 'Description (SEO)',
      type: 'internationalizedArrayText',
      description: 'Description courte de l’agence pour le schema.org (optionnel). Si vide, la description de marque est utilisée.',
    }),
    defineField({
      name: 'phone',
      title: 'Téléphone',
      type: 'customLink',
      description: 'Ex: tel:+33612345678',
      options: { enableText: false },
    }),
    defineField({
      name: 'link',
      title: 'Lien',
      type: 'customLink',
      description: 'Lien optionnel (ex: Google Maps / fiche Google Business). Le libellé affiché reste le nom de la ville. Sert aussi de schema.org sameAs de cette agence — recommandé : l\'URL canonique « https://www.google.com/search?kgmid=… ».',
    }),
    defineField({
      name: 'geo',
      title: 'Coordonnées GPS',
      type: 'object',
      description: 'Optionnel. Latitude / longitude — Google Maps : clic droit sur le point exact → les coordonnées se copient. schema.org geo.',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'lat', title: 'Latitude', type: 'number' }),
        defineField({ name: 'lng', title: 'Longitude', type: 'number' }),
      ],
    }),
    defineField({
      name: 'openingHours',
      title: 'Horaires d\'ouverture',
      type: 'array',
      description: 'Optionnel (Google connaît déjà les horaires via la fiche). schema.org openingHoursSpecification — regrouper les jours qui partagent les mêmes horaires.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'openingHoursSpec',
          fields: [
            defineField({
              name: 'days',
              title: 'Jours',
              type: 'array',
              of: [defineArrayMember({ type: 'string' })],
              options: {
                list: [
                  { title: 'Lundi', value: 'Monday' },
                  { title: 'Mardi', value: 'Tuesday' },
                  { title: 'Mercredi', value: 'Wednesday' },
                  { title: 'Jeudi', value: 'Thursday' },
                  { title: 'Vendredi', value: 'Friday' },
                  { title: 'Samedi', value: 'Saturday' },
                  { title: 'Dimanche', value: 'Sunday' },
                ],
              },
            }),
            defineField({
              name: 'open24h',
              title: 'Ouvert 24h/24',
              type: 'boolean',
              initialValue: false,
              description: 'Si coché : ouvert toute la journée (00:00–23:59) pour les jours sélectionnés. Masque Ouverture/Fermeture.',
            }),
            defineField({
              name: 'opens',
              title: 'Ouverture',
              type: 'string',
              description: 'Format 24 h HH:MM, ex. 09:00',
              hidden: ({ parent }) => parent?.open24h === true,
            }),
            defineField({
              name: 'closes',
              title: 'Fermeture',
              type: 'string',
              description: 'Format 24 h HH:MM, ex. 19:00',
              hidden: ({ parent }) => parent?.open24h === true,
            }),
          ],
          preview: {
            select: { days: 'days', opens: 'opens', closes: 'closes', open24h: 'open24h' },
            prepare({ days, opens, closes, open24h }) {
              return {
                title: (days || []).join(', ') || 'Jours',
                subtitle: open24h ? 'Ouvert 24h/24' : (opens && closes ? `${opens} – ${closes}` : ''),
              }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { city: 'city', address: 'address', postalCode: 'postalCode', addressLocality: 'addressLocality' },
    prepare({ city, address, postalCode, addressLocality }) {
      const pickFr = (v: { language: string, value: string }[] | string | undefined) =>
        Array.isArray(v) ? (v.find((x) => x.language === 'fr')?.value ?? v[0]?.value ?? '') : (v ?? '')
      const line = [address, [postalCode, addressLocality].filter(Boolean).join(' ')].filter(Boolean).join(', ')
      return { title: pickFr(city as never), subtitle: line }
    },
  },
})
