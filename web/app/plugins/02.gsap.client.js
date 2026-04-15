import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Tempus from 'tempus'

const DEV_MARKERS = false

export default defineNuxtPlugin(() => {
  gsap.config({ force3D: true })
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip)
  gsap.ticker.lagSmoothing(0)

  ScrollTrigger.defaults({
    markers: import.meta.dev && DEV_MARKERS,
  })

  gsap.ticker.remove(gsap.updateRoot)

  Tempus.add((time) => {
    gsap.updateRoot(time / 1000)
  }, { priority: -1 })
})
