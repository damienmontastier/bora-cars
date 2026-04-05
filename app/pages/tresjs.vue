<script lang="ts" setup>
const webGLStore = useWebGLStore()

const { cameraAutoRotate } = toRefs(webGLStore)

onMounted(() => {
  webGLStore.forceSceneVisibility({
    default: true,
  })
})

onUnmounted(() => {
  webGLStore.forceSceneVisibility({
    default: false,
  })
})
</script>

<template>
  <main class="page-tresjs block-inner">
    <TextsH1 :selectable="false" class="page-tresjs__font-test">
      TresJS Page
    </TextsH1>

    <div class="page-tresjs__content">
      <AtomsCTA @click="cameraAutoRotate = !cameraAutoRotate">
        {{ cameraAutoRotate ? 'Stop' : 'Start' }} Auto-Rotate
      </AtomsCTA>

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

  &__font-test {
    text-transform: initial;
  }

  &__font-test {
    font-family: var(--font-test-1);
  }

  &__content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
}
</style>
