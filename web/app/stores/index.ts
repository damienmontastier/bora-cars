import { defineStore } from 'pinia'

// const appStore = useAppStore()
// const { fontsLoaded } = toRefs(appStore)

export const useAppStore = defineStore('app', {
  state: () => ({
    fontsLoaded: false,
    preloaderDone: false,
    menuTheme: 'orange' as 'white' | 'orange' | 'black',
    menuThemePending: 'orange' as 'white' | 'orange' | 'black',
    menuTransitioning: false,
    menuOpen: false,
    menuAnimating: false,
  }),
})
