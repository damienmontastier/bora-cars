import { sceneConfig } from '@/config/SCENE_CONFIG'
import { useWebGLStore } from '@/stores/webgl'

/**
 * Manages the visibility of scenes either automatically (based on the URL) or manually.
 *
 * @param args - Optional parameters:
 *   - sceneVisibilityMap: A map defining the visibility of each scene (manual mode).
 *   - force: If true, forces the visibility update immediately; otherwise, requests a transition.
 */
export function useSceneVisibility(args?: {
  sceneVisibilityMap?: Record<string, boolean>
  force?: boolean
}) {
  const webGLStore = useWebGLStore()
  const { sceneVisibilityMap, force = false } = args || {}

  // If manual mode is used
  if (sceneVisibilityMap) {
    if (force) {
      webGLStore.forceSceneVisibility(sceneVisibilityMap)
    }
    else {
      webGLStore.requestSceneTransition(sceneVisibilityMap)
    }
    return
  }

  // Automatic mode
  const route = useRoute()
  const getRouteBaseName = useRouteBaseName()
  const baseRouteName = getRouteBaseName(route)

  const sceneEntry = Object.entries(sceneConfig).find(([, config]) => config.routeName === baseRouteName)

  if (!sceneEntry) {
    console.warn(`[SceneManager] No scene mapped for "${baseRouteName}" in sceneConfig.`)
    return
  }

  const [activeSceneKey] = sceneEntry

  const finalVisibilityMap = Object.fromEntries(
    Object.keys(webGLStore.scenes).map(key => [key, key === activeSceneKey]),
  )

  if (force) {
    webGLStore.forceSceneVisibility(finalVisibilityMap)
  }
  else {
    webGLStore.requestSceneTransition(finalVisibilityMap)
  }
}
