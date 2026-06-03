// Variables d'environnement exposées au Studio (préfixe SANITY_STUDIO_),
// remplacées au build par le bundler Vite de Sanity.
declare const process: {
  readonly env: {
    readonly SANITY_STUDIO_NETLIFY_BUILD_HOOK?: string
    readonly [key: string]: string | undefined
  }
}
