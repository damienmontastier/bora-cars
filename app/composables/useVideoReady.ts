import { onUnmounted } from 'vue'
import { useBreakpoint } from '@/composables/useBreakpoint' // Assuming import path

export async function ensureVideoReady(video?: HTMLVideoElement): Promise<void> {
  if (!video)
    return

  const { isMobile } = useBreakpoint()

  // 3 = HAVE_FUTURE_DATA, 2 = HAVE_CURRENT_DATA
  const MIN_READY_STATE = isMobile.value ? 3 : 2

  if (video.readyState >= MIN_READY_STATE)
    return

  await new Promise<void>((resolve) => {
    let timeout: ReturnType<typeof setTimeout>

    // --- Fix: Use 'function' so these are hoisted and can reference each other ---

    function cleanup() {
      clearTimeout(timeout)
      // video is captured from parent scope, but ensure it exists
      if (!video)
        return
      video.removeEventListener('loadeddata', onReady)
      video.removeEventListener('canplay', onReady)
      video.removeEventListener('timeupdate', onReady)
    }

    function onReady() {
      cleanup()
      resolve()
    }

    // -----------------------------------------------------------------------------

    timeout = setTimeout(() => {
      cleanup()
      console.warn('[ensureVideoReady] Timeout waiting for video to be ready.')
      resolve()
    }, 8000) // sécurité : 8s max

    video.addEventListener('loadeddata', onReady)
    video.addEventListener('canplay', onReady)
    video.addEventListener('timeupdate', onReady)

    if (video.readyState >= MIN_READY_STATE)
      onReady()

    // Note: See warning below regarding onUnmounted inside a Promise
    onUnmounted(cleanup)
  })
}
