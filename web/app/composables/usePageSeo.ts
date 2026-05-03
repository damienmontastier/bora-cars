import { useSiteConfig } from '#site-config/app/composables/useSiteConfig'
import type { SeoData } from '~/queries/fragments'

export function usePageSeo(seo: Ref<SeoData | undefined>) {
  const { name: siteName, separator } = useSiteConfig()
  const { t } = useI18n()

  const fullTitle = computed(() => {
    const pageTitle = seo.value?.title
    const sep = separator ?? '—'
    const site = siteName ?? 'BORA CARS'
    return pageTitle ? `${pageTitle} ${sep} ${site}` : site
  })

  useSeoMeta({
    title: () => seo.value?.title || undefined,
    description: () => seo.value?.description || t('seo.description'),
    ogImage: () => seo.value?.image || '/og-bora-cars.jpg',
    twitterTitle: () => fullTitle.value,
  })
  // og:title, og:description, twitter:description, twitter:image → auto-inférés (automaticOgAndTwitterTags)

  useSchemaOrg([
    defineWebPage({
      name: () => seo.value?.title ?? undefined,
      description: () => seo.value?.description || t('seo.description'),
    }),
  ])
}
