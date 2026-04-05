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
    '@tresjs/nuxt',
    '@nuxtjs/robots',
    '@nuxtjs/i18n',
  ],

  css: ['~/assets/scss/main.scss'],

  tres: {
    glsl: true,
  },

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
        name: 'Noto Sans',
        provider: 'google',
        global: true,
      },
      {
        name: 'LocalFont1',
        src: '/fonts/Pacifico-Regular.woff2',
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
