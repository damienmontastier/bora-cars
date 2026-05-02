<script lang="ts" setup>
import type { HomepageData } from '~/queries/home'
import { HOMEPAGE_QUERY } from '~/queries/home'

const lang = useSanityLang()
const params = reactive({ lang: lang.value })
watch(lang, (v) => {
  params.lang = v
})

const { data: homepage } = await useSanityQuery<HomepageData>(HOMEPAGE_QUERY, params)
</script>

<template>
  <main v-menu-theme="'orange'" class="page-main">
    <PageModules :modules="homepage?.modules ?? []" />
    <AppFooter />
  </main>
</template>

<style lang="scss">
.page-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 0px;
}
</style>
