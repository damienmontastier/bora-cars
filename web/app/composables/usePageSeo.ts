import type { SeoData } from '~/queries/fragments'

export function usePageSeo(seo: Ref<SeoData | undefined>) {
  useSeoMeta({
    title: () => seo.value?.title || undefined,
    description: () => seo.value?.description || undefined,
    ogTitle: () => seo.value?.title || undefined,
    ogDescription: () => seo.value?.description || undefined,
    ogImage: () => seo.value?.image || undefined,
    twitterTitle: () => seo.value?.title || undefined,
    twitterDescription: () => seo.value?.description || undefined,
    twitterImage: () => seo.value?.image || undefined,
  })
}
