// https://nuxt.com/docs/api/configuration/nuxt-config
import process from 'node:process'
import { DEFAULT_LANGUAGE, LANGUAGES } from '../shared/languages'

const LOCALE_IETF: Record<string, string> = { fr: 'fr-FR', en: 'en-GB' }

const locales = LANGUAGES.map(({ id }) => ({
  code: id,
  language: LOCALE_IETF[id] ?? id,
  isCatchallLocale: id === DEFAULT_LANGUAGE,
  files: [`${id}.json`],
}))

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      link: [
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
  ],

  sanity: {
    globalHelper: true,
    projectId: process.env.NUXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NUXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2026-04-06',
    perspective: 'published',
    useCdn: true,
    // visualEditing: {
    //   token: process.env.NUXT_SANITY_VISUAL_EDITING_TOKEN,
    //   studioUrl: process.env.NUXT_SANITY_VISUAL_EDITING_STUDIO_URL,
    // },
  },

  css: ['~/assets/scss/main.scss'],

  i18n: {
    baseUrl: process.env.NUXT_SITE_URL ?? 'https://bora-cars.netlify.app',
    strategy: 'prefix',
    compilation: {
      strictMessage: false,
      escapeHtml: false,
    },
    locales,
    defaultLocale: DEFAULT_LANGUAGE,
    skipSettingLocaleOnNavigate: true,
  },

  site: {
    url: process.env.NUXT_SITE_URL ?? 'https://bora-cars.netlify.app',
    name: 'BORA CARS',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Chez BORA CARS, nous vous accompagnons dans tous vos projets mobilité avec des solutions premium adaptées à vos besoins.',
    defaultLocale: DEFAULT_LANGUAGE,
    separator: '—',
    indexable: false,
  },

  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'BORA CARS',
      logo: '/favicon.svg',
    },
  },

  ogImage: { enabled: false },

  image: {
    format: ['avif', 'webp'],
    provider: process.env.NETLIFY ? 'netlify' : (process.env.npm_lifecycle_event === 'generate' ? 'ipxStatic' : 'ipx'),

    sanity: {
      projectId: process.env.NUXT_PUBLIC_SANITY_PROJECT_ID!,
      dataset: process.env.NUXT_PUBLIC_SANITY_DATASET || 'production',
    },

    screens: {
      sm: 800,
      md: 1280,
      lg: 1440,
      xl: 1920,
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
        name: 'Lora',
        src: '/fonts/Lora-Regular.woff2',
        weight: 400,
        global: true,
      },
      {
        name: 'HaasGrotDispMedium',
        src: '/fonts/HaasGrotDispMedium.woff2',
        weight: 600,
        global: true,
      },
      {
        name: 'HaasGrotDispRegular',
        src: '/fonts/HaasGrotDispRegular.woff2',
        weight: 400,
        global: true,
      },
    ],
  },

  runtimeConfig: {
    public: {
      IS_FTP: process.env.NUXT_PUBLIC_IS_FTP === 'true',
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
