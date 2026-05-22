<script setup lang="ts">
import type { HeroData } from '~/queries/home'
import { useEventBus } from '@vueuse/core'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface Props {
  data: HeroData | null
  clipPath?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  clipPath: true,
})

const settings = useSettings()
const { isMobile } = useBreakpoint()
const { menuTheme, menuOpen } = storeToRefs(useAppStore())
const ctaTheme = computed(() => menuTheme.value === 'black' ? 'white' : menuTheme.value)
const logoColor = computed(() => menuTheme.value === 'white' ? 'beige-100' : `${menuTheme.value}-100`)
const heroCTABus = useEventBus('hero-cta')
const { getTargetRect } = useMenuCtaSync()

const ctaRef = ref<{ $el: HTMLElement } | null>(null)
const ctaInView = ref(false)
const mainRef = useTemplateRef('mainRef')
const bottomRef = useTemplateRef('bottomRef')
const logoRef = useTemplateRef<{ $el: HTMLElement }>('logoRef')

// DrawSVG animation state
let drawCtx: gsap.Context | null = null

const drawParams = reactive({
  duration: 2.5,
  ease: 'power2.inOut',
  delay: 0.3,
  strokeWidth: 1,
  fillDuration: 0.6,
  overlap: 0.15,
})

function initDrawLogo() {
  const path = logoRef.value?.$el?.querySelector<SVGPathElement>('path')
  if (!path)
    return

  drawCtx?.revert()

  drawCtx = gsap.context(() => {
    const colorVar = `--c-${logoColor.value}`
    const strokeColor = getComputedStyle(document.documentElement).getPropertyValue(colorVar).trim() || '#fff'

    gsap.set(path, {
      fillOpacity: 0,
      strokeOpacity: 1,
      stroke: strokeColor,
      strokeWidth: drawParams.strokeWidth,
      drawSVG: '0%',
    })

    gsap.timeline({ delay: drawParams.delay })
      .to(path, {
        drawSVG: '100%',
        duration: drawParams.duration,
        ease: drawParams.ease,
      })
      .to(path, {
        fillOpacity: 1,
        strokeOpacity: 0,
        duration: drawParams.fillDuration,
      }, `>-=${drawParams.overlap}`)
  })
}

if (import.meta.dev) {
  onMounted(() => {
    const { $pane } = useNuxtApp()
    const folder = usePaneFolder($pane, { title: 'Logo DrawSVG' })

    folder.addBinding(drawParams, 'duration', { label: 'Draw Duration', min: 0.1, max: 6, step: 0.1 })
    folder.addBinding(drawParams, 'ease', {
      label: 'Ease',
      options: {
        'none': 'none',
        'power1.inOut': 'power1.inOut',
        'power2.inOut': 'power2.inOut',
        'power3.inOut': 'power3.inOut',
        'power4.inOut': 'power4.inOut',
        'power1.in': 'power1.in',
        'power2.in': 'power2.in',
        'power3.in': 'power3.in',
        'elastic.out(1, 0.5)': 'elastic.out(1, 0.5)',
        'sine.inOut': 'sine.inOut',
        'circ.inOut': 'circ.inOut',
      },
    })
    folder.addBinding(drawParams, 'delay', { label: 'Delay', min: 0, max: 3, step: 0.05 })
    folder.addBinding(drawParams, 'strokeWidth', { label: 'Stroke Width', min: 0.2, max: 8, step: 0.1 })
    folder.addBinding(drawParams, 'fillDuration', { label: 'Fill Duration', min: 0, max: 2, step: 0.05 })
    folder.addBinding(drawParams, 'overlap', { label: 'Fill Overlap', min: 0, max: 1, step: 0.05 })
    folder.addButton({ title: '▶ Replay' }).on('click', initDrawLogo)
  })
}

// When the menu opens before the hero CTA flip has fired (top of hero), reveal
// the menu CTA via clip-path — same behaviour as Hero2/Hero3. Once the flip has
// already brought the CTA into the menu (ctaInView=true), do nothing: the CTA
// is already visible and the scroll-driven animation owns its state.
watch(menuOpen, (open) => {
  if (!menuCtaEl || ctaInView.value)
    return

  if (open) {
    heroCTABus.emit('enter:snap')
    gsap.set(menuCtaEl, { opacity: 1 })
    gsap.fromTo(
      menuCtaEl,
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', duration: 0.4, ease: 'power3.inOut', delay: 0.3 },
    )
  }
  else {
    const clipEl = document.querySelector<HTMLElement>('.app-menu__main-clip')
    gsap.to(menuCtaEl, {
      clipPath: 'inset(0 0 0 100%)',
      duration: 0.3,
      ease: 'power3.inOut',
      onComplete: () => {
        if (clipEl)
          gsap.set(clipEl, { width: 0 })
        gsap.set(menuCtaEl, { display: 'none', opacity: 0, clearProps: 'clipPath' })
      },
    })
  }
})

let ctx: gsap.Context
let currentAnim: gsap.core.Tween | null = null
let clone: HTMLElement | null = null
let menuCtaEl: HTMLElement | null = null

const GSAP_LAYOUT_PROPS = ['transform', 'position', 'top', 'left', 'right', 'bottom', 'min-width', 'width', 'height']

