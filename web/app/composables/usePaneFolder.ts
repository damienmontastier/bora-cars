import type { FolderApi } from 'tweakpane'

export function usePaneFolder(pane: any, options: Parameters<typeof pane.addFolder>[0]) {
  const folder: FolderApi = pane.addFolder(options)

  let disposed = false

  const dispose = () => {
    if (!disposed) {
      disposed = true
      folder.dispose()
    }
  }

  tryOnScopeDispose(dispose)
  tryOnUnmounted(dispose)

  return folder
}
