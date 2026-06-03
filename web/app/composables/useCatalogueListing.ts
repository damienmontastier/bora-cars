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

// Clés d'état/URL : recherche texte + une par filtre activé (cf. registre ENABLED_FILTERS).
const FILTER_STATE_KEYS = ['q', ...ENABLED_FILTERS.map(f => f.key)]

// Normalise une valeur de query string (string | string[] | undefined) en string.
function qStr(v: LocationQuery[string]): string {
  return typeof v === 'string' ? v : ''
}

// Convertit l'état des filtres en paramètres GROQ, piloté par le registre :
// - q vide → "" (clause neutralisée) ; sinon suffixe `*` pour un match « commence par ».
// - facet → `$<key>` = valeur sélectionnée (ou "").
// - range → `$<key>Min`/`$<key>Max` = bornes de la tranche, ou null si aucune.
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

/**
 * Logique partagée des pages catalogue (standard et professionnel) :
 * fetch Sanity localisé + infinite scroll + filtres synchronisés à l'URL.
 *
 * Best practices @nuxtjs/sanity : `useSanityQuery` (bloquant, SSR) avec des
 * paramètres réactifs qui déclenchent un refetch automatique au changement
 * (langue ou filtre) ; `useSanity().fetch` pour la pagination manuelle.
 * Les filtres vivent dans la query string (`?ville=…&q=…`), donc une URL
 * partagée pré-sélectionne les filtres et reste localisable.
 *
 * Tous les filtres sont déclarés dans le registre `ENABLED_FILTERS`
 * (`~/queries/catalogue`) : l'état, les params et l'URL en dérivent.
 *
 * À appeler avec `await` dans le `setup` d'une page. Les enregistrements
 * sensibles au scope (watchers, infinite scroll) sont faits avant le `await`
 * pour conserver le bon contexte de composant.
 */
export async function useCatalogueListing(query: string, carsQuery: string, facetsQuery: string) {
  const lang = useSanityLang()
  const sanity = useSanity()
  const route = useRoute()
  const router = useRouter()

  // État des filtres initialisé depuis l'URL (rendu SSR + lien partagé déjà filtré).
  const initial: CatalogueFilters = {}
  for (const key of FILTER_STATE_KEYS)
    initial[key] = qStr(route.query[key])
  const filters = reactive<CatalogueFilters>(initial)

  const hasActiveFilters = computed(() => FILTER_STATE_KEYS.some(k => filters[k] !== ''))

  // Paramètres réactifs de la requête principale : leur mutation déclenche le
  // refetch automatique de useSanityQuery (langue, filtres) — qui réinitialise
  // la liste via le watch(data) ci-dessous.
  const params = reactive({
    lang: lang.value,
    from: 0,
    to: CATALOGUE_LIMIT - 1,
    ...toGroqParams(filters),
  })

  const result = useSanityQuery<CatalogueQueryResult>(query, params)
  const { data } = result

  // Facettes (valeurs distinctes par filtre), localisées → refetch au switch de langue.
  const { data: facetsData } = useSanityQuery<Record<string, (string | FilterOption)[]>>(facetsQuery, { lang })

  // Normalise chaque facette en FilterOption[] triées, dédupliquées par valeur.
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

  // Le changement de langue met à jour les params → refetch automatique.
  watch(lang, (v) => {
    params.lang = v
  })

  // Reset de la liste à chaque refetch (switch de langue ou changement de filtre).
  watch(data, (val) => {
    cars.value = val?.cars ?? []
    total.value = val?.total ?? 0
    offset.value = CATALOGUE_LIMIT
  })

  // Applique un filtre : met à jour l'état, les params GROQ (→ refetch) et l'URL.
  function setFilter(key: string, value: string) {
    if (filters[key] === value)
      return
    filters[key] = value
    Object.assign(params, toGroqParams(filters))
    syncUrl()
  }

  function resetFilters() {
    if (!hasActiveFilters.value)
      return
    for (const k of FILTER_STATE_KEYS)
      filters[k] = ''
    Object.assign(params, toGroqParams(filters))
    syncUrl()
  }

  // Reflète les filtres actifs dans la query string (path/locale préservés).
  // Client uniquement : les mutations viennent d'interactions utilisateur.
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
