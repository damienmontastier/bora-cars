import { onUnmounted } from 'vue'
import { useBreakpoint } from '@/composables/useBreakpoint'

export async function ensureVideoReady(video?: HTMLVideoElement): Promise<void> {
  if (!video)
    return

  const { isMobile } = useBreakpoint()

  const MIN_READY_STATE = isMobile.value ? 3 : 2

  if (video.readyState >= MIN_READY_STATE)
    return

  await new Promise<void>((resolve) => {
    let timeout: ReturnType<typeof setTimeout>

    function cleanup() {
      clearTimeout(timeout)
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

    timeout = setTimeout(() => {
      cleanup()
      console.warn('[ensureVideoReady] Timeout waiting for video to be ready.')
      resolve()
    }, 8000)

    video.addEventListener('loadeddata', onReady)
    video.addEventListener('canplay', onReady)
    video.addEventListener('timeupdate', onReady)

    if (video.readyState >= MIN_READY_STATE)
      onReady()

    onUnmounted(cleanup)
  })
}
