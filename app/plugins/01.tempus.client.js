import gsap from 'gsap'
import Tempus from 'tempus'

export default defineNuxtPlugin((nuxtApp) => {
  Tempus.patch()

  // Retire le ticker interne de GSAP
  gsap.ticker.remove(gsap.updateRoot)

  // GSAP piloté directement par Tempus (priorité -1 = avant les autres)
  Tempus.add((time) => {
    gsap.updateRoot(time / 1000)
  }, { priority: -1 })

  nuxtApp.provide('tempus', Tempus)
})
