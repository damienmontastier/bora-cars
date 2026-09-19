import process from 'node:process'
import { DEFAULT_LANGUAGE, LANGUAGES } from '../shared/languages'
import { I18N_PAGES } from './app/config/I18N_CONFIG'

const LOCALE_IETF: Record<string, string> = { fr: 'fr-FR', en: 'en-GB' }

const BIO_PATHS = Object.entries(I18N_PAGES.bio ?? {})
  .flatMap(([locale, path]) => (typeof path === 'string' ? [`/${locale}${path}`] : []))
const BIO_DEFAULT_PATH = `/${DEFAULT_LANGUAGE}${I18N_PAGES.bio?.[DEFAULT_LANGUAGE] ?? '/bio'}`

const locales = LANGUAGES.map(({ id }) => ({
  code: id,
  language: LOCALE_IETF[id] ?? id,
  isCatchallLocale: id === DEFAULT_LANGUAGE,
  files: [`${id}.json`],
}))

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  experimental: {
    payloadExtraction: 'client',
  },

  app: {
    head: {
      link: [
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/HaasGrotDispMedium.woff2', crossorigin: 'anonymous' },
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/HaasGrotDispRegular.woff2', crossorigin: 'anonymous' },
        { rel: 'icon', type: 'image/png', href: '/favicon-96x96.png', sizes: '96x96' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'shortcut icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
      meta: [
        { name: 'theme-color', content: '#E6E7DF' },
        { name: 'color-scheme', content: 'light' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      noscript: [
        { innerHTML: '<style>.app-preloader{display:none!important}</style>' },
      ],
    },
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/fonts',
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/seo',
    '@nuxtjs/i18n',
    '@nuxtjs/sanity',
    'lenis/nuxt',
    '@nuxt/scripts',
  ],

  scripts: {
    registry: {
      googleTagManager: {
        trigger: 'onNuxtReady',
        scriptOptions: { skipValidation: true },
        debug: process.env.NODE_ENV === 'development',
        defaultConsent: {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          analytics_storage: 'denied',
          wait_for_update: 500,
        },
      },
    },
  },

  $development: {
    scripts: {
      registry: {
        googleTagManager: 'mock',
      },
    },
  },

  sanity: {
    projectId: process.env.NUXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NUXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2026-04-06',
    perspective: 'published',
    useCdn: true,
    minimal: true,
  },

  css: ['~/assets/scss/main.scss'],

  i18n: {
    baseUrl: process.env.NUXT_SITE_URL ?? 'https://boracars.com',
    strategy: 'prefix',
    customRoutes: 'config',
    pages: I18N_PAGES,
    compilation: {
      strictMessage: false,
      escapeHtml: false,
    },
    locales,
    defaultLocale: DEFAULT_LANGUAGE,
    skipSettingLocaleOnNavigate: true,
  },

  routeRules: {
    '/': { redirect: { to: '/fr', statusCode: 301 } },
    '/bio': { redirect: { to: BIO_DEFAULT_PATH, statusCode: 301 } },
    ...Object.fromEntries(BIO_PATHS.map(path => [path, { robots: 'noindex, follow' }])),
    '/en/catalogue': { redirect: { to: '/en/catalog', statusCode: 301 } },
  },

  site: {
    url: process.env.NUXT_SITE_URL ?? 'https://boracars.com',
    name: 'BORA CARS',
    defaultLocale: DEFAULT_LANGUAGE,
    separator: '—',
    indexable: process.env.NUXT_PUBLIC_IS_PROD === 'true',
    trailingSlash: false,
  },

  seo: {
    automaticTwitterTags: false,
  },

  schemaOrg: {
    // true dédouble sameAs/areaServed (nœud #identity fusionné SSR + client)
    reactive: false,
  },

  sitemap: { sources: ['/api/__sitemap__/urls'] },

  ogImage: { enabled: false },

  image: {
    provider: process.env.NETLIFY ? 'netlify' : (process.env.npm_lifecycle_event === 'generate' ? 'ipxStatic' : 'ipx'),

    quality: 90,

    sanity: {
      projectId: process.env.NUXT_PUBLIC_SANITY_PROJECT_ID!,
      dataset: process.env.NUXT_PUBLIC_SANITY_DATASET || 'production',
    },

    screens: {
      sm: 800,
      md: 1280,
      lg: 1440,
      xl: 1920,
      xxl: 2560,
    },
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  fonts: {
    families: [
      {
        name: 'HaasGrotDispMedium',
        src: '/fonts/HaasGrotDispMedium.woff2',
        weight: 600,
        style: 'normal',
        display: 'swap',
        global: true,
      },
      {
        name: 'HaasGrotDispRegular',
        src: '/fonts/HaasGrotDispRegular.woff2',
        weight: 400,
        style: 'normal',
        display: 'swap',
        global: true,
      },
      {
        name: 'HaasGrotDispBold',
        src: '/fonts/HaasGrotDispBold.woff2',
        weight: 700,
        style: 'normal',
        display: 'swap',
        global: true,
      },
    ],
  },

  runtimeConfig: {
    airtableToken: '',
    airtableBaseId: '',
    airtableTableId: '',
    public: {
      IS_PROD: process.env.NUXT_PUBLIC_IS_PROD === 'true',
      scripts: {
        googleTagManager: {
          id: '',
        },
      },
    },
  },

  nitro: {
    preset: 'netlify',
    prerender: {
      crawlLinks: true,
      // Sinon le prerender écrit un stub HTML qui masque la 301 de _redirects
      ignore: [route => route === '/' || route === '/bio'],
      autoSubfolderIndex: false,
      routes: process.env.NUXT_PUBLIC_IS_PROD === 'true'
        ? ['/fr', '/en', ...BIO_PATHS, '/sitemap.xml', '/robots.txt']
        : ['/sitemap.xml', '/robots.txt'],
    },
  },

  hooks: {
    'build:manifest': (manifest) => {
      for (const item of Object.values(manifest))
        item.dynamicImports = item.dynamicImports?.filter(key => !key.includes('tweakpane'))
    },
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "@/assets/scss/_variables.scss" as *;
            @use "@/assets/scss/_mixins.scss" as *;
            @use "@/assets/scss/_functions.scss" as *;
            @use "@/assets/scss/_layout.scss" as *;
          `,
        },
      },
    },
  },
})
