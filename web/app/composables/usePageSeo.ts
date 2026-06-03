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
  // Le node schema.org WebPage est généré automatiquement par nuxt-schema-org et infère
  // name/description depuis le <title>/<meta description> posés ci-dessus — pas besoin de
  // defineWebPage manuel (il ferait doublon avec le node auto-généré).
}
