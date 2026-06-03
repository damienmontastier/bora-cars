<script setup lang="ts">
import { gsap } from 'gsap'

// Branded full-screen ambient backdrop: animated orange/beige radial orbs over
// black, with a subtle film grain. Shared by the under-construction and error
// screens. Driven by gsap.ticker (still RAF-backed — only gsap.updateRoot is
// re-routed to Tempus in 02.gsap.client.js).
//
// Respects `prefers-reduced-motion`: when reduce is set we paint a single static
// frame and never start the ticker (no perpetual RAF for a decorative effect).
const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let ro: ResizeObserver | null = null
let mq: MediaQueryList | null = null
let running = false
let elapsed = 0

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
  ctx = canvas.getContext('2d')
  ctx?.scale(dpr, dpr)
  // Resizing clears the canvas — repaint now so a paused (reduced-motion) frame
  // never goes blank on resize.
  render()
}

function render() {
  if (!ctx || !canvasRef.value)
    return

  const dpr = window.devicePixelRatio || 1
  const W = canvasRef.value.width / dpr
  const H = canvasRef.value.height / dpr
  const R = Math.min(W, H)

  ctx.fillStyle = 'rgb(12,12,10)'
  ctx.fillRect(0, 0, W, H)

  // Orbe 1 — orange principale, grande
  const x1 = W * (0.3 + 0.22 * Math.sin(elapsed * 0.32))
  const y1 = H * (0.4 + 0.18 * Math.cos(elapsed * 0.26))
  const g1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, R * 0.65)
  g1.addColorStop(0, 'rgba(254,95,56,0.26)')
  g1.addColorStop(1, 'rgba(254,95,56,0)')
  ctx.fillStyle = g1
  ctx.fillRect(0, 0, W, H)

  // Orbe 2 — orange secondaire
  const x2 = W * (0.72 + 0.16 * Math.cos(elapsed * 0.29))
  const y2 = H * (0.55 + 0.2 * Math.sin(elapsed * 0.38))
  const g2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, R * 0.42)
  g2.addColorStop(0, 'rgba(254,95,56,0.16)')
  g2.addColorStop(1, 'rgba(254,95,56,0)')
  ctx.fillStyle = g2
  ctx.fillRect(0, 0, W, H)

  // Orbe 3 — beige douce
  const x3 = W * (0.55 + 0.14 * Math.sin(elapsed * 0.21))
  const y3 = H * (0.3 + 0.16 * Math.cos(elapsed * 0.17))
  const g3 = ctx.createRadialGradient(x3, y3, 0, x3, y3, R * 0.52)
  g3.addColorStop(0, 'rgba(230,231,223,0.10)')
  g3.addColorStop(1, 'rgba(230,231,223,0)')
  ctx.fillStyle = g3
  ctx.fillRect(0, 0, W, H)
}

function tick(_time: number, deltaTime: number) {
  elapsed += deltaTime / 1000
  render()
}

// Start/stop the RAF loop based on the live `prefers-reduced-motion` value.
function applyMotionPreference() {
  if (mq?.matches) {
    if (running) {
      gsap.ticker.remove(tick)
      running = false
    }
    render() // single static frame
  }
  else if (!running) {
    running = true
    gsap.ticker.add(tick)
  }
}

onMounted(() => {
  resizeCanvas()
  ro = new ResizeObserver(resizeCanvas)
  if (canvasRef.value?.parentElement)
    ro.observe(canvasRef.value.parentElement)
  mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  mq.addEventListener('change', applyMotionPreference)
  applyMotionPreference()
})

onUnmounted(() => {
  if (running)
    gsap.ticker.remove(tick)
  ro?.disconnect()
  mq?.removeEventListener('change', applyMotionPreference)
})
</script>

<template>
  <div class="app-ambient-background">
    <canvas ref="canvasRef" class="app-ambient-background__canvas" />

    <svg class="app-ambient-background__grain-svg">
      <filter id="ambient-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
    </svg>
    <div class="app-ambient-background__grain" />
  </div>
</template>

<style lang="scss">
.app-ambient-background {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;

  &__canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  &__grain-svg {
    position: absolute;
    width: 0;
    height: 0;
  }

  &__grain {
    position: absolute;
    inset: -20%;
    width: 140%;
    height: 140%;
    filter: url(#ambient-grain);
    opacity: 0.035;
    mix-blend-mode: overlay;
  }
}
</style>
