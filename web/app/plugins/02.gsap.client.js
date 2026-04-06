import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

import Tempus from 'tempus'

export default defineNuxtPlugin((_nuxtApp) => {
  gsap.config({
    force3D: true,
  })

  gsap.registerPlugin(ScrollTrigger, SplitText)

  ScrollTrigger.defaults({
    markers: import.meta.dev,
  })

  gsap.ticker.remove(gsap.updateRoot)

  gsap.ticker.lagSmoothing(0)

  Tempus.add((time) => {
    gsap.updateRoot(time / 1000)
  })
})
