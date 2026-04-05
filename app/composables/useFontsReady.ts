import { onMounted, onUnmounted, ref } from 'vue'

export function useFontsReady() {
  const fallbackTimeout = 2500
  const fontsReady = ref(false)
  const fontsSupported = typeof document !== 'undefined' && !!document.fonts

  let fallbackTimer: ReturnType<typeof setTimeout> | null = null

  function unlock() {
    if (fontsReady.value)
      return
    fontsReady.value = true
    if (fallbackTimer)
      clearTimeout(fallbackTimer)
  }

  async function checkFonts() {
    // Sécurité: Si SSR ou pas de support, on débloque tout de suite
    if (!fontsSupported) {
      unlock()
      return
    }

    // 2. Fallback de sécurité : Quoi qu'il arrive, on débloque après le timeout
    fallbackTimer = setTimeout(() => {
      console.warn('[Fonts] Timeout: Fonts took too long, showing content anyway.')
      unlock()
    }, fallbackTimeout)

    try {
      // 3. On attend que le browser confirme que les polices critiques sont là
      await document.fonts.ready

      // Optionnel : Vérifier spécifiquement ta police principale pour éviter d'attendre les widgets tiers
      // const isMainFontLoaded = document.fonts.check('1em ALTRiviera-Regular')

      console.log('[Fonts] Fonts are ready')
      unlock()
    }
    catch (e) {
      console.warn('[Fonts] Error while loading fonts.', e)
      unlock() // Important : Toujours débloquer en cas d'erreur
    }
  }

  onMounted(() => {
    checkFonts()
  })

  onUnmounted(() => {
    if (fallbackTimer)
      clearTimeout(fallbackTimer)
  })

  return { fontsReady, fontsSupported }
}
