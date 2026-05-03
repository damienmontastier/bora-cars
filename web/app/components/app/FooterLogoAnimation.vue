<script setup lang="ts">
import { gsap } from 'gsap'

interface Props {
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: 'beige-100',
})

const SVG_W = 1408
const SVG_H = 214
const SVG_PATH = `M691.264 0c18.882 0 33.681 5.265 42.729 15.593 9.084 10.37 11.899 25.3 7.966 43.565l-20.631 96.994c-7.593 35.828-36.343 57.12-74.658 57.12H455.5c-5.017 0-9.756-.379-14.184-1.128-27.849-4.714-43.078-29.189-37.179-57.026l20.632-97.002.001-.006c3.937-18.281 12.878-32.858 25.833-42.85C463.549 5.278 480.335 0 499.76 0zm308.866 0c53.24 0 71.34 30.86 63.26 68.889-6.09 28.63-24.37 50.997-52.77 60.338-1.58.518-2.43 2.247-1.81 3.786l30.55 76.414c.74 1.842-.62 3.845-2.61 3.845h-52.243a2.81 2.81 0 0 1-2.592-1.719l-33.523-79.693a2.81 2.81 0 0 0-2.591-1.718H797.802a2.81 2.81 0 0 0-2.749 2.222l-16.721 78.685a2.81 2.81 0 0 1-2.749 2.223h-52.437a1.87 1.87 0 0 1-1.833-2.258l44.369-208.79A2.81 2.81 0 0 1 768.431 0zM343.342.057c66.357 0 81.472 55.273 50.245 88.766-5.288 5.672-12.182 11.543-19.468 14.2-.542.198-.589.984-.072 1.241 40.648 23.426 28.001 108.973-65.944 108.973H26.367l41.328-43.335A42.5 42.5 0 0 1 98.35 156.85h212.968a21.83 21.83 0 0 0 15.967-6.94c6.991-7.498 1.664-19.4-8.598-19.4H2.19c-1.91 0-2.9-2.273-1.6-3.668L117.687 1.249a3.75 3.75 0 0 1 2.744-1.192zM1295.5 0c1.4 0 2.68.775 3.33 2.01l108.95 208.469a1.87 1.87 0 0 1-1.66 2.735h-56.06a4.68 4.68 0 0 1-4.17-2.557l-19.56-38.217a4.1 4.1 0 0 0-3.65-2.233h-165.61c-1.13 0-2.21.467-2.98 1.289l-37.93 40.25a4.7 4.7 0 0 1-3.41 1.468h-65.44c-1.64 0-2.49-1.948-1.37-3.145L1240.68 1.192A3.77 3.77 0 0 1 1243.43 0zM503.502 56.507c-9.724 0-18.125 6.784-20.156 16.276l-13.937 65.141c-2.075 9.699 5.333 18.841 15.269 18.841h158.196c9.748 0 18.163-6.818 20.169-16.34L676.762 75.3c2.04-9.686-5.364-18.793-15.28-18.793zm763.308-.367c-.69-1.342-2.5-1.598-3.53-.501l-60.57 64.266c-.99 1.047-.25 2.766 1.19 2.766h94.28c1.22 0 2.02-1.297 1.46-2.389zm-1125.458.181a3.75 3.75 0 0 0-2.742 1.193l-22.272 23.575c-.558.598-.133 1.572.685 1.572h205.872a21.83 21.83 0 0 0 15.968-6.94c6.991-7.498 1.663-19.4-8.598-19.4zm672.281-.056a2.81 2.81 0 0 0-2.749 2.222l-4.406 20.73a2.808 2.808 0 0 0 2.75 3.388h168.765c6.057 0 11.84-2.514 15.967-6.94 6.99-7.499 1.664-19.4-8.598-19.4z`

const params = reactive({
  copies: 9,
  xStep: 0.057,
  speed: 0.2,
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let img: HTMLImageElement | null = null
let scrollX = 0
let ro: ResizeObserver | null = null

function resolveColor(token: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(`--c-${token}`).trim() || token
}

function loadImage(colorToken: string): Promise<HTMLImageElement> {
  const fill = resolveColor(colorToken)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SVG_W} ${SVG_H}" fill="none"><path fill="${fill}" fill-rule="evenodd" clip-rule="evenodd" d="${SVG_PATH}"/></svg>`
  const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  return new Promise((resolve) => {
    const el = new Image()
    el.onload = () => resolve(el)
    el.src = src
  })
}

function getLogicalSize() {
  const canvas = canvasRef.value!
  const dpr = window.devicePixelRatio || 1
  return { w: canvas.width / dpr, h: canvas.height / dpr }
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas?.parentElement)
    return
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.parentElement.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  canvas.style.width = `${rect.width}px`
  canvas.style.height = `${rect.height}px`
  ctx?.scale(dpr, dpr)
}

function tick(_time: number, deltaTime: number) {
  if (!ctx || !img || !canvasRef.value)
    return
  const { w: W, h: H } = getLogicalSize()

  const logoH = H
  const logoW = logoH * (SVG_W / SVG_H)
  const gap = logoW * 0.12
  const tile = logoW + gap
  const n = params.copies
  const center = (n - 1) / 2
  const stripW = logoW / n
  const phaseStep = params.xStep * logoW
  const groupLeft = (W - logoW) / 2

  scrollX = (scrollX + logoW * params.speed * (deltaTime / 1000)) % tile

  ctx.clearRect(0, 0, W, H)

  for (let c = 0; c < n; c++) {
    const windowX = groupLeft + c * stripW
    const logoX = groupLeft + (c - center) * phaseStep - scrollX

    ctx.save()
    ctx.beginPath()
    ctx.rect(windowX, 0, stripW, H)
    ctx.clip()

    for (let k = -1; k <= 2; k++) {
      ctx.drawImage(img, logoX + k * tile, 0, logoW, logoH)
    }

    ctx.restore()
  }
}

// Setup Tweakpane folder in setup scope so tryOnScopeDispose works
const { $pane } = useNuxtApp()
if ($pane) {
  const folder = usePaneFolder($pane, { title: 'Logo Animation' })
  folder.addBinding(params, 'copies', { min: 1, max: 15, step: 1, label: 'copies' })
  folder.addBinding(params, 'xStep', { min: 0, max: 0.5, step: 0.001, label: 'echo spread' })
  folder.addBinding(params, 'speed', { min: 0, max: 3, step: 0.01, label: 'speed' })
}

onMounted(async () => {
  ctx = canvasRef.value!.getContext('2d')!
  resizeCanvas()
  img = await loadImage(props.color)

  ro = new ResizeObserver(resizeCanvas)
  ro.observe(canvasRef.value!.parentElement!)

  gsap.ticker.add(tick)
})

onUnmounted(() => {
  gsap.ticker.remove(tick)
  ro?.disconnect()
})

watch(() => props.color, async (val) => {
  img = await loadImage(val)
})
</script>

<template>
  <canvas ref="canvasRef" class="footer-logo-animation" />
</template>

<style lang="scss">
.footer-logo-animation {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
