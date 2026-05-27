// https://nuxt.com/docs/api/configuration/nuxt-config
import process from 'node:process'
import { defineOrganization } from 'nuxt-schema-org/schema'
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
    '@nuxt/a11y',
    '@nuxt/ui',
    '@nuxt/scripts',
  ],

  a11y: {
    logIssues: false,
  },

  scripts: {
    registry: {
      googleTagManager: {
        // ID injected at RUNTIME via runtimeConfig.public.scripts.googleTagManager.id
        // (env var: NUXT_PUBLIC_SCRIPTS_GOOGLE_TAG_MANAGER_ID).
        // This is critical: when the ID comes from runtime config, @nuxt/scripts
        // doesn't bundle gtm.js — it loads directly from googletagmanager.com.
        debug: process.env.NODE_ENV === 'development',
        // Google Consent Mode v2 — denied by default until the cookie banner is answered.
        // `wait_for_update: 500` tells gtag to queue events for up to 500ms so the
        // user's choice (pushed via consent.update()) is applied before tags fire.
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

  // Mock GTM in local dev so we don't pollute the GA4 property with our own clicks.
  $development: {
    scripts: {
      registry: {
        googleTagManager: 'mock',
      },
    },
  },

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

  css: ['~/assets/css/main.css', '~/assets/scss/main.scss'],

  i18n: {
    baseUrl: process.env.NUXT_SITE_URL ?? 'https://boracars.com',
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
    url: process.env.NUXT_SITE_URL ?? 'https://boracars.com',
    name: 'BORA CARS',
    defaultLocale: DEFAULT_LANGUAGE,
    separator: '—',
    indexable: process.env.NUXT_PUBLIC_IS_PROD === 'true',
  },

  schemaOrg: {
    identity: defineOrganization({
      name: 'BORA CARS',
      logo: `${process.env.NUXT_SITE_URL ?? 'https://boracars.com'}/favicon.svg`,
      sameAs: ['https://www.google.com/search?kgmid=/g/11yp0wsnj5'],
    }),
  },

  sitemap: process.env.NUXT_PUBLIC_IS_PROD === 'true'
    // En prod (under construction) : sitemap minimal avec juste la homepage (toutes les locales via _i18nTransform)
    ? { excludeAppSources: true, urls: [{ loc: '/', _i18nTransform: true }] }
    : { sources: ['/api/__sitemap__/urls'] },

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
        provider: 'local',
        weight: 400,
        display: 'swap',
        global: true,
      },
      {
        name: 'HaasGrotDispMedium',
        provider: 'local',
        weight: 600,
        display: 'swap',
        global: true,
      },
      {
        name: 'HaasGrotDispRegular',
        provider: 'local',
        weight: 400,
        display: 'swap',
        global: true,
      },
      {
        name: 'HaasGrotDispBold',
        provider: 'local',
        weight: 700,
        display: 'swap',
        global: true,
      },
    ],
  },

  runtimeConfig: {
    public: {
      IS_FTP: process.env.NUXT_PUBLIC_IS_FTP === 'true',
      IS_PROD: process.env.NUXT_PUBLIC_IS_PROD === 'true',
      scripts: {
        googleTagManager: {
          id: '', // NUXT_PUBLIC_SCRIPTS_GOOGLE_TAG_MANAGER_ID
        },
      },
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/sitemap.xml', '/robots.txt'],
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
