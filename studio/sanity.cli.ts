import { defineCliConfig } from 'sanity/cli'

const DEFAULT_DEV_PORT = 3334

export default defineCliConfig({
  api: {
    projectId: 'xyw8hnp3',
    dataset: 'production',
  },
  deployment: {
    appId: 'mql39wepjvu6issn6mrrv1ej',
  },
  server: {
    port: Number(process.env.SANITY_STUDIO_PORT) || DEFAULT_DEV_PORT,
  },
})
