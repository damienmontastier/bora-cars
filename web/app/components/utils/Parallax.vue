<!--
  UtilsParallax — wrapper parallax GSAP ScrollTrigger, overflow:hidden intégré.

  speed    : intensité du déplacement y (défaut: 1). 0.3 subtil, 0.5 standard.
  scale    : scale de destination absolue (défaut: 1.045). L'image zoom de 1 → scale.
  position : 'top' pour les éléments visibles au 1er écran (hero), 'default' sinon.
  id       : identifiant ScrollTrigger pour debug / ScrollTrigger.getById().
-->
<script setup lang="ts">
import gsap from 'gsap'

interface Props {
  speed?: number
  scale?: number
  position?: 'top' | 'default'
  id?: string
  trigger?: HTMLElement | null
}

const props = withDefaults(defineProps<Props>(), {
  speed: 1,
  scale: 1.045,
  position: 'default',
  id: 'parallax',
  trigger: null,
})

const triggerRef = useTemplateRef<HTMLElement>('triggerRef')
const targetRef = useTemplateRef<HTMLElement>('targetRef')

let mm: gsap.MatchMedia | null = null

onMounted(async () => {
  await nextTick()

  mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const getY = () => window.innerWidth * props.speed * 0.1

    const resolvedTrigger = props.trigger ?? (props.position === 'top' ? document.body : triggerRef.value)
    const resolvedEnd = props.trigger ? 'bottom top' : props.position === 'top' ? '+=100%' : 'bottom top'

    const tl = gsap.timeline({
      scrollTrigger: {
        id: props.id,
        trigger: resolvedTrigger,
        scrub: true,
        start: props.position === 'top' ? 'top top' : 'top bottom',
        end: resolvedEnd,
        invalidateOnRefresh: true,
      },
    }).fromTo(
      targetRef.value,
      { y: () => props.position === 'top' ? 0 : -getY(), scale: 1 },
      { y: () => getY(), scale: props.scale, ease: 'none' },
    )

    return () => tl.kill()
  })
})

onUnmounted(() => {
  mm?.revert()
})
</script>

<template>
  <div ref="triggerRef" class="utils-parallax">
    <div ref="targetRef" class="utils-parallax__target">
      <slot />
    </div>
  </div>
</template>

<style lang="scss">
.utils-parallax {
  overflow: hidden;
  width: 100%;
  height: 100%;

  &__target {
    width: 100%;
    height: 100%;
    will-change: transform;
  }
}
</style>
