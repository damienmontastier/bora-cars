<script lang="ts" setup>
const webGLStore = useWebGLStore()
const { scenes } = toRefs(webGLStore)

const currentScene = computed(() => {
  return scenes.value.default
})

const { updateCamera } = useCameraState()

watch([() => currentScene.value.visible], () => {
  if (!currentScene.value.visible)
    return

  updateCamera('default')
}, {
  immediate: true,
})
</script>

<template>
  <TresGroup name="SceneDefaultWrapper">
    <WebglScenesDefaultMain v-if="scenes.default.visible" />
  </TresGroup>
</template>
