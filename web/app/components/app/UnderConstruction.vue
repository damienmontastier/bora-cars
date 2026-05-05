<script setup lang="ts">
import { gsap } from 'gsap'

const { t } = useI18n()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let ro: ResizeObserver | null = null
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
}

function tick(_time: number, deltaTime: number) {
  if (!ctx || !canvasRef.value)
    return

  elapsed += deltaTime / 1000
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

onMounted(() => {
  resizeCanvas()
  ro = new ResizeObserver(resizeCanvas)
  if (canvasRef.value?.parentElement)
    ro.observe(canvasRef.value.parentElement)
  gsap.ticker.add(tick)
})

onUnmounted(() => {
  gsap.ticker.remove(tick)
  ro?.disconnect()
})
</script>

<template>
  <div class="app-under-construction">
    <canvas ref="canvasRef" class="app-under-construction__canvas" />

    <svg class="app-under-construction__grain-svg">
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
    </svg>
    <div class="app-under-construction__grain" />

    <div class="app-under-construction__content">
      <span class="app-under-construction__label">{{ t('underConstruction.label') }}</span>
      <TextsH2 color="beige-100">
        {{ t('underConstruction.title') }}
      </TextsH2>
    </div>

    <div class="app-under-construction__logo">
      <SvgLogo color="orange" />
    </div>
  </div>
</template>

<style lang="scss">
.app-under-construction {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background-color: var(--c-black);
  display: flex;
  align-items: center;
  justify-content: center;

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
    filter: url(#grain);
    opacity: 0.035;
    mix-blend-mode: overlay;
    pointer-events: none;
  }

  &__content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: desktop-vw(16px);
    text-align: center;

    @include mobile {
      gap: mobile-vw(16px);
    }
  }

  &__label {
    font-family: var(--font-haas-grot-disp-medium);
    font-size: desktop-vw(11px);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--c-beige-50);

    @include mobile {
      font-size: mobile-vw(10px);
    }
  }

  &__logo {
    position: fixed;
    bottom: 24px;
    left: desktop-vw(16px);
    right: desktop-vw(16px);
    z-index: 1;

    @include mobile {
      left: mobile-vw(16px);
      right: mobile-vw(16px);
    }

    .svg-logo {
      width: 100%;
      height: auto;
      aspect-ratio: 1408 / 213;
    }
  }
}
</style>
