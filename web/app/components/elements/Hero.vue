<script setup lang="ts">
import { useEventBus } from '@vueuse/core'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface HeroLink {
  type: 'external' | 'email' | 'phone' | 'internal'
  text?: string
  url?: string
  email?: string
  phone?: string
}

interface HeroData {
  heading?: string
  tagline?: string
  subtext?: string
  cta?: HeroLink
}

interface Props { data: HeroData | null }

const props = defineProps<Props>()

const heroCTABus = useEventBus('hero-cta')
const { getTargetRect } = useMenuCtaSync()

const ctaRef = ref(null)
const ctaInView = ref(false)

let st = null
let currentAnim = null
let clone = null
let menuCtaEl = null

const GSAP_LAYOUT_PROPS = ['transform', 'position', 'top', 'left', 'right', 'bottom', 'min-width', 'width', 'height']

function buildClone(sourceEl) {
  clone?.remove()
  clone = sourceEl.cloneNode(true)
  clone.querySelectorAll('[style]').forEach((el) => {
    GSAP_LAYOUT_PROPS.forEach(prop => el.style.removeProperty(prop))
  })
  gsap.set(clone, { position: 'fixed', visibility: 'hidden', margin: 0, zIndex: 1000, pointerEvents: 'none' })
  document.body.appendChild(clone)
}

function snapToMenu() {
  const heroCta = ctaRef.value?.$el
  if (!heroCta || !menuCtaEl)
    return
  currentAnim?.kill()
  currentAnim = null
  heroCTABus.emit('enter:snap')
  buildClone(heroCta)
  gsap.set(clone, { visibility: 'hidden' })
  gsap.set(menuCtaEl, { opacity: 1 })
  gsap.set(heroCta, { visibility: 'hidden' })
}

function animateToMenu() {
  const heroCta = ctaRef.value?.$el
  if (!heroCta || !menuCtaEl)
    return

  currentAnim?.kill()

  heroCTABus.emit('enter')

  buildClone(heroCta)

  const heroRect = heroCta.getBoundingClientRect()
  const menuRect = getTargetRect() || menuCtaEl.getBoundingClientRect()

  gsap.set(menuCtaEl, { opacity: 0 })
  gsap.set(clone, { top: heroRect.top, left: heroRect.left, width: heroRect.width, height: heroRect.height, visibility: 'visible' })
  gsap.set(heroCta, { visibility: 'hidden' })

  currentAnim = gsap.to(clone, {
    top: menuRect.top,
    left: menuRect.left,
    width: menuRect.width,
    height: menuRect.height,
    duration: 0.7,
    ease: 'power3.inOut',
    onComplete: () => {
      gsap.set(clone, { visibility: 'hidden' })
      gsap.set(menuCtaEl, { opacity: 1 })
      currentAnim = null
    },
  })
}

function animateToHero() {
  const heroCta = ctaRef.value?.$el
  if (!heroCta || !menuCtaEl || !clone)
    return

  currentAnim?.kill()

  const menuRect = menuCtaEl.getBoundingClientRect()

  heroCTABus.emit('leave')

  const startRect = { top: menuRect.top, left: menuRect.left, width: menuRect.width, height: menuRect.height }

  gsap.set(menuCtaEl, { opacity: 0 })
  gsap.set(clone, { ...startRect, opacity: 1, visibility: 'visible' })

  const proxy = { t: 0 }
  currentAnim = gsap.to(proxy, {
    t: 1,
    duration: 0.7,
    ease: 'power3.inOut',
    onUpdate() {
      const t = proxy.t
      const targetRect = heroCta.getBoundingClientRect()
      gsap.set(clone, {
        top: startRect.top + (targetRect.top - startRect.top) * t,
        left: startRect.left + (targetRect.left - startRect.left) * t,
        width: startRect.width + (targetRect.width - startRect.width) * t,
        height: startRect.height + (targetRect.height - startRect.height) * t,
      })
    },
    onComplete: () => {
      gsap.set(clone, { visibility: 'hidden' })
      gsap.set(heroCta, { clearProps: 'visibility' })
      gsap.set(menuCtaEl, { opacity: 0 })
      currentAnim = null
    },
  })
}

