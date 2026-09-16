// Variables d'environnement exposées au Studio (préfixe SANITY_STUDIO_),
// remplacées au build par le bundler Vite de Sanity.
declare const process: {
  readonly env: {
    readonly SANITY_STUDIO_NETLIFY_BUILD_HOOK?: string
    readonly SANITY_STUDIO_SITE_URL?: string
    readonly SANITY_STUDIO_PREVIEW_SITE_URL?: string
    readonly [key: string]: string | undefined
  }
}

// TypeScript 6 vérifie désormais les imports d'effet de bord vers des modules
// sans déclaration (TS2882) — ex. `import 'react-grid-layout/css/styles.css'`,
// résolu par le bundler Vite du Studio, pas par tsc.
declare module '*.css'
