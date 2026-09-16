import { defineCliConfig } from 'sanity/cli'

// Port du serveur de dev. Le défaut Sanity (3333) est partagé par TOUS les Studios
// de la machine : dès qu'un autre projet Sanity tourne, `sanity dev` échoue avec
// « Port 3333 is already in use ». On fixe donc un port propre à bora-cars, et on
// laisse la main via la variable d'env `SANITY_STUDIO_PORT` (ou `--port` en one-shot :
// `npm run dev -- --port 3335`, le flag CLI l'emportant sur cette config).
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
