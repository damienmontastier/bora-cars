import { useBreakpoints } from '@vueuse/core'

export function useBreakpoint() {
  const breakpoints = useBreakpoints({
    mobile: 799, // max-width: 799px
    desktop: 800, // min-width: 800px
    desktopLarge: 1440, // min-width: 1440px
  })

  const isMobile = breakpoints.smallerOrEqual('mobile')

  const current = breakpoints.active()

  return {
    isMobile,
    current,
  }
}
