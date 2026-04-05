<!-- eslint-disable vue/attribute-hyphenation -->
<script lang="ts" setup>
import { Environment, Lightformer } from '@tresjs/cientos'
import { BloomPmndrs, EffectComposerPmndrs } from '@tresjs/post-processing'
import { SRGBColorSpace } from 'three'

const gl = {
  shadows: true,
  clearColor: '#17171b',
  // alpha: true,
  // clearAlpha: 0,
  antialias: true,
  // logarithmicDepthBuffer: true,
  // depth: false,
  // stencil: false,
  outputColorSpace: SRGBColorSpace,
  // toneMapping: NoToneMapping,
  // shadowMapType: PCFSoftShadowMap,
}

function onPointerMissed(event) {
  console.log('Clicked on empty space')
  // Useful for deselecting objects, closing menus, etc.
}
</script>

<template>
  <TresCanvas
    v-bind="gl"
    class="app-webgl"
    render-mode="manual"
    window-size
    @pointermissed="onPointerMissed"
  >
    <WebglCamera />

    <TresFog :args="['#17171b', 6, 12]" />

    <TresGroup name="ScenesGroup">
      <WebglScenesDefaultWrapper />
      <WebglScenesBlankWrapper />
    </TresGroup>

    <Suspense>
      <Environment :resolution="512" :blur="0">
        <WebglLightformers />
      </Environment>
    </Suspense>

    <!-- <Suspense>
      <Environment preset="sunset" :resolution="512" />
    </Suspense> -->

    <!-- <WebglEffects /> -->
  </TresCanvas>
</template>

<style lang="scss">
canvas.app-webgl {
  height: 100%;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 0;

  @include mobile {
    width: 100% !important;
    height: 100% !important;
  }
}
</style>
