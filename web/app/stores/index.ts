import { defineStore } from 'pinia'

// const appStore = useAppStore()
// const { fontsLoaded } = toRefs(appStore)

export const useAppStore = defineStore('app', {
  state: () => ({
    fontsLoaded: false,
    preloaderDone: false,
    menuTheme: 'orange' as 'white' | 'orange' | 'black',
    menuOpen: false,
    menuAnimating: false,
  }),
})