function buildClone(sourceEl: HTMLElement) {
  clone?.remove()
  clone = sourceEl.cloneNode(true) as HTMLElement
  clone.querySelectorAll<HTMLElement>('[style]').forEach((el) => {
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
  heroCTABus.emit('leave')

  const menuRect = menuCtaEl.getBoundingClientRect()
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
  menuCtaEl = document.querySelector<HTMLElement>('.app-menu__cta')

  if (menuCtaEl)
    gsap.set(menuCtaEl, { clearProps: 'display,opacity,visibility,clipPath' })

  const heroCta = ctaRef.value?.$el
  if (heroCta)
    gsap.set(heroCta, { clearProps: 'visibility' })

  ctx = gsap.context(() => {
    ScrollTrigger.addEventListener('refresh', onResize)

    let mounted = false
    ScrollTrigger.create({
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

    if (props.clipPath && !isMobile.value) {
      gsap.timeline({
        scrollTrigger: {
          id: 'hero-clip',
          trigger: bottomRef.value,
          start: 'top-=100% center',
          end: 'bottom+=100% top',
          scrub: true,
        },
      }).to(mainRef.value, { clipPath: 'inset(0 0% 2.5% 0)', y: '-50px' })
    }

    return () => {
      ScrollTrigger.removeEventListener('refresh', onResize)
    }
  }, mainRef.value as HTMLElement)

  initDrawLogo()
})

onUnmounted(() => {
  currentAnim?.kill()
  clone?.remove()
  ctx?.revert()
  drawCtx?.revert()
})
</script>

<template>
  <div ref="mainRef" v-menu-theme="'orange'" class="app-elements-hero-1">
    <div class="app-elements-hero-1__overlay" />

    <div class="app-elements-hero-1__background-wrapper">
      <UtilsParallax
        v-if="data?.backgroundMedia"
        id="hero-bg"
        class="app-elements-hero-1__background"
        position="top"
        :trigger="mainRef"
        :speed="0.5"
        :scale="1.02"
        :reversed="true"
      >
        <ElementsMedia
          v-if="data.backgroundMedia.mediaType === 'image'"
          :src="data.backgroundMedia.imageUrl"
          :alt="data.backgroundMedia.imageAlt ?? ''"
          provider="sanity"
          :hotspot="data.backgroundMedia.imageHotspot"
          :crop="data.backgroundMedia.imageCrop"
          :lazy="false"
          :preload="{ fetchPriority: 'high' }"
        />
        <ElementsVideo
          v-else-if="data.backgroundMedia.mediaType === 'video' && data.backgroundMedia.videoUrl"
          class="app-elements-hero-1__background--video"
          :src="data.backgroundMedia.videoUrl"
          :aria-label="data.backgroundMedia.videoAlt ?? ''"
        />
      </UtilsParallax>
    </div>

    <div class="app-elements-hero-1__content">
      <div class="app-elements-hero-1__top">
        <SvgLogo ref="logoRef" :color="logoColor" class="app-elements-hero-1__logo" />
      </div>

      <div class="app-elements-hero-1__middle">
        <TextsH1 v-if="data?.heading" color="beige-100">
          {{ data.heading }}
        </TextsH1>

        <div class="app-elements-hero-1__middle-content">
          <TextsP2 v-if="data?.subtext" color="beige-100">
            {{ data.subtext }}
          </TextsP2>

          <AtomsCTA v-if="settings?.contactLink?.text" ref="ctaRef" :theme="ctaTheme" class="app-elements-hero-1__cta" :to="settings.contactLink">
            {{ settings.contactLink.text }}
          </AtomsCTA>
        </div>
      </div>

      <div ref="bottomRef" class="app-elements-hero-1__bottom">
        <TextsH3 v-if="data?.tagline" color="beige-100">
          {{ data.tagline }}
        </TextsH3>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.app-elements-hero-1 {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  position: relative;

  &__overlay {
    position: absolute;
    inset: 0;
    background-color: var(--c-black-50);
    z-index: 1;
    pointer-events: none;
  }

  &__background-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    .app-elements-media,
    .app-elements-video {
    }
  }

  &__content {
    position: relative;
    z-index: 2;
    width: 100%;
  }

  &__top {
    width: 100%;
    height: 100svh;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: desktop-vw(16px);

    @include mobile {
      padding: mobile-vw(16px);
    }

    .svg-logo {
      width: 100%;
      height: auto;
      aspect-ratio: 1408 / 213;
    }
  }

  &__middle {
    width: 100%;
    min-height: 75svh;
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    gap: desktop-vw(72px);
    padding: desktop-vw(24px);

    @include mobile {
      flex-direction: column;
      gap: mobile-vw(85px);
      padding: mobile-vw(24px) mobile-vw(16px);
      overflow: hidden;
      justify-content: center;
    }

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
      max-width: desktop-vw(945px);

      @include mobile {
        max-width: 100%;
        font-size: mobile-vw(58px);
        line-height: mobile-vw(58px);
      }
    }
  }

  &__bottom {
    margin-top: desktop-vw(170px);
    margin-bottom: desktop-vw(105px);
    padding: desktop-vw(24px) desktop-vw(120px) desktop-vw(24px) desktop-vw(24px);
    display: flex;
    justify-content: flex-end;

    @include mobile {
      margin-top: mobile-vw(100px);
      margin-bottom: mobile-vw(140px);
      padding: mobile-vw(24px) mobile-vw(16px);
    }

    .H3 {
      width: 37.5%;

      @include mobile {
        width: 100%;
      }
    }
  }

  &__background .utils-parallax__target {
    transform-origin: center top;
  }

  &__background.app-elements-media,
  &__background.utils-parallax {
    position: sticky;
    top: 0;
    width: 100%;
    height: 100svh;
  }

  &__background--video {
    width: 100%;
    height: 100%;
  }
}
</style>
