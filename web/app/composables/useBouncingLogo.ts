import { gsap } from 'gsap'

const COLOR_PAIRS = [
  { logo: 'beige', bg: 'orange' },
  { logo: 'orange', bg: 'black' },
  { logo: 'black', bg: 'beige' },
  { logo: 'beige', bg: 'black' },
  { logo: 'orange', bg: 'beige' },
  { logo: 'black', bg: 'orange' },
] as const

export type BouncingLogoColor = typeof COLOR_PAIRS[number]['logo']
export type BouncingBgColor = typeof COLOR_PAIRS[number]['bg']

export function useBouncingLogo(
  logoRef: Ref<HTMLElement | null>,
  options: { speed?: number } = {},
) {
  const speed = options.speed ?? 400
  const { width, height } = useWindowSize()

  const logoColor = ref<BouncingLogoColor>(COLOR_PAIRS[0].logo)
  const bgColor = ref<BouncingBgColor>(COLOR_PAIRS[0].bg)
  const pos = { x: 0, y: 0 }
  const vel = { x: 0, y: 0 }
  // `content` = bounding rect of the visible path inside the wrapper.
  // `offset` = path's top-left relative to wrapper's top-left (in untransformed local coords).
  const content = { w: 0, h: 0 }
  const offset = { x: 0, y: 0 }
  let colorIndex = 0
  let lastTime = 0
  let ticking = false

  function measure() {
    if (!logoRef.value)
      return
    const wrapperRect = logoRef.value.getBoundingClientRect()
    const path = logoRef.value.querySelector('path')
    const contentRect = path?.getBoundingClientRect() ?? wrapperRect
    content.w = contentRect.width
    content.h = contentRect.height
    offset.x = contentRect.left - wrapperRect.left
    offset.y = contentRect.top - wrapperRect.top
  }

  function bounds() {
    return {
      minX: -offset.x,
      maxX: width.value - content.w - offset.x,
      minY: -offset.y,
      maxY: height.value - content.h - offset.y,
    }
  }

  function clamp() {
    const b = bounds()
    pos.x = Math.max(b.minX, Math.min(pos.x, b.maxX))
    pos.y = Math.max(b.minY, Math.min(pos.y, b.maxY))
  }

  function applyTransform() {
    if (logoRef.value)
      logoRef.value.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
  }

  function cycleColor() {
    colorIndex = (colorIndex + 1) % COLOR_PAIRS.length
    logoColor.value = COLOR_PAIRS[colorIndex]!.logo
    bgColor.value = COLOR_PAIRS[colorIndex]!.bg
  }

  function init() {
    measure()
    const b = bounds()
    const EDGE_MARGIN = 100
    const minX = Math.min(b.minX + EDGE_MARGIN, b.maxX)
    const maxX = Math.max(b.maxX - EDGE_MARGIN, minX)
    const minY = Math.min(b.minY + EDGE_MARGIN, b.maxY)
    const maxY = Math.max(b.maxY - EDGE_MARGIN, minY)
    pos.x = minX + Math.random() * Math.max(1, maxX - minX)
    pos.y = minY + Math.random() * Math.max(1, maxY - minY)
    const v = speed / Math.SQRT2
    vel.x = v * (Math.random() < 0.5 ? 1 : -1)
    vel.y = v * (Math.random() < 0.5 ? 1 : -1)
    colorIndex = 0
    logoColor.value = COLOR_PAIRS[0].logo
    bgColor.value = COLOR_PAIRS[0].bg
    lastTime = performance.now()
    applyTransform()
  }

  function tick() {
    const now = performance.now()
    const dt = Math.min(0.05, (now - lastTime) / 1000)
    lastTime = now

    pos.x += vel.x * dt
    pos.y += vel.y * dt

    const { minX, maxX, minY, maxY } = bounds()
    let bounced = false

    if (pos.x <= minX) {
      pos.x = minX
      vel.x = Math.abs(vel.x)
      bounced = true
    }
    else if (pos.x >= maxX) {
      pos.x = maxX
      vel.x = -Math.abs(vel.x)
      bounced = true
    }

    if (pos.y <= minY) {
      pos.y = minY
      vel.y = Math.abs(vel.y)
      bounced = true
    }
    else if (pos.y >= maxY) {
      pos.y = maxY
      vel.y = -Math.abs(vel.y)
      bounced = true
    }

    if (bounced)
      cycleColor()

    applyTransform()
  }

  function start() {
    if (ticking)
      return
    ticking = true
    init()
    gsap.ticker.add(tick)
  }

  function stop() {
    if (!ticking)
      return
    ticking = false
    gsap.ticker.remove(tick)
  }

  watch([width, height], () => {
    if (!ticking)
      return
    measure()
    clamp()
    applyTransform()
  })

  onBeforeUnmount(() => {
    stop()
  })

  return { logoColor, bgColor, start, stop }
}
