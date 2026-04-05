<script setup lang="ts">
import { Levioso, Lightformer } from '@tresjs/cientos'

import { useLoop } from '@tresjs/core'

const lightformer1 = shallowRef(null)
const lightformer2 = shallowRef(null)
const groupRef = shallowRef(null)

const positions = [2, 0, 2, 0, 2, 0, 2]

const { onBeforeRender, onRender } = useLoop()

onBeforeRender(({ delta, elapsed }) => {
  if (lightformer1.value) {
    const speed = 1
    const maxAngle = Math.PI / 8

    lightformer1.value.mesh.rotation.y = Math.sin(elapsed * speed) * maxAngle

    const amplitudeX = 1
    const speedX = 0.5
    const targetX = Math.sin(elapsed * speedX) * amplitudeX
    lightformer1.value.mesh.position.x += (targetX - lightformer1.value.mesh.position.x) * 0.1
  }

  if (groupRef.value) {
    const groupSpeed = 10
    const groupMaxZ = 35
    const groupMinZ = -60

    groupRef.value.position.z += delta * groupSpeed

    if (groupRef.value.position.z > groupMaxZ) {
      groupRef.value.position.z = groupMinZ
    }
  }
})
</script>

<template>
  <Lightformer ref="lightformer1" form="circle" :scale="[3.5, 2, 1]" :intensity="2" color="red" :position-z="-3" :position-y="1.75" :look-at="[0, 0, 0]" />
  <Lightformer ref="lightformer2" form="circle" :scale="[5, 2, 1]" :intensity="2" color="#fdf3c6" :position-z="2" :position-y="0" :look-at="[0, 0, 0]" />

  <!-- <TresGroup :rotation="[0, 0.5, 0]">
    <TresGroup ref="groupRef">
      <Lightformer
        v-for="(x, i) in positions"
        :key="i"
        form="circle"
        :intensity="5"
        :rotation="[Math.PI / 2, 0, 0]"
        :position="[x, 5, i * 4]"
        :scale="[3, 1, 1]"
        color="red"
      />
    </TresGroup>
  </TresGroup> -->

  <Levioso :speed="2.5" :float-factor="2" :rotation-factor="2" :range="[0, 5]">
    <Lightformer form="ring" color="#fdf3c6" :intensity="5" :scale="5" :position="[-20, 2, -10]" :look-at="[0, 0, 0]" />
  </Levioso>
</template>
