import type { SeoData } from '~/queries/fragments'

export function usePageSeo(seo: Ref<SeoData | undefined>) {
  const { url: siteUrl } = useSiteConfig()
  const { t } = useI18n()

  const ogImage = computed(() => seo.value?.image || `${siteUrl}/og-bora-cars.jpg`)

  useSeoMeta({
    title: () => seo.value?.title || undefined,
    description: () => (seo.value?.description || t('seo.description')).trim(),
    ogImage: () => ogImage.value,
    // Dimensions obligatoires pour un aperçu fiable (WhatsApp/LinkedIn/Facebook
    // n'affichent pas toujours l'image sans elles). Lues dans l'URL — l'asset Sanity
    // porte sa taille dans son nom de fichier. Cf. `ogImageSize`.
    ogImageWidth: () => ogImageSize(ogImage.value)?.width,
    ogImageHeight: () => ogImageSize(ogImage.value)?.height,
  })
  // og:title, og:description → auto-inférés (automaticOgAndTwitterTags). Aucune balise
  // twitter:* : doublons de l'Open Graph, cf. `seo.automaticTwitterTags` dans nuxt.config.
  // Le node schema.org WebPage est généré automatiquement par nuxt-schema-org et infère
  // name/description depuis le <title>/<meta description> posés ci-dessus — pas besoin de
  // defineWebPage manuel (il ferait doublon avec le node auto-généré).
}
