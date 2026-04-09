// https://nuxt.com/docs/api/configuration/nuxt-config

const locales = [
  { code: 'fr-fr', language: 'fr-fr', files: ['fr-fr.json'] },
  { code: 'uk-en', language: 'uk-en', files: ['uk-en.json'] },
]

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/fonts',
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/robots',
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
    strategy: 'prefix',
    compilation: {
      strictMessage: false,
      escapeHtml: false,
    },
    locales,
    defaultLocale: 'fr-fr',
  },

  site: { indexable: false },

  image: {
    format: ['avif', 'webp'],
    provider: process.env.npm_lifecycle_event === 'generate' ? 'ipxStatic' : 'ipx',

    sanity: {
      projectId: process.env.NUXT_PUBLIC_SANITY_PROJECT_ID,
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
