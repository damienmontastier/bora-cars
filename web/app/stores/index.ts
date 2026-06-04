import { defineStore } from 'pinia'

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
