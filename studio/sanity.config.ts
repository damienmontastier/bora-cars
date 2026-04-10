import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { linkField } from 'sanity-plugin-link-field'
import {
  HomeIcon,
  UserIcon,
  MenuIcon,
  StackCompactIcon,
  ControlsIcon,
  CubeIcon,
  PinIcon,
  DocumentsIcon,
  CogIcon,
} from '@sanity/icons'
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
          .title('Contenu')
          .items([
            // ── Pages ──────────────────────────────────
            S.listItem()
              .title('Pages')
              .icon(DocumentsIcon)
              .child(
                S.list()
                  .title('Pages')
                  .items([
                    S.listItem()
                      .title('Homepage')
                      .id('homepage')
                      .icon(HomeIcon)
                      .child(
                        S.document()
                          .schemaType('homepage')
                          .documentId('homepage'),
                      ),
                    S.listItem()
                      .title('Propriétaire')
                      .id('proprietaire')
                      .icon(UserIcon)
                      .child(
                        S.document()
                          .schemaType('proprietaire')
                          .documentId('proprietaire'),
                      ),
                  ]),
              ),

            // ── Catalogue ──────────────────────────────
            S.listItem()
              .title('Catalogue')
              .icon(CubeIcon)
              .child(
                S.list()
                  .title('Catalogue')
                  .items([
                    S.documentTypeListItem('car').title('Voitures').icon(CubeIcon),
                    S.documentTypeListItem('location').title('Lieux').icon(PinIcon),
                  ]),
              ),

            S.divider(),

            // ── Configuration ──────────────────────────
            S.listItem()
              .title('Navigation')
              .icon(MenuIcon)
              .child(
                S.list()
                  .title('Navigation')
                  .items([
                    S.listItem()
                      .title('Menu')
                      .id('menu')
                      .icon(MenuIcon)
                      .child(
                        S.document()
                          .schemaType('menu')
                          .documentId('menu'),
                      ),
                    S.listItem()
                      .title('Footer')
                      .id('footer')
                      .icon(StackCompactIcon)
                      .child(
                        S.document()
                          .schemaType('footer')
                          .documentId('footer'),
                      ),
                  ]),
              ),
            S.listItem()
              .title('Paramètres')
              .id('settings')
              .icon(CogIcon)
              .child(
                S.document()
                  .schemaType('settings')
                  .documentId('settings'),
              ),
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
