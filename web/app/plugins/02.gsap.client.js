import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Tempus from 'tempus'

export default defineNuxtPlugin(() => {
  gsap.config({ force3D: true })
  gsap.registerPlugin(ScrollTrigger, SplitText)
  gsap.ticker.lagSmoothing(0)

  ScrollTrigger.defaults({
    markers: process.env.NODE_ENV === 'development',
  })

  gsap.ticker.remove(gsap.updateRoot)

  Tempus.add((time) => {
    gsap.updateRoot(time / 1000)
  }, { priority: -1 })
})
