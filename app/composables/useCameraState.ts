import { useTres } from '@tresjs/core'
import { CAMERA_TYPES } from '@/config/CAMERA_CONFIG'

export function useCameraState() {
  const { camera, controls } = useTres()

  const webGLStore = useWebGLStore()
  const { cameraType } = toRefs(webGLStore)

  async function updateCamera(type: keyof typeof CAMERA_TYPES) {
    await nextTick()

    if (!camera.value || !controls.value)
      return

    const newFov = CAMERA_TYPES[type].fov
    const newPos = CAMERA_TYPES[type].position.clone()
    const newRot = CAMERA_TYPES[type].rotation.clone()
    const newTgt = CAMERA_TYPES[type].target.clone()

    if (camera.value) {
      camera.value.position.copy(newPos)
      camera.value.rotation.copy(newRot)
      camera.value.fov = newFov
      camera.value.updateProjectionMatrix()
    }

    if (controls.value) {
      controls.value.target.copy(newTgt)
      controls.value.update()

      await nextTick()

      const azimuthalAngle = getAzimuthalAngleFromPositionAndTarget(
        newPos,
        newTgt,
      )

      controls.value.setAzimuthalAngle(azimuthalAngle)

      controls.value.update()
    }

    cameraType.value = type
  }

  return {
    updateCamera,
  }
}
