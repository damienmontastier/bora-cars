<script lang="ts" setup>
import type { CatalogueCar, CatalogueFacets, CatalogueFilterDef, CatalogueFilters, CatalogueTextBlock, FilterOption } from '~/queries/catalogue'
import { watchDebounced } from '@vueuse/core'
import { ENABLED_FILTERS } from '~/queries/catalogue'

interface Props {
  title?: string
  description?: string
  cars: CatalogueCar[]
  isLoading?: boolean
  contentPreFooter?: CatalogueTextBlock
  facets: CatalogueFacets
  filters: CatalogueFilters
  hasActiveFilters?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updateFilter: [key: string, value: string]
  resetFilters: []
}>()

const { t } = useI18n()

// Selects rendus dynamiquement depuis le registre (cf. ~/queries/catalogue).
const selectFilters = ENABLED_FILTERS

// Options d'un filtre : 1ʳᵉ entrée « Tous » (value vide = réinitialise), puis
// les valeurs Sanity (facet) ou les tranches statiques (range).
function optionsFor(def: CatalogueFilterDef): FilterOption[] {
  const all: FilterOption = { value: '', label: t(`catalogue.filters.all.${def.key}`) }
  if (def.type === 'range') {
    return [all, ...(def.buckets ?? []).map(b => ({
      value: b.value,
      label: t(`catalogue.filters.${def.key}Options.${b.value}`),
    }))]
  }
  return [all, ...(props.facets[def.key] ?? [])]
}

// Recherche texte : input local synchronisé à l'URL, émis avec un léger debounce.
const searchInput = ref(props.filters.q)
watch(() => props.filters.q, (v) => {
  if (v !== searchInput.value)
    searchInput.value = v
})
watchDebounced(searchInput, (v) => {
  emit('updateFilter', 'q', v.trim())
}, { debounce: 350 })

function onSearchEnter() {
  emit('updateFilter', 'q', searchInput.value.trim())
}
</script>

<template>
  <div v-menu-theme="'black'" class="app-elements-catalogue-listing">
    <div v-menu-theme="'black'" class="app-elements-catalogue-listing__header">
      <TextsH1 v-if="title" class="app-elements-catalogue-listing__header-title">
        {{ title }}
      </TextsH1>

      <TextsP2 v-if="description" weight="regular" class="app-elements-catalogue-listing__header-description">
        {{ description }}
      </TextsP2>
    </div>

    <div class="app-elements-catalogue-listing__filters">
      <label class="app-elements-catalogue-listing__search">
        <span class="app-elements-catalogue-listing__search-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="9" r="6.5" stroke="currentColor" stroke-width="1.5" />
            <path d="m18 18-4.4-4.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </span>
        <input
          v-model="searchInput"
          type="search"
          class="app-elements-catalogue-listing__search-input"
          :placeholder="t('catalogue.filters.search')"
          :aria-label="t('catalogue.filters.search')"
          @keydown.enter.prevent="onSearchEnter"
        >
      </label>

      <div class="app-elements-catalogue-listing__filters-group">
        <AtomsSelect
          v-for="(def, index) in selectFilters"
          :key="def.key"
          variant="inline"
          :align="index === selectFilters.length - 1 && selectFilters.length > 1 ? 'right' : 'left'"
          :model-value="filters[def.key] ?? ''"
          :options="optionsFor(def)"
          :placeholder="t(`catalogue.filters.${def.key}`)"
          @update:model-value="emit('updateFilter', def.key, $event)"
        />

        <button
          v-if="hasActiveFilters"
          type="button"
          class="app-elements-catalogue-listing__reset"
          @click="emit('resetFilters')"
        >
          <TextsLabel>{{ t('catalogue.filters.reset') }}</TextsLabel>
        </button>
      </div>
    </div>

    <div v-if="cars.length" class="app-elements-catalogue-listing__grid">
      <ElementsCatalogueCard
        v-for="(car, index) in cars"
        :key="car._id"
        :car="car"
        :position="index"
      />
    </div>

    <div v-else-if="!isLoading" class="app-elements-catalogue-listing__empty">
      <TextsP2>{{ t('catalogue.filters.noResults') }}</TextsP2>
      <button
        v-if="hasActiveFilters"
        type="button"
        class="app-elements-catalogue-listing__reset"
        @click="emit('resetFilters')"
      >
        <TextsLabel>{{ t('catalogue.filters.reset') }}</TextsLabel>
      </button>
    </div>

    <div v-if="isLoading" class="app-elements-catalogue-listing__loader" aria-hidden="true">
      <span class="app-elements-catalogue-listing__loader-dot" />
      <span class="app-elements-catalogue-listing__loader-dot" />
      <span class="app-elements-catalogue-listing__loader-dot" />
    </div>

    <ElementsText
      v-if="contentPreFooter"
      :eyebrow="contentPreFooter.eyebrow"
      :body="contentPreFooter.body"
    />

    <AppFooter />
  </div>
