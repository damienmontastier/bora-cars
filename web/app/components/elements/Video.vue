<script lang="ts" setup>
const props = defineProps<{
  src: string
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  controls?: boolean
  pauseWhenHidden?: boolean
}>()

const mainRef = ref<HTMLElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)

const isVisible = useElementVisibility(mainRef)

watch(isVisible, (visible) => {
  if (!props.pauseWhenHidden || !videoRef.value) return
  visible ? videoRef.value.play() : videoRef.value.pause()
})

defineExpose({ mainRef, videoRef })
</script>

<template>
  <div ref="mainRef" class="elements-video">
    <video
      ref="videoRef"
      class="elements-video__inner"
      :src="`${src}#t=0.00001`"
      :autoplay="autoplay ?? true"
      :muted="muted ?? true"
      :loop="loop ?? true"
      :controls="controls ?? false"
      playsinline
      disableRemotePlayback
      preload="auto"
    />
  </div>
</template>

<style lang="scss">
.elements-video {
  position: relative;
  overflow: hidden;

  &__inner {
    width: 100%;
    height: 100%;
    object-fit: cover;
    @include disable-draggable();

    &::-internal-media-controls-overlay-cast-button {
      display: none;
    }
  }
}
</style>
