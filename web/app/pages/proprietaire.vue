<script lang="ts" setup>
const appStore = useAppStore()
const { fontsLoaded } = toRefs(appStore)
</script>

<template>
  <main class="page-proprietaire">
    <ElementsHero />

    <ElementsPitch />

    <ElementsProcessSteps />

    <div class="app-debug-wip" style="width: 100%;height: 300vh;background-color: var(--c-beige-20);">
      <TextsH1 v-for="i in 3" :key="i">
        ...WIP...
      </TextsH1>
    </div>

    <!-- <div id="debug" style="width: 100%;height: 100vh;background-color: var(--c-beige-40);" /> -->

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
