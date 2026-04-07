<script lang="ts" setup>
import gsap from 'gsap'

const props = defineProps({
  color: {
    type: String,
    default: 'orange-100',
  },
  open: {
    type: Boolean,
    default: false,
  },
})

const line1 = useTemplateRef('line1')
const line2 = useTemplateRef('line2')
const line3 = useTemplateRef('line3')

let tl: gsap.core.Timeline | null = null

onMounted(() => {
  tl = gsap.timeline({ paused: true })
    .to(line1.value, { y: 8, rotation: 45, svgOrigin: '20 6', duration: 0.4, ease: 'power3.inOut' }, 0)
    .to(line2.value, { scaleX: 0, svgOrigin: '20 14', duration: 0.25, ease: 'power2.in' }, 0)
    .to(line3.value, { y: -8, rotation: -45, svgOrigin: '20 22', duration: 0.4, ease: 'power3.inOut' }, 0)
})

onUnmounted(() => {
  tl?.kill()
})

watch(() => props.open, (val) => {
  val ? tl?.play() : tl?.reverse()
})
</script>

<template>
  <div class="svg-icon-burger">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 28" fill="none">
      <g ref="line1">
        <path :stroke="`var(--c-${color})`" stroke-width="2.5" d="M6 6h28" />
      </g>
      <g ref="line2">
        <path :stroke="`var(--c-${color})`" stroke-width="2.5" d="M6 14h28" />
      </g>
      <g ref="line3">
        <path :stroke="`var(--c-${color})`" stroke-width="2.5" d="M6 22h28" />
      </g>
    </svg>
  </div>
</template>

<style lang="scss">
.svg-icon-burger {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;

  svg {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
  }
}
</style>
