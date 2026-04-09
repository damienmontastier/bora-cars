import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { linkField } from 'sanity-plugin-link-field'
import { schemaTypes } from './schemaTypes'

const SINGLETONS = new Set(['homepage', 'footer', 'menu', 'proprietaire', 'settings'])

export default defineConfig({
  name: 'default',
  title: 'bora-cars',

  projectId: 'xyw8hnp3',
  dataset: 'production',

  plugins: [
    linkField({ linkableSchemaTypes: ['homepage', 'proprietaire'] }),
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Homepage')
              .id('homepage')
              .child(
                S.document()
                  .schemaType('homepage')
                  .documentId('homepage'),
              ),
            S.listItem()
              .title('Footer')
              .id('footer')
              .child(
                S.document()
                  .schemaType('footer')
                  .documentId('footer'),
              ),
            S.listItem()
              .title('Menu')
              .id('menu')
              .child(
                S.document()
                  .schemaType('menu')
                  .documentId('menu'),
              ),
            S.listItem()
              .title('Propriétaire')
              .id('proprietaire')
              .child(
                S.document()
                  .schemaType('proprietaire')
                  .documentId('proprietaire'),
              ),
            S.listItem()
              .title('Paramètres')
              .id('settings')
              .child(
                S.document()
                  .schemaType('settings')
                  .documentId('settings'),
              ),
            S.divider(),
            S.documentTypeListItem('location').title('Lieux'),
            S.documentTypeListItem('car').title('Voitures'),
          ]),
    }),
    visionTool(),
  ],

  document: {
    actions: (input, { schemaType }) =>
      SINGLETONS.has(schemaType)
        ? input.filter(({ action }) => !['create', 'delete', 'duplicate'].includes(action ?? ''))
        : input,
  },

  schema: {
    types: schemaTypes,
  },
})
