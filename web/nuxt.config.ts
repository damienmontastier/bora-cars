// https://nuxt.com/docs/api/configuration/nuxt-config
import process from 'node:process'
import { DEFAULT_LANGUAGE, LANGUAGES } from '../shared/languages'
import { I18N_PAGES } from './app/config/I18N_CONFIG'

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
    // Pas de `globalHelper` ($sanity global) : la doc le déconseille et on ne
    // l'utilise pas — useSanity()/useSanityQuery() sont auto-importés sans lui.
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
    // URLs traduites par locale — définies dans app/config/I18N_CONFIG.ts.
    // `customRoutes: 'config'` indique à i18n de lire les chemins depuis `pages`
    // (et non depuis les composants). Liens internes → toujours via nom de route.
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

  // Apex `/` → /fr en 301 SERVEUR (edge). Avec `strategy: 'prefix'` aucune route
  // n'existe pour `/` (seules /fr et /en). Sans cette règle, l'apex était redirigé
  // PENDANT l'hydratation par `detectBrowserLanguage` (défaut i18n) — donc EN JS —
  // ce que PSI signale comme « redirection supplémentaire côté client » (mauvais pour
  // perf + SEO). Le preset Nitro `netlify` compile cette routeRules dans `_redirects`
  // → vraie 301 au bord du CDN, AVANT toute fonction ou JS. Elle intercepte `/` avant
  // que detectBrowserLanguage ne tourne, qu'on laisse donc ACTIVÉ (`redirectOn: 'root'`
  // ne touche que l'apex, désormais géré ici ; conserver le défaut est recommandé côté
  // SEO i18n). Query string préservée automatiquement par Netlify.
  routeRules: {
    '/': { redirect: { to: '/fr', statusCode: 301 } },
  },

  site: {
    url: process.env.NUXT_SITE_URL ?? 'https://boracars.com',
    name: 'BORA CARS',
    defaultLocale: DEFAULT_LANGUAGE,
    separator: '—',
    indexable: process.env.NUXT_PUBLIC_IS_PROD === 'true',
    // Pas de trailing slash (= défaut Nuxt/Nuxt-SEO, « most Nuxt sites don't need
    // trailing slashes »). Pilote canonical / og:url / sitemap → tous en `/fr` (sans
    // slash). Explicite pour figer l'intention (et garder cohérent avec le serveur,
    // cf. nitro.prerender.autoSubfolderIndex ci-dessous).
    trailingSlash: false,
  },

  schemaOrg: {
    // L'identité (AutoRental — location de voitures) est définie dynamiquement depuis
    // Sanity dans app.vue (useSchemaOrg + defineLocalBusiness). WebSite/WebPage (+ leur
    // i18n) sont auto-générés par le module et se rattachent à l'identité par @id (#identity).
    //
    // `reactive: false` est VOLONTAIRE : en `true`, le JSON-LD est rendu au SSR PUIS
    // ré-injecté côté client → unhead fusionne les deux nodes #identity (même @id) et
    // CONCATÈNE leurs tableaux (`sameAs`/`areaServed` apparaissent en double). Le JSON-LD
    // n'étant lu que par les crawlers (qui voient le HTML SSR/prérendu, jamais la nav SPA),
    // la réactivité au switch de langue n'apporte rien — on la coupe pour éviter le doublon.
    reactive: false,
  },

  // Sitemap complet : pages statiques auto-découvertes (home, proprietaire,
  // professionnel, contact…) + fiches voitures via la source dynamique
  // (/api/__sitemap__/urls → /car/<slug> pour chaque locale via _i18nTransform).
  sitemap: { sources: ['/api/__sitemap__/urls'] },

  ogImage: { enabled: false },

  image: {
    format: ['avif', 'webp'],
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
      // Above-design breakpoint: lets a `sizes` string opt into a higher srcset
      // ceiling for >1920 displays (2560 / 4K / 5K externals) by referencing an
      // `xxl:` key. Purely additive — only images whose `sizes` include `xxl:`
      // emit the extra candidate, so it never bloats existing images.
      xxl: 2560,
    },
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  fonts: {
    // Polices locales servies depuis web/public/fonts/.
    // On passe un `src` explicite plutôt que `provider: 'local'` : le provider
    // local déduit la graisse du NOM de fichier et retire les mots-clés
    // « Medium »/« Bold » du nom de famille, ce qui empêche de matcher des
    // familles nommées HaasGrotDispMedium/HaasGrotDispBold (d'où les warnings
    // « Could not produce font face declaration from local »). Avec un `src`,
    // @nuxt/fonts émet la @font-face directement et court-circuite l'heuristique.
    families: [
      {
        name: 'Lora',
        src: '/fonts/Lora-Regular.woff2',
        weight: 400,
        style: 'normal',
        display: 'swap',
        global: true,
      },
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
    airtableToken: '', // NUXT_AIRTABLE_TOKEN — PAT scoped to data.records:write on the CRM base
    airtableBaseId: '', // NUXT_AIRTABLE_BASE_ID
    airtableTableId: '', // NUXT_AIRTABLE_TABLE_ID
    public: {
      IS_PROD: process.env.NUXT_PUBLIC_IS_PROD === 'true',
      scripts: {
        googleTagManager: {
          id: '', // NUXT_PUBLIC_SCRIPTS_GOOGLE_TAG_MANAGER_ID
        },
      },
    },
  },

  nitro: {
    // Toujours le preset `netlify` (jamais `netlify_static`) : la prod a besoin de
    // Netlify Functions au runtime pour `/api/contact` (Airtable, token serveur) ET
    // pour `/_i18n/<hash>/<locale>/messages.json` (chargement des traductions par
    // @nuxtjs/i18n). `netlify_static` ne déploie AUCUNE fonction → ces deux routes
    // 404 en prod. On obtient le "SSG" voulu en PRÉRENDANT les pages (HTML statique
    // servi par le CDN) tout en gardant les fonctions : c'est le vrai hybride
    // statique + serverless. Local dev = serveur Nitro par défaut.
    preset: 'netlify',
    prerender: {
      crawlLinks: true,
      // NE PAS écrire le stub `/index.html`. La routeRule `'/': redirect 301` (plus
      // haut) génère bien la règle `_redirects` au bord du CDN, MAIS la passe de
      // prerender matérialise aussi la redirection en un `index.html` (meta-refresh
      // vers /fr) à la racine. Or Netlify sert un fichier statique AVANT d'appliquer
      // une règle `_redirects` non-forcée (« shadowing ») → l'apex renvoyait
      // `200 + meta-refresh` au lieu de la 301 voulue (la racine étant l'URL où
      // Google lit le « nom du site », il n'y trouvait qu'un stub vide). En sautant
      // le rendu de `/`, plus de fichier à servir → la règle `_redirects 301`
      // s'applique proprement. Matcher EXACT (jamais `'/'` en string : Nitro le
      // matche en `startsWith` → ignorerait TOUTES les routes). `_redirects` est
      // généré depuis routeRules (finalisation du preset), indépendant du prerender.
      ignore: [route => route === '/'],
      // Écrit `fr.html` au lieu de `fr/index.html` → Netlify sert `/fr` en 200 DIRECT
      // (et redirige `/fr/` → `/fr`), au lieu de l'inverse. Aligne le serveur sur la
      // canonical/sitemap déjà déclarées sans slash (site.trailingSlash: false). Sinon :
      // canonical `/fr` pointant vers une 301 → bruit GSC (« Page avec redirection »,
      // canonique déclarée ≠ choisie). N'affecte que le nommage des HTML prérendus —
      // pas les fonctions /api ni /_i18n/*.messages.json (servies par Netlify Functions).
      autoSubfolderIndex: false,
      // Prod : on prérend les pages localisées (crawl depuis /fr et /en) → HTML
      // statique. La passe de prerender déclenche aussi l'écriture des
      // `/_i18n/.../messages.json` (via prerenderRoutes() dans le plugin i18n).
      // Develop : SSR pur (pages rendues à la volée par la fonction), build plus
      // rapide et contenu Sanity toujours frais.
      routes: process.env.NUXT_PUBLIC_IS_PROD === 'true'
        ? ['/fr', '/en', '/sitemap.xml', '/robots.txt']
        : ['/sitemap.xml', '/robots.txt'],
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
