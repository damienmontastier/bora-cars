<script lang="ts" setup>
const webGLStore = useWebGLStore()
const { scenes } = toRefs(webGLStore)

const currentScene = computed(() => {
  return scenes.value.blank
})

const { updateCamera } = useCameraState()

watch([() => currentScene.value.visible], () => {
  if (!currentScene.value.visible)
    return

  updateCamera('blank')
}, {
  immediate: true,
})
</script>

<template>
  <TresGroup name="SceneBlankWrapper">
    <WebglScenesBlankMain v-if="scenes.blank.visible" />
  </TresGroup>
</template>
