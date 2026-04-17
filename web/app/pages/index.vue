<script lang="ts" setup>
import type { HomepageData } from '~/queries/home'
import { HOMEPAGE_QUERY } from '~/queries/home'

const appStore = useAppStore()
const { fontsLoaded } = toRefs(appStore)

const lang = useSanityLang()
const params = reactive({ lang: lang.value })
watch(lang, (v) => {
  params.lang = v
})

const { data: homepage } = await useSanityQuery<HomepageData>(HOMEPAGE_QUERY, params)
</script>

<template>
  <main v-menu-theme="'orange'" class="page-main">
    <ElementsHero :data="homepage?.hero ?? null" />

    <ElementsServicesCards :cards="homepage?.serviceCards?.cards ?? []" />

    <ElementsPitch :data="homepage?.pitch ?? null" />

    <ElementsProcessSteps :steps="homepage?.process?.steps ?? []" />

    <ElementsBrandsSection :data="homepage?.brandsSection ?? null" />

    <!-- <div class="app-debug-wip" style="width: 100%;height: 300vh;background-color: var(--c-beige-20);">
      <TextsH1 v-for="i in 3" :key="i">
        ...WIP...
      </TextsH1>
    </div> -->

    <!-- <div id="debug" style="width: 100%;height: 100vh;background-color: var(--c-beige-40);" /> -->

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
