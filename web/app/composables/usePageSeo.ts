import { useSiteConfig } from '#site-config/app/composables/useSiteConfig'
import type { SeoData } from '~/queries/fragments'

export function usePageSeo(seo: Ref<SeoData | undefined>) {
  const { name: siteName, separator } = useSiteConfig()

  const fullTitle = computed(() => {
    const pageTitle = seo.value?.title
    const sep = separator ?? '—'
    const site = siteName ?? 'BORA CARS'
    return pageTitle ? `${pageTitle} ${sep} ${site}` : site
  })

  useSeoMeta({
    title: () => seo.value?.title || undefined,
    description: () => seo.value?.description || undefined,
    ogTitle: () => fullTitle.value,
    ogDescription: () => seo.value?.description || undefined,
    ogImage: () => seo.value?.image || undefined,
    twitterTitle: () => fullTitle.value,
    twitterDescription: () => seo.value?.description || undefined,
    twitterImage: () => seo.value?.image || undefined,
  })
}
