import { defineStore } from 'pinia'
import { CAMERA_TYPES } from '@/config/CAMERA_CONFIG'

type CameraTypeKey = keyof typeof CAMERA_TYPES

// const webGLStore = useWebGLStore()
// const { cameraType } = toRefs(webGLStore)

export const useWebGLStore = defineStore('webgl', {
  state: () => ({
    cameraType: 'default' as CameraTypeKey,
    cameraAutoRotate: false,
    scenes: {
      default: { visible: false, shouldBeVisible: false },
      blank: { visible: false, shouldBeVisible: false },
    },
  }),
  getters: {
    currentCameraType: state => CAMERA_TYPES[state.cameraType as CameraTypeKey],
  },
  actions: {
    /**
     * Request for smooth transition (e.g., via animation)
     */
    requestSceneTransition(map: Record<string, boolean>) {
      for (const sceneName in map) {
        if (this.scenes[sceneName]) {
          this.scenes[sceneName].shouldBeVisible = map[sceneName]
        }
      }
    },

    /**
     * Forces the visibility state immediately (no animation)
     */
    forceSceneVisibility(map: Record<string, boolean>) {
      for (const sceneName in map) {
        if (this.scenes[sceneName]) {
          const value = map[sceneName]
          this.scenes[sceneName].shouldBeVisible = value
          this.scenes[sceneName].visible = value
        }
      }
    },
  },
})

// 👇 Smooth transition animation
// webGLStore.requestSceneTransition({
//   SceneIntro: false,
//   SceneCadres: true,
// })

// 👇 Force direct show/hide
// webGLStore.forceSceneVisibility({
//   SceneIntro: false,
//   SceneCadres: true,
// })
