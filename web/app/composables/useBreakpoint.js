import { useBreakpoints } from '@vueuse/core'

export function useBreakpoint() {
  const breakpoints = useBreakpoints({
    mobile: 799,
    desktop: 800,
    desktopLarge: 1440,
  })

  const isMobile = breakpoints.smallerOrEqual('mobile')

  const current = breakpoints.active()

  return {
    isMobile,
    current,
  }
}
