import type { MaybeRefOrGetter } from 'vue'

export interface UseIntersectionDebugOptions {
  label?: string
  rootMargin?: string
  threshold?: number | number[]
  color?: string
  offColor?: string
  enabled?: MaybeRefOrGetter<boolean>
}

export function useIntersectionDebug(
  target: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options: UseIntersectionDebugOptions = {},
) {
  if (!import.meta.dev)
    return { state: reactive({ isIntersecting: false, ratio: 0 }) }

  const enabled = computed(() => toValue(options.enabled ?? true))
  const label = options.label ?? 'IO'
  const color = options.color ?? '#00ff88'
  const offColor = options.offColor ?? '#ff4444'

  const state = reactive({
    isIntersecting: false,
    ratio: 0,
  })

  watchEffect((onCleanup) => {
    if (!enabled.value)
      return
    const el = toValue(target)
    if (!el)
      return

    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 2147483646;
      box-sizing: border-box;
      border: 2px dashed ${offColor};
      background: transparent;
      transition: border-color 0.15s linear, background-color 0.15s linear;
    `

    const badge = document.createElement('div')
    badge.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      transform: translateY(-100%);
      padding: 2px 6px;
      background: ${offColor};
      color: white;
      font: 10px/1.2 monospace;
      border-radius: 2px 2px 0 0;
      white-space: nowrap;
      box-shadow: 0 1px 2px rgba(0,0,0,0.4);
    `
    badge.textContent = `${label}: …`
    overlay.appendChild(badge)

    document.body.appendChild(overlay)

    let rafId = 0
    const updateRect = () => {
      const rect = el.getBoundingClientRect()
      overlay.style.top = `${rect.top}px`
      overlay.style.left = `${rect.left}px`
      overlay.style.width = `${rect.width}px`
      overlay.style.height = `${rect.height}px`
      rafId = requestAnimationFrame(updateRect)
    }
    updateRect()

    const setActive = (active: boolean) => {
      const c = active ? color : offColor
      overlay.style.borderColor = c
      overlay.style.background = active ? `${c}22` : 'transparent'
      badge.style.background = c
      badge.style.color = active ? 'black' : 'white'
    }

    const { stop } = useIntersectionObserver(
      target,
      ([entry]) => {
        if (!entry)
          return
        state.isIntersecting = entry.isIntersecting
        state.ratio = entry.intersectionRatio

        const status = entry.isIntersecting ? 'IN' : 'OUT'
        badge.textContent = `${label}: ${status} ${entry.intersectionRatio.toFixed(2)}`
        setActive(entry.isIntersecting)

        console.warn(`[IO:${label}]`, {
          isIntersecting: entry.isIntersecting,
          intersectionRatio: entry.intersectionRatio,
          boundingClientRect: entry.boundingClientRect,
          rootBounds: entry.rootBounds,
        })
      },
      {
        rootMargin: options.rootMargin,
        threshold: options.threshold,
      },
    )

    onCleanup(() => {
      stop()
      cancelAnimationFrame(rafId)
      overlay.remove()
    })
  })

  return { state }
}
