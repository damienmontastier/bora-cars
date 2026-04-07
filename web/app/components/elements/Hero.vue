<script setup>
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const ctaRef = ref(null)
const ctaInView = ref(false)

let st = null
let currentAnim = null
let clone = null

// Propriétés posées par GSAP sur les enfants (transforms Flip, position, min-width)
// qu'on doit retirer sans toucher aux styles Vue (:style="{ color: ... }")
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

function animateToMenu() {
  const heroCta = ctaRef.value?.$el
  const menuCta = document.querySelector('.app-menu__cta')
  if (!heroCta || !menuCta)
    return

  currentAnim?.kill()

  // Clone créé ici pour toujours refléter le DOM courant (après AtomsCTA.init + fonts)
  buildClone(heroCta)

  const heroRect = heroCta.getBoundingClientRect()
  const menuRect = menuCta.getBoundingClientRect()

  // Menu CTA à 0 dès le départ — pendant le vol seul le clone est visible, pas de double layer
  gsap.set(menuCta, { opacity: 0 })
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
      gsap.set(menuCta, { opacity: 1 })
      currentAnim = null
    },
  })
}

function animateToHero() {
  const heroCta = ctaRef.value?.$el
  const menuCta = document.querySelector('.app-menu__cta')
  if (!heroCta || !menuCta || !clone)
    return

  currentAnim?.kill()

  const menuRect = menuCta.getBoundingClientRect()

  const startRect = { top: menuRect.top, left: menuRect.left, width: menuRect.width, height: menuRect.height }

  gsap.set(menuCta, { opacity: 0 })
  // Reset opacity ici (et non dans le onComplete du forward) pour éviter le flash
  gsap.set(clone, { ...startRect, opacity: 1, visibility: 'visible' })

  // Proxy tween: recalculate hero CTA's current viewport position each frame
  // so the clone tracks the scrolling element and lands exactly on it
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
      gsap.set(menuCta, { opacity: 0 })
      currentAnim = null
    },
  })
}

onMounted(() => {
  st = ScrollTrigger.create({
    trigger: ctaRef.value.$el,
    start: 'top top+=25%',
    markers: true,
    onEnter: () => {
      ctaInView.value = true
      animateToMenu()
    },
    onLeaveBack: () => {
      ctaInView.value = false
      animateToHero()
    },
  })
})

onUnmounted(() => {
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
        <TextsH1 color="beige-100">
          Une conciergerie sur mesure.
        </TextsH1>
        <div class="app-elements-hero__middle-content">
          <TextsP2 color="beige-100">
            Des véhicules d’exception pour des moments uniques.
          </TextsP2>

          <AtomsCTA ref="ctaRef" theme="orange" class="app-elements-hero__cta">
            Contacter un conseiller
          </AtomsCTA>
        </div>
      </div>

      <div class="app-elements-hero__bottom">
        <TextsH3 color="beige-100">
          Nous accompagnons des instants clés personnels ou professionnels, avec un niveau d’exigence où chaque détail compte.
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
    height: 100vh;
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
