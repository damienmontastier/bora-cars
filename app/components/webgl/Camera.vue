<script lang="ts" setup>
import type { PerspectiveCamera } from 'three'
import { OrbitControls } from '@tresjs/cientos'
import { useTresContext } from '@tresjs/core'

const cameraRef = shallowRef<PerspectiveCamera | null>(null)

const webGLStore = useWebGLStore()
const { cameraType, cameraAutoRotate } = toRefs(webGLStore)

useTempusTresLoop()

const documentEl = computed(() => document.getElementById('app-page') || document.body)

const { updateCamera } = useCameraState()

const { camera, controls } = useTresContext()

const { $pane } = useNuxtApp()

const paneCamera = usePaneFolder($pane, {
  title: '📷 Camera',
  expanded: true,
})

const CAMERA_PARAMS = reactive({
  fov: 50,
})

watch(cameraType, (newVal) => {
  updateCamera(newVal)
}, { immediate: true, once: true })

watch(cameraType, (newVal) => {
  updateCamera(newVal)
})

paneCamera.addBinding(CAMERA_PARAMS, 'fov', {
  min: 0,
  max: 100,
  step: 0.1,
})

paneCamera.addButton({
  title: 'Save Camera',
}).on('click', onSave)

watch(
  () => CAMERA_PARAMS.fov,
  async () => {
    console.log('CAMERA_PARAMS.fov', CAMERA_PARAMS.fov)
    if (cameraRef.value) {
      await nextTick()
      cameraRef.value.updateProjectionMatrix()
    }
  },
)

function onSave() {
  if (!cameraRef.value)
    return

  console.log('position camera', cameraRef.value.position)
  console.log('rotation camera', cameraRef.value.rotation)
  console.log('controls target', controls.value.target)
  console.log('camera — controls', cameraRef.value, controls.value)
}
</script>

<template>
  <TresPerspectiveCamera
    ref="cameraRef"
    :near="0.1"
    :far="100"
    :fov="CAMERA_PARAMS.fov"
  />

  <!-- :max-polar-angle="Math.PI / 2.25" -->
  <!-- :dom-element="documentEl" -->

  <OrbitControls
    make-default
    :auto-rotate="cameraAutoRotate"
  />
</template>
