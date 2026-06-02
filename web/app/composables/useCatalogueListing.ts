import type { CatalogueCar, CatalogueData } from '~/queries/catalogue'
import { useInfiniteScroll } from '@vueuse/core'
import { CATALOGUE_LIMIT } from '~/queries/catalogue'

type CataloguePage = Pick<CatalogueData, 'title' | 'contentPreFooter' | 'whatsappMessage' | 'seo'>

interface CatalogueQueryResult {
  page: CataloguePage
  cars: CatalogueCar[]
  total: number
}

/**
 * Logique partagée des pages catalogue (standard et professionnel) :
 * fetch Sanity localisé + infinite scroll. Le filtrage par audience est porté
 * par les deux requêtes passées en argument (voir `~/queries/catalogue`).
 *
 * À appeler avec `await` dans le `setup` d'une page. Les enregistrements
 * sensibles au scope (watchers, infinite scroll) sont faits avant le `await`
 * pour conserver le bon contexte de composant.
 */
export async function useCatalogueListing(query: string, carsQuery: string) {
  const lang = useSanityLang()
  const sanity = useSanity()

  const params = reactive({ lang: lang.value, from: 0, to: CATALOGUE_LIMIT - 1 })

  const result = useSanityQuery<CatalogueQueryResult>(query, params)
  const { data } = result

  const cars = ref<CatalogueCar[]>([])
  const total = ref(0)
  const offset = ref(CATALOGUE_LIMIT)

  const page = computed(() => data.value?.page)
  const hasMore = computed(() => cars.value.length < total.value)

  // Le changement de langue met à jour les params → refetch automatique de useSanityQuery.
  watch(lang, (v) => {
    params.lang = v
  })

  // Reset de la liste à chaque refetch (ex. switch de langue).
  watch(data, (val) => {
    cars.value = val?.cars ?? []
    total.value = val?.total ?? 0
    offset.value = CATALOGUE_LIMIT
  })

  const { isLoading } = useInfiniteScroll(
    () => import.meta.client ? window : null,
    async () => {
      const next = await sanity.fetch<CatalogueCar[]>(carsQuery, {
        lang: lang.value,
        from: offset.value,
        to: offset.value + CATALOGUE_LIMIT - 1,
      })
      if (next?.length) {
        cars.value.push(...next)
        offset.value += CATALOGUE_LIMIT
      }
    },
    {
      distance: 400,
      canLoadMore: () => hasMore.value,
    },
  )

  await result

  // Initialisation depuis les données résolues (rendu SSR correct).
  cars.value = data.value?.cars ?? []
  total.value = data.value?.total ?? 0

  return { page, cars, total, isLoading, hasMore }
}
