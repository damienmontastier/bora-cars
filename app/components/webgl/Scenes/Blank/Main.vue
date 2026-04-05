<script lang="ts" setup>
const colors = ['#FF5733', '#FFD600', '#00E676', '#2979FF']

const count = 3

const spacing = 2.5

const offset = (count - 1) / 2

const meshRefs = shallowRef([])

const { onBeforeRender } = useLoop()

onBeforeRender(({ elapsed }) => {
  meshRefs.value?.forEach((mesh, idx) => {
    if (mesh) {
      const speed = 1
      const amplitude = 0.5

      mesh.position.y = Math.sin(elapsed * speed + idx) * amplitude
    }
  })
})
</script>

<template>
  <TresGroup name="SceneBlankMain">
    <TresPointLight
      :intensity="20"
      :position="[0, 2, 0]"
      color="#17171b"
    />

    <TresAmbientLight :intensity="1" />

    <TresHemisphereLight
      :intensity="2"
      ground-color="black"
    />

    <TresDirectionalLight
      :position="[0, 2, 5]"
      :intensity="1"
      cast-shadow
    />

    <template
      v-for="i in 9"
      :key="i"
    >
      <TresMesh
        :ref="(el) => (meshRefs[i - 1] = el)"
        cast-shadow
        receive-shadow
        :position="[
          ((i - 1) % 3 - 1) * spacing, // X: -1, 0, 1
          .1,
          (Math.floor((i - 1) / 3) - 1) * spacing, // Z: -1, 0, 1
        ]"
      >
        <TresSphereGeometry :args="[.5, 32, 16]" />
        <TresMeshStandardMaterial
          :color="colors[0]"
          :roughness=".2"
          :metalness="1"
        />
      </TresMesh>
    </template>
  </TresGroup>
</template>
