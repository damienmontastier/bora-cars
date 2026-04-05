import type { FolderApi } from 'tweakpane'
import { onUnmounted } from 'vue'

export function usePaneFolder(pane: any, options: Parameters<typeof pane.addFolder>[0]) {
  // const config = useRuntimeConfig()

  // if (config.public.IS_FTP)
  //   return

  const folder: FolderApi = pane.addFolder(options)

  onUnmounted(() => {
    folder.dispose()
  })

  return folder
}
