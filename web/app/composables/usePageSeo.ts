import type { SeoData } from '~/queries/fragments'

export function useOgImageUrl() {
  const $img = useImage()
  const { url: siteUrl } = useSiteConfig()

  return (seo?: SeoData) => {
    if (!seo?.image)
      return `${siteUrl}/og-bora-cars.jpg`
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
    ogImageWidth: () => ogImageSize(ogImage.value)?.width,
    ogImageHeight: () => ogImageSize(ogImage.value)?.height,
  })
}