</template>

<style lang="scss">
.app-elements-catalogue-listing {
  display: flex;
  flex-direction: column;

  &__header {
    padding: desktop-vw(160px) desktop-vw(24px) desktop-vw(24px);
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 15px;

    @include mobile {
      padding: mobile-vw(120px) mobile-vw(8px) mobile-vw(40px) mobile-vw(8px);
    }
  }

  &__header-title {
    max-width: desktop-vw(900px);
    width: 100%;

    @include mobile {
      max-width: none;
    }
  }

  &__header-description {
    max-width: desktop-vw(750px);
    width: 100%;
    white-space: pre-line;

    @include mobile {
      max-width: none;
    }
  }

  &__filters {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: desktop-vw(16px);
    padding: desktop-vw(24px);
    background: var(--c-beige-100);

    @include mobile {
      flex-direction: column;
      align-items: stretch;
      gap: mobile-vw(12px);
      padding: mobile-vw(16px) mobile-vw(8px);
    }
  }

  &__search {
    display: flex;
    align-items: center;
    gap: desktop-vw(12px);
    flex: 0 0 auto;
    width: desktop-vw(248px);
    height: desktop-vw(60px);
    padding: 0 desktop-vw(30px) 0 desktop-vw(18px);
    background: var(--c-black-5);
    border-radius: 4px;
    color: var(--c-black-100);
    cursor: text;

    @include mobile {
      width: 100%;
      height: mobile-vw(52px);
      padding: 0 mobile-vw(24px) 0 mobile-vw(16px);
      gap: mobile-vw(10px);
    }
  }

  &__search-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: desktop-vw(24px);
    height: desktop-vw(24px);
    color: var(--c-black-100);

    svg {
      width: desktop-vw(20px);
      height: auto;
    }

    @include mobile {
      width: mobile-vw(20px);
      height: mobile-vw(20px);

      svg {
        width: mobile-vw(18px);
      }
    }
  }

  &__search-input {
    flex: 1 0 0;
    min-width: 0;
    border: none;
    background: transparent;
    color: var(--c-black-100);
    font-family: inherit;
    font-size: desktop-vw(20px);
    line-height: 1.2;

    &::placeholder {
      color: var(--c-black-40);
    }

    &:focus {
      outline: none;
    }

    // Masque la croix native du type=search.
    &::-webkit-search-cancel-button {
      -webkit-appearance: none;
      appearance: none;
    }

    @include mobile {
      font-size: mobile-vw(16px);
    }
  }

  &__filters-group {
    display: flex;
    align-items: center;
    gap: desktop-vw(8px);

    // Mobile : on laisse les pilules passer à la ligne plutôt que de scroller
    // horizontalement. Un `overflow-x: auto` ferait passer `overflow-y` à `auto`
    // (règle CSS) et clipperait le menu déroulant des selects → invisible.
    @include mobile {
      flex-wrap: wrap;
      gap: mobile-vw(8px);
    }
  }

  &__reset {
    flex: 0 0 auto;
    padding: 0 desktop-vw(12px);
    background: none;
    border: none;
    cursor: pointer;
    color: var(--c-black-70);
    text-decoration: underline;
    text-underline-offset: 3px;
    transition: color 0.2s ease;

    @include hover {
      &:hover {
        color: var(--c-black-100);
      }
    }

    @include mobile {
      padding: 0 mobile-vw(8px);
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: desktop-vw(40px) desktop-vw(12px);
    padding: desktop-vw(24px) desktop-vw(8px) desktop-vw(64px) desktop-vw(8px);

    @include mobile {
      grid-template-columns: 1fr;
      gap: mobile-vw(12px);
      padding: mobile-vw(8px);
    }
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: desktop-vw(16px);
    padding: desktop-vw(80px) desktop-vw(24px);
    text-align: center;
    color: var(--c-black-100);

    @include mobile {
      gap: mobile-vw(14px);
      padding: mobile-vw(64px) mobile-vw(16px);
    }
  }

  &__loader {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: desktop-vw(8px);
    padding-bottom: desktop-vw(80px);
  }

  &__loader-dot {
    width: desktop-vw(8px);
    height: desktop-vw(8px);
    border-radius: 50%;
    background: var(--c-orange);
    animation: catalogue-dot-pulse 1.2s ease-in-out infinite;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    &:nth-child(3) {
      animation-delay: 0.4s;
    }

    @include mobile {
      width: mobile-vw(8px);
      height: mobile-vw(8px);
    }
  }
}

@keyframes catalogue-dot-pulse {
  0%,
  80%,
  100% {
    opacity: 0.2;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
