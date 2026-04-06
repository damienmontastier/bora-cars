<script lang="ts" setup>
const appStore = useAppStore()
const { fontsLoaded } = toRefs(appStore)
</script>

<template>
  <main class="page-main block-inner">
    <TextsH1 :selectable="false" class="page-main__font-test">
      Index Page
    </TextsH1>
    <AtomsCTA to="/tresjs">
      Go to TresJS Page
    </AtomsCTA>
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
