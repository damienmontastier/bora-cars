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
} from '@sanity/icons'
import { schemaTypes } from './schemaTypes'
import { SUPPORTED_LANGUAGES, LOCALIZED_DOCUMENT_TYPES } from './schemaTypes/constants'
import { LANGUAGES } from '../shared/languages'
import { CustomNavbar } from './components/LangSwitcher'
import { StudioLayout } from './components/StudioLayout'

const CarIcon = () => createElement('span', null, '🚗')

const SINGLETONS = new Set(['homepage', 'footer', 'menu', 'proprietaire', 'professionnel', 'contact', 'settings'])

const FlagIcon = (emoji: string) => () => createElement('span', { style: { fontSize: '1.2em' } }, emoji)

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

const createWorkspace = ({ id: lang, title, flag }: (typeof LANGUAGES)[number]) => {
  const lockOtherLangs = ({ parent }: { parent?: { language?: string } }) =>
    typeof parent?.language === 'string' && parent.language !== lang

  return {
    name: `bora-${lang}`,
    basePath: `/${lang}`,
    title: `Bora · ${title}`,
    icon: FlagIcon(flag),
    projectId: 'xyw8hnp3',
    dataset: 'production',
    plugins: [
      linkField({ linkableSchemaTypes: ['homepage', 'proprietaire', 'professionnel', 'car', 'contact'] }),
      internationalizedArray({
        languages: SUPPORTED_LANGUAGES,
        defaultLanguages: SUPPORTED_LANGUAGES.map((l) => l.id),
        buttonLocations: [],
        buttonAddAll: false,
        fieldTypes: [
          defineField({ name: 'string', type: 'string', readOnly: lockOtherLangs }),
          defineField({ name: 'text', type: 'text', readOnly: lockOtherLangs }),
          defineField({
            name: 'block',
            title: 'Block content',
            type: 'array',
            of: [{ type: 'block' }],
            readOnly: lockOtherLangs,
          }),
        ],
        languageFilter: {
          documentTypes: LOCALIZED_DOCUMENT_TYPES,
          defaultLanguages: [lang],
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
        navbar: CustomNavbar,
        layout: StudioLayout,
      },
    },
    schema: {
      types: schemaTypes,
    },
  }
}

export default defineConfig(LANGUAGES.map(createWorkspace))
