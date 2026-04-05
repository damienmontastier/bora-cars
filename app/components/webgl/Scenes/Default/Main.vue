<script lang="ts" setup>
import { ContactShadows } from '@tresjs/cientos'

const colors = ['#FF5733', '#FFD600', '#00E676', '#2979FF']
</script>

<template>
  <TresGroup name="SceneDefaultMain">
    <template
      v-for="i in 4"
      :key="i"
    >
      <TresMesh
        :position="[((i - 1) - (4 - 1) / 2) * 1.5, 0, 0]"
      >
        <TresBoxGeometry
          :width="4"
          :height="4"
          :depth="4"
        />

        <TresMeshStandardMaterial :color="colors[i - 1]" />
      </TresMesh>
    </template>

    <ContactShadows :position-y="-0.525" color="#335" :scale="10" :blur="1" :opacity="0.5" />
  </TresGroup>
</template>
