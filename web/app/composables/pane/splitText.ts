import type { TextAnimationStyle } from '~/config/TEXT_ANIMATION_CONFIG'
import type { Ref } from 'vue'
import { TEXT_ANIMATION_CONFIG } from '~/config/TEXT_ANIMATION_CONFIG'

export function setupSplitTextPane(
  currentStyle: Ref<TextAnimationStyle>,
  init: () => void,
  label?: string,
  pane?: any,
) {
  const { $pane } = useNuxtApp()

  const folder = usePaneFolder(pane || $pane, {
    title: label ?? 'Text Animation',
  })

  const params = { style: currentStyle.value }

  folder.addBinding(params, 'style', {
    label: 'Style',
    options: Object.fromEntries(
      Object.keys(TEXT_ANIMATION_CONFIG).map(k => [k, k]),
    ),
  }).on('change', ({ value }: { value: TextAnimationStyle }) => {
    currentStyle.value = value
    init()
  })

  folder.addButton({ title: 'Replay' }).on('click', init)

  return { folder }
}
