import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import Tempus from 'tempus'

const DEV_MARKERS = false

export default defineNuxtPlugin(() => {
  gsap.config({ force3D: true })
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip, DrawSVGPlugin)
  gsap.ticker.lagSmoothing(0)

  ScrollTrigger.defaults({
    markers: import.meta.dev && DEV_MARKERS,
  })

  gsap.ticker.remove(gsap.updateRoot)

  // Tempus v1 : le callback reçoit un objet d'état ({ time, deltaTime, frame, budget }),
  // et `priority` s'appelle désormais `order` (même sémantique : le plus bas tourne en premier).
  Tempus.add(({ time }) => {
    gsap.updateRoot(time / 1000)
  }, { order: -1, label: 'gsap' })
})
