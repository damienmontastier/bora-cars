import type { SeoData } from '~/queries/fragments'

// JPEG plutôt que WebP : LinkedIn n'affiche pas d'aperçu pour une og:image WebP.
export function useOgImageUrl() {
  const $img = useImage()
  const { url: siteUrl } = useSiteConfig()

  return (seo?: SeoData) => {
    if (!seo?.image)
      return `${siteUrl}/og-bora-cars.jpg`
    // ID d'asset plutôt qu'URL CDN : sinon le provider ne convertit pas `crop` en `rect`.
    return $img(sanityUrlToAssetId(seo.image) ?? seo.image, {
      width: 1200,
      height: 630,
      fit: 'cover',
      format: 'jpg',
      quality: 90,
      ...(seo.imageHotspot && { hotspot: seo.imageHotspot }),
      ...(seo.imageCrop && { crop: seo.imageCrop }),
    }, { provider: 'sanity' })
  }
}

export function usePageSeo(seo: Ref<SeoData | undefined>) {
  const { t } = useI18n()
  const ogImageUrl = useOgImageUrl()

  const ogImage = computed(() => ogImageUrl(seo.value))

  useSeoMeta({
    title: () => seo.value?.title || undefined,
    description: () => (seo.value?.description || t('seo.description')).trim(),
    ogImage: () => ogImage.value,
    // Dimensions obligatoires pour un aperçu fiable (WhatsApp/LinkedIn/Facebook
    // n'affichent pas toujours l'image sans elles). Cf. `ogImageSize`.
    ogImageWidth: () => ogImageSize(ogImage.value)?.width,
    ogImageHeight: () => ogImageSize(ogImage.value)?.height,
  })
  // og:title, og:description → auto-inférés (automaticOgAndTwitterTags). Aucune balise
  // twitter:* : doublons de l'Open Graph, cf. `seo.automaticTwitterTags` dans nuxt.config.
  // Le node schema.org WebPage est généré automatiquement par nuxt-schema-org et infère
  // name/description depuis le <title>/<meta description> posés ci-dessus — pas besoin de
  // defineWebPage manuel (il ferait doublon avec le node auto-généré).
}
