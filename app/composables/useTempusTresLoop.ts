import { useTres } from '@tresjs/core'
import Tempus from 'tempus'
import { onUnmounted } from 'vue'

export function useTempusTresLoop() {
  const { advance } = useTres()

  const unsubscribe = Tempus.add((time, delta) => {
    advance()
  }, { priority: 1 })

  onUnmounted(() => {
    unsubscribe?.()
  })
}
