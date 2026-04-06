<script lang="ts" setup>
onMounted(() => {

})

onUnmounted(() => {

})
</script>

<template>
  <main class="page-tresjs block-inner">
    <TextsH1 :selectable="false" class="page-tresjs__font-test">
      TresJS Page
    </TextsH1>

    <div class="page-tresjs__content">
      <AtomsCTA to="/">
        Go To Home
      </AtomsCTA>
    </div>
  </main>
</template>

<style lang="scss">
.page-tresjs {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 250px;
  pointer-events: auto;

  &__content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
}
</style>
