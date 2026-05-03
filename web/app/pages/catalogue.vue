<script lang="ts" setup>
import { useInfiniteScroll } from '@vueuse/core'
import type { CatalogueData, CatalogueCar } from '~/queries/catalogue'
import { CATALOGUE_QUERY, CATALOGUE_CARS_QUERY, CATALOGUE_LIMIT } from '~/queries/catalogue'

const lang = useSanityLang()
const sanity = useSanity()

const params = reactive({ lang: lang.value, from: 0, to: CATALOGUE_LIMIT - 1 })
watch(lang, (v) => { params.lang = v })

interface QueryResult {
  page: Pick<CatalogueData, 'title' | 'seo'>
  cars: CatalogueData['cars']
  total: number
}

const { data } = await useSanityQuery<QueryResult>(CATALOGUE_QUERY, params)

const page = computed(() => data.value?.page)
const total = ref(data.value?.total ?? 0)
const cars = ref<CatalogueCar[]>(data.value?.cars ?? [])
const offset = ref(CATALOGUE_LIMIT)

watch(data, (val) => {
  cars.value = val?.cars ?? []
  total.value = val?.total ?? 0
  offset.value = CATALOGUE_LIMIT
})

const hasMore = computed(() => cars.value.length < total.value)

const { isLoading } = useInfiniteScroll(
  () => import.meta.client ? window : null,
  async () => {
    const next = await sanity.fetch<CatalogueCar[]>(CATALOGUE_CARS_QUERY, {
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

usePageSeo(computed(() => page.value?.seo))
</script>

<template>
  <main v-menu-theme="'orange'" class="page-catalogue">
    <div class="page-catalogue__header">
      <TextsH1 v-if="page?.title" class="page-catalogue__title">
        {{ page.title }}
      </TextsH1>
    </div>

    <div class="page-catalogue__grid">
      <ElementsCatalogueCard
        v-for="car in cars"
        :key="car._id"
        :car="car"
      />
    </div>

    <div v-if="isLoading" class="page-catalogue__loader" aria-hidden="true">
      <span class="page-catalogue__loader-dot" />
      <span class="page-catalogue__loader-dot" />
      <span class="page-catalogue__loader-dot" />
    </div>

    <AppFooter />
  </main>
</template>

<style lang="scss">
.page-catalogue {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  &__header {
    padding: desktop-vw(160px) desktop-vw(24px) desktop-vw(64px);

    @include mobile {
      padding: mobile-vw(120px) mobile-vw(20px) mobile-vw(40px);
    }
  }

  &__title {
    max-width: desktop-vw(900px);

    @include mobile {
      max-width: none;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: desktop-vw(48px) desktop-vw(24px);
    padding: 0 desktop-vw(24px) desktop-vw(120px);

    @include mobile {
      grid-template-columns: repeat(2, 1fr);
      gap: mobile-vw(32px) mobile-vw(12px);
      padding: 0 mobile-vw(20px) mobile-vw(80px);
    }
  }

  &__loader {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: desktop-vw(8px);
    padding-bottom: desktop-vw(80px);

    @include mobile {
      gap: mobile-vw(8px);
      padding-bottom: mobile-vw(60px);
    }
  }

  &__loader-dot {
    width: desktop-vw(8px);
    height: desktop-vw(8px);
    border-radius: 50%;
    background: var(--c-orange);
    animation: catalogue-dot-pulse 1.2s ease-in-out infinite;

    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }

    @include mobile {
      width: mobile-vw(8px);
      height: mobile-vw(8px);
    }
  }
}

@keyframes catalogue-dot-pulse {
  0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}
</style>
