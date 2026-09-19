import type { LocationQuery } from 'vue-router'
import type { CatalogueCar, CatalogueData, CatalogueFacets, CatalogueFilters, FilterOption } from '~/queries/catalogue'
import { useInfiniteScroll } from '@vueuse/core'
import { CATALOGUE_LIMIT, ENABLED_FILTERS } from '~/queries/catalogue'

type CataloguePage = Pick<CatalogueData, 'title' | 'description' | 'contentPreFooter' | 'whatsappMessage' | 'seo'>

interface CatalogueQueryResult {
  page: CataloguePage
  cars: CatalogueCar[]
  total: number
}

const FILTER_STATE_KEYS = ['q', ...ENABLED_FILTERS.map(f => f.key)]

function qStr(v: LocationQuery[string]): string {
  return typeof v === 'string' ? v : ''
}

function toGroqParams(filters: CatalogueFilters): Record<string, string | number | null> {
  const params: Record<string, string | number | null> = {
    q: filters.q?.trim() ? `${filters.q.trim()}*` : '',
  }
  for (const def of ENABLED_FILTERS) {
    if (def.type === 'range') {
      const bucket = def.buckets?.find(b => b.value === filters[def.key])
      params[`${def.key}Min`] = bucket ? bucket.min : null
      params[`${def.key}Max`] = bucket ? (bucket.max ?? Number.MAX_SAFE_INTEGER) : null
    }
    else {
      params[def.key] = filters[def.key] ?? ''
    }
  }
  return params
}

export async function useCatalogueListing(query: string, carsQuery: string, facetsQuery: string) {
  const lang = useSanityLang()
  const sanity = useSanity()
  const route = useRoute()
  const router = useRouter()
  const analytics = useAnalytics()

  const initial: CatalogueFilters = {}
  for (const key of FILTER_STATE_KEYS)
    initial[key] = qStr(route.query[key])
  const filters = reactive<CatalogueFilters>(initial)

  const hasActiveFilters = computed(() => FILTER_STATE_KEYS.some(k => filters[k] !== ''))

  const params = reactive({
    lang: lang.value,
    from: 0,
    to: CATALOGUE_LIMIT - 1,
    ...toGroqParams(filters),
  })

  const result = useSanityQuery<CatalogueQueryResult>(query, params, {
    getCachedData: (key, nuxtApp) =>
      nuxtApp.isHydrating ? (nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]) : undefined,
  })
  const { data, refresh } = result

  const { data: facetsData } = useSanityQuery<Record<string, (string | FilterOption)[]>>(facetsQuery, { lang })

  const facets = computed<CatalogueFacets>(() => {
    const raw = facetsData.value ?? {}
    const out: CatalogueFacets = {}
    for (const def of ENABLED_FILTERS) {
      if (def.type !== 'facet')
        continue
      const opts = (raw[def.key] ?? []).map(v => (typeof v === 'string' ? { value: v, label: v } : v))
      out[def.key] = dedupeByValue(opts.filter(o => o.value)).sort((a, b) => a.label.localeCompare(b.label))
    }
    return out
  })

  const cars = ref<CatalogueCar[]>([])
  const total = ref(0)
  const offset = ref(CATALOGUE_LIMIT)

  const page = computed(() => data.value?.page)
  const hasMore = computed(() => cars.value.length < total.value)

  watch(lang, (v) => {
    params.lang = v
  })

  watch(data, (val) => {
    cars.value = val?.cars ?? []
    total.value = val?.total ?? 0
    offset.value = CATALOGUE_LIMIT
  })

  onMounted(() => {
    if (hasActiveFilters.value)
      refresh()
  })

  watch(() => route.query, () => {
    for (const key of FILTER_STATE_KEYS)
      filters[key] = qStr(route.query[key])
    Object.assign(params, toGroqParams(filters))
  })

  function setFilter(key: string, value: string) {
    if (filters[key] === value)
      return
    filters[key] = value
    Object.assign(params, toGroqParams(filters))
    syncUrl()
    if (value)
      analytics.trackCatalogueFilter({ filter_type: key, filter_value: value })
  }

  function resetFilters() {
    if (!hasActiveFilters.value)
      return
    for (const k of FILTER_STATE_KEYS)
      filters[k] = ''
    Object.assign(params, toGroqParams(filters))
    syncUrl()
  }

  function syncUrl() {
    if (!import.meta.client)
      return
    const queryOut: LocationQuery = { ...route.query }
    for (const k of FILTER_STATE_KEYS) {
      if (filters[k])
        queryOut[k] = filters[k]
      else
        delete queryOut[k]
    }
    router.replace({ query: queryOut })
  }

  const { isLoading } = useInfiniteScroll(
    () => import.meta.client ? window : null,
    async () => {
      const next = await sanity.fetch<CatalogueCar[]>(carsQuery, {
        lang: lang.value,
        from: offset.value,
        to: offset.value + CATALOGUE_LIMIT - 1,
        ...toGroqParams(filters),
      })
      if (next?.length) {
        cars.value.push(...next)
        offset.value += CATALOGUE_LIMIT
        analytics.trackCatalogueScrollMore({
          loaded_car_count: cars.value.length,
          total_cars: total.value,
          page_number: Math.round(offset.value / CATALOGUE_LIMIT),
          catalogue: route.path,
        })
      }
    },
    {
      distance: 400,
      canLoadMore: () => hasMore.value,
    },
  )

  await result

  cars.value = data.value?.cars ?? []
  total.value = data.value?.total ?? 0

  return { page, cars, total, isLoading, hasMore, facets, filters, setFilter, resetFilters, hasActiveFilters }
}

function dedupeByValue<T extends { value: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  const out: T[] = []
  for (const item of items) {
    if (!item.value || seen.has(item.value))
      continue
    seen.add(item.value)
    out.push(item)
  }
  return out
}
