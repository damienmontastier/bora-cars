<script lang="ts" setup>
import type { ProprietaireData } from '~/queries/proprietaire'
import { PROPRIETAIRE_QUERY } from '~/queries/proprietaire'

const lang = useSanityLang()
const params = reactive({ lang: lang.value })
watch(lang, (v) => {
  params.lang = v
})

const { data: page } = await useSanityQuery<ProprietaireData>(PROPRIETAIRE_QUERY, params)
</script>

<template>
  <main class="page-proprietaire">
    <PageModules :modules="page?.modules ?? []" />
    <AppFooter />
  </main>
</template>

<style lang="scss">
.page-proprietaire {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 0px;
}
</style>
