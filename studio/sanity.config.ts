import { createElement } from 'react'
import { defineConfig, defineField } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { linkField } from 'sanity-plugin-link-field'
import { internationalizedArray } from 'sanity-plugin-internationalized-array'
import { assist } from '@sanity/assist'
import {
  HomeIcon,
  UserIcon,
  CaseIcon,
  MenuIcon,
  StackCompactIcon,
  PinIcon,
  DocumentsIcon,
  CogIcon,
  EnvelopeIcon,
  ArchiveIcon,
} from '@sanity/icons'
import { schemaTypes } from './schemaTypes'
import { SUPPORTED_LANGUAGES, LOCALIZED_DOCUMENT_TYPES } from './schemaTypes/constants'
import { StudioLayout } from './components/StudioLayout'

const CarIcon = () => createElement('span', null, '🚗')

const SINGLETONS = new Set(['homepage', 'footer', 'menu', 'proprietaire', 'professionnel', 'contact', 'settings', 'catalogue'])

const structure = (S: any) =>
  S.list()
    .title('Contenu')
    .items([
      S.listItem()
        .title('Pages')
        .icon(DocumentsIcon)
        .child(
          S.list()
            .title('Pages')
            .items([
              S.listItem().title('Homepage').id('homepage').icon(HomeIcon)
                .child(S.document().schemaType('homepage').documentId('homepage')),
              S.listItem().title('Propriétaire').id('proprietaire').icon(UserIcon)
                .child(S.document().schemaType('proprietaire').documentId('proprietaire')),
              S.listItem().title('Professionnel').id('professionnel').icon(CaseIcon)
                .child(S.document().schemaType('professionnel').documentId('professionnel')),
              S.listItem().title('Contact').id('contact').icon(EnvelopeIcon)
                .child(S.document().schemaType('contact').documentId('contact')),
              S.listItem().title('Catalogue').id('catalogue').icon(ArchiveIcon)
                .child(S.document().schemaType('catalogue').documentId('catalogue')),
            ]),
        ),
      S.divider(),
      S.documentTypeListItem('car').title('Voitures').icon(CarIcon),
      S.documentTypeListItem('location').title('Lieux').icon(PinIcon),
      S.divider(),
      S.listItem().title('Menu').id('menu').icon(MenuIcon)
        .child(S.document().schemaType('menu').documentId('menu')),
      S.listItem().title('Footer').id('footer').icon(StackCompactIcon)
        .child(S.document().schemaType('footer').documentId('footer')),
      S.divider(),
      S.listItem().title('Paramètres').id('settings').icon(CogIcon)
        .child(S.document().schemaType('settings').documentId('settings')),
    ])

export default defineConfig({
  name: 'bora',
  title: 'Bora Cars',
  projectId: 'xyw8hnp3',
  dataset: 'production',
  plugins: [
    linkField({ linkableSchemaTypes: ['homepage', 'proprietaire', 'professionnel', 'car', 'contact', 'catalogue'] }),
    internationalizedArray({
      languages: SUPPORTED_LANGUAGES,
      defaultLanguages: ['fr', 'en'],
      buttonLocations: ['field', 'document'],
      buttonAddAll: true,
      languageDisplay: 'titleAndCode',
      fieldTypes: [
        defineField({ name: 'string', type: 'string' }),
        defineField({ name: 'text', type: 'text' }),
        defineField({
          name: 'block',
          title: 'Block content',
          type: 'array',
          of: [{
            type: 'block',
            styles: [
              { title: 'H3', value: 'h3' },
            ],
            lists: [],
          }],
        }),
        defineField({
          name: 'stringList',
          title: 'String list',
          type: 'array',
          of: [{ type: 'string' }],
        }),
      ],
      languageFilter: {
        documentTypes: LOCALIZED_DOCUMENT_TYPES,
      },
    }),
    assist(),
    structureTool({ structure }),
    visionTool(),
  ],
  document: {
    actions: (input: any[], { schemaType }: { schemaType: string }) =>
      SINGLETONS.has(schemaType)
        ? input.filter(({ action }) => !['create', 'delete', 'duplicate'].includes(action ?? ''))
        : input,
  },
  studio: {
    components: {
      layout: StudioLayout,
    },
  },
  schema: {
    types: schemaTypes,
  },
})