function onResize() {
  const heroCta = ctaRef.value?.$el
  if (!heroCta || !menuCtaEl)
    return

  currentAnim?.kill()
  currentAnim = null

  if (clone)
    gsap.set(clone, { visibility: 'hidden' })

  if (ctaInView.value) {
    gsap.set(heroCta, { visibility: 'hidden' })
    gsap.set(menuCtaEl, { opacity: 1 })
  }
  else {
    gsap.set(heroCta, { clearProps: 'visibility' })
    gsap.set(menuCtaEl, { opacity: 0 })
  }
}

onMounted(() => {
  clone?.remove()
  clone = null
  menuCtaEl = document.querySelector('.app-menu__cta')
  if (menuCtaEl)
    gsap.set(menuCtaEl, { clearProps: 'display,opacity,visibility' })
  const heroCta = ctaRef.value?.$el
  if (heroCta)
    gsap.set(heroCta, { clearProps: 'visibility' })

  ScrollTrigger.addEventListener('refresh', onResize)

  let mounted = false
  st = ScrollTrigger.create({
    trigger: ctaRef.value?.$el,
    start: 'top top+=25%',
    onEnter: () => {
      ctaInView.value = true
      if (mounted)
        animateToMenu()
      else
        snapToMenu()
    },
    onLeaveBack: () => {
      ctaInView.value = false
      animateToHero()
    },
  })
  mounted = true
})

onUnmounted(() => {
  ScrollTrigger.removeEventListener('refresh', onResize)
  currentAnim?.kill()
  st?.kill()
  clone?.remove()
})
</script>

<template>
  <div class="app-elements-hero">
    <div class="app-elements-hero__background-wrapper">
      <ElementsMedia class="app-elements-hero__background" />
    </div>

    <div class="app-elements-hero__content">
      <div class="app-elements-hero__top">
        <SvgLogo class="app-elements-hero__logo" />
      </div>

      <div class="app-elements-hero__middle">
        <TextsH1 v-if="data?.heading" color="beige-100">
          {{ data.heading }}
        </TextsH1>

        <div class="app-elements-hero__middle-content">
          <TextsP2 v-if="data?.subtext" color="beige-100">
            {{ data.subtext }}
          </TextsP2>

          <AtomsCTA v-if="data?.cta?.text" ref="ctaRef" theme="orange" class="app-elements-hero__cta" :to="data.cta">
            {{ data.cta.text }}
          </AtomsCTA>
        </div>
      </div>

      <div class="app-elements-hero__bottom">
        <TextsH3 v-if="data?.tagline" color="beige-100">
          {{ data.tagline }}
        </TextsH3>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.app-elements-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  position: relative;

  &__background-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  &__content {
    position: relative;
    z-index: 1;
  }

  &__top {
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: desktop-vw(16px);

    .svg-logo {
      width: 100%;
      height: auto;
      aspect-ratio: 1408 / 213;
    }
  }

  &__middle {
    width: 100%;
    height: 85vh;
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    gap: desktop-vw(72px);
    padding: desktop-vw(24px);

    &-content {
      flex: 0 0 desktop-vw(310px);
      margin-left: auto;
      display: flex;
      flex-direction: column;
      gap: desktop-vw(24px);
    }

    .P2 {
      width: 75%;
    }

    .app-atoms-cta {
      align-self: flex-end;
      width: 100%;
    }

    .H1 {
      flex: 0 0 auto;
      max-width: desktop-vw(900px);
    }
  }

  &__bottom {
    margin-top: desktop-vw(170px);
    margin-bottom: desktop-vw(105px);
    padding: desktop-vw(24px) desktop-vw(120px) desktop-vw(24px) desktop-vw(24px);
    display: flex;
    justify-content: flex-end;

    .H3 {
      width: 57.5%;
    }
  }

  &__background.app-elements-media {
    position: sticky;
    top: 0;
    width: 100%;
    height: 100vh;
  }
}
</style>
