declare const process: {
  readonly env: {
    readonly SANITY_STUDIO_NETLIFY_BUILD_HOOK?: string
    readonly SANITY_STUDIO_SITE_URL?: string
    readonly SANITY_STUDIO_PREVIEW_SITE_URL?: string
    readonly [key: string]: string | undefined
  }
}

declare module '*.css'
