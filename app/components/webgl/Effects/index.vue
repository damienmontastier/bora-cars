<script lang="ts" setup>
import { EffectComposerPmndrs, TiltShiftPmndrs } from '@tresjs/post-processing'
import { ToneMappingMode } from 'postprocessing'

const POSTPROCESSING_PARAMS = reactive({
  toneMapping: {
    exposure: 1,
    mode: ToneMappingMode.ACES_FILMIC,
  },
})

const { $pane } = useNuxtApp()

const pane = usePaneFolder($pane, {
  title: 'Effects',
  expanded: true,
})

pane.addBinding(POSTPROCESSING_PARAMS.toneMapping, 'mode', {
  options: Object.keys(ToneMappingMode).map(key => ({
    text: key,
    value: ToneMappingMode[key as keyof typeof ToneMappingMode],
  })),
})

const tiltShiftEffectProps = {
  focusArea: 0.75,
  feather: 0.1,
}
</script>

<template>
  <Suspense>
    <EffectComposerPmndrs :multisampling="4">
      <!-- <TiltShiftPmndrs v-bind="tiltShiftEffectProps" /> -->
      <ToneMappingPmndrs :mode="POSTPROCESSING_PARAMS.toneMapping.mode" />
      <BloomPmndrs />
    </EffectComposerPmndrs>
  </Suspense>
</template>
