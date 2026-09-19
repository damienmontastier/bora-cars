import { createElement } from 'react'
import { defineConfig, defineField } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { linkField } from 'sanity-plugin-link-field'
import { internationalizedArray } from 'sanity-plugin-internationalized-array'
import { assist } from '@sanity/assist'
import { frFRLocale } from '@sanity/locale-fr-fr'
import { HomeIcon } from '@sanity/icons/Home'
import { UserIcon } from '@sanity/icons/User'
import { CaseIcon } from '@sanity/icons/Case'
import { MenuIcon } from '@sanity/icons/Menu'
import { StackCompactIcon } from '@sanity/icons/StackCompact'
import { PinIcon } from '@sanity/icons/Pin'
import { DocumentsIcon } from '@sanity/icons/Documents'
import { CogIcon } from '@sanity/icons/Cog'
import { EnvelopeIcon } from '@sanity/icons/Envelope'
import { ArchiveIcon } from '@sanity/icons/Archive'
import { DocumentTextIcon } from '@sanity/icons/DocumentText'
import { RocketIcon } from '@sanity/icons/Rocket'
import { TranslateIcon } from '@sanity/icons/Translate'
import { LinkIcon } from '@sanity/icons/Link'
import { DashboardIcon } from '@sanity/icons/Dashboard'
import { schemaTypes } from './schemaTypes'
import { SUPPORTED_LANGUAGES, LOCALIZED_DOCUMENT_TYPES, SINGLETON_TYPES } from './schemaTypes/constants'
import { StudioLayout } from './components/StudioLayout'
import { DeployTool } from './components/DeployTool'
import { DashboardTool } from './components/dashboard/DashboardTool'

const CarIcon = () => createElement('span', null, '🚗')

const SINGLETONS = new Set(SINGLETON_TYPES)

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
              S.divider(),
              S.listItem().title('Catalogue').id('catalogue').icon(ArchiveIcon)
                .child(S.document().schemaType('catalogue').documentId('catalogue')),
              S.listItem().title('Catalogue professionnel').id('catalogueProfessionnel').icon(CaseIcon)
                .child(S.document().schemaType('catalogueProfessionnel').documentId('catalogueProfessionnel')),
              S.divider(),
              S.listItem().title('Page Voiture').id('carPage').icon(CarIcon)
                .child(S.document().schemaType('carPage').documentId('carPage')),
              S.documentTypeListItem('legalPage').title('Pages légales').icon(DocumentTextIcon),
              S.divider(),
              S.listItem().title('Bio (réseaux sociaux)').id('bio').icon(LinkIcon)
                .child(S.document().schemaType('bio').documentId('bio')),
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
      S.listItem().title('Glossaire (traductions)').id('glossaire').icon(TranslateIcon)
        .child(S.document().schemaType('glossaire').documentId('glossaire')),
      S.listItem().title('Paramètres').id('settings').icon(CogIcon)
        .child(S.document().schemaType('settings').documentId('settings')),
    ])

export default defineConfig({
  name: 'bora',
  title: 'Bora Cars',
  projectId: 'xyw8hnp3',
  dataset: 'production',
  plugins: [
    frFRLocale(),
    linkField({ linkableSchemaTypes: ['homepage', 'proprietaire', 'professionnel', 'car', 'contact', 'catalogue', 'catalogueProfessionnel', 'legalPage'] }),
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
          name: 'legalBlock',
          title: 'Legal block content',
          type: 'array',
          of: [{
            type: 'block',
            styles: [
              { title: 'Paragraphe', value: 'normal' },
              { title: 'H3', value: 'h3' },
            ],
            lists: [
              { title: 'Liste', value: 'bullet' },
            ],
            marks: {
              decorators: [
                { title: 'Gras', value: 'strong' },
                { title: 'Souligné', value: 'underline' },
              ],
              annotations: [
                { name: 'link', title: 'Lien', type: 'link' },
              ],
            },
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
  tools: (prev) => [
    {
      name: 'dashboard',
      title: 'Dashboard',
      icon: DashboardIcon,
      component: DashboardTool,
    },
    ...prev,
    {
      name: 'deploy',
      title: 'Mise en ligne',
      icon: RocketIcon,
      component: DeployTool,
    },
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
