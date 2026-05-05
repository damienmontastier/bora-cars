import type { SeoData } from '~/queries/fragments'

export function usePageSeo(seo: Ref<SeoData | undefined>) {
  const { url: siteUrl } = useSiteConfig()
  const { t } = useI18n()

  useSeoMeta({
    title: () => seo.value?.title || undefined,
    description: () => (seo.value?.description || t('seo.description')).trim(),
    ogImage: () => seo.value?.image || `${siteUrl}/og-bora-cars.jpg`,
  })
  // og:title, og:description, twitter:* → auto-inférés (automaticOgAndTwitterTags)

  useSchemaOrg([
    defineWebPage({
      name: () => seo.value?.title ?? undefined,
      description: () => (seo.value?.description || t('seo.description')).trim(),
    }),
  ])
}
