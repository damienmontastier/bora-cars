<script lang="ts" setup>
onMounted(() => {

})

onUnmounted(() => {

})
</script>

<template>
  <main class="page-tresjs-blank block-inner">
    <TextsH1 :selectable="false" class="page-tresjs-blank__font-test">
      TresJS Page Blank
    </TextsH1>

    <div class="page-tresjs-blank__content">
      <AtomsCTA to="/">
        Go To Home
      </AtomsCTA>
    </div>
  </main>
</template>

<style lang="scss">
.page-tresjs-blank {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 50px;

  &__content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
}
</style>
