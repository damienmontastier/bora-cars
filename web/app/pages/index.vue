<script lang="ts" setup>
const appStore = useAppStore()
const { fontsLoaded } = toRefs(appStore)
</script>

<template>
  <main class="page-main">
    <ElementsHero />

    <div class="app-debug-wip" style="width: 100%;height: 300vh;background-color: red;">
      <TextsDisplay v-for="i in 3" :key="i">
        ...WIP...
      </TextsDisplay>
    </div>
  </main>
</template>

<style lang="scss">
.page-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 20px;
}
</style>
