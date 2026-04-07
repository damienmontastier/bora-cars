<script setup>
import { useEventBus } from '@vueuse/core'
import gsap from 'gsap'

const appStore = useAppStore()
const { menuTheme, fontsLoaded } = toRefs(appStore)

const { setTargetRect } = useMenuCtaSync()

const mainRef = ref(null)
const mainClipRef = ref(null)
const menuBtnRef = ref(null)
const menuCtaRef = ref(null)

let expandAnim = null

const heroCTABus = useEventBus('hero-cta')

heroCTABus.on((event) => {
  if (event === 'enter') expandMain()
  if (event === 'leave') collapseMain()
})

function expandMain() {
  const mainEl = mainRef.value
  const clipEl = mainClipRef.value
  const menuCtaEl = menuCtaRef.value?.$el
  if (!mainEl || !clipEl || !menuCtaEl) return

  expandAnim?.kill()

  // Show CTA so mainEl takes its full natural width
  menuCtaEl.style.display = 'inline-flex'
  menuCtaRef.value?.init()

  const fromWidth = clipEl.offsetWidth // current (0 or mid-collapse)
  const toWidth = mainEl.offsetWidth   // natural expanded width

  // __inner uses justify-content:center — the flex layout shifts as the clip grows.
  // Reading getBoundingClientRect() with clip at width=0 gives a wrong X position.
  // Solution: temporarily set clip to its final width, measure the real rect, then restore.
  // All synchronous — browser batches DOM writes so no flash occurs.
  clipEl.style.width = `${toWidth}px`
  setTargetRect(menuCtaEl.getBoundingClientRect()) // correct final-layout position
  clipEl.style.width = `${fromWidth}px`            // restore before GSAP takes over

  expandAnim = gsap.fromTo(clipEl,
    { width: fromWidth },
    {
      width: toWidth,
      duration: 0.6,
      ease: 'power3.inOut',
      onComplete: () => {
        // Let clip follow natural content width (handles resize)
        gsap.set(clipEl, { width: 'auto' })
        expandAnim = null
      },
    },
  )
}

function collapseMain() {
  const clipEl = mainClipRef.value
  const menuCtaEl = menuCtaRef.value?.$el
  if (!clipEl || !menuCtaEl) return

  expandAnim?.kill()

  const fromWidth = clipEl.offsetWidth

  // Do NOT hide CTA before animating — the clip must contract with full content
  // visible so it mirrors the expand (full pill shrinks left, not just the burger pill).
  // CTA is hidden in onComplete once the clip is fully collapsed.
  expandAnim = gsap.fromTo(clipEl,
    { width: fromWidth },
    {
      width: 0,
      duration: 0.6,
      ease: 'power3.inOut',
      onComplete: () => {
        menuCtaEl.style.display = 'none'
        expandAnim = null
      },
    },
  )
}

// Measure burger width after fonts load and set as CSS var on __main,
// so padding-left can accommodate the absolutely-positioned burger.
function updateBtnSpace() {
  const btnEl = menuBtnRef.value?.$el
  const mainEl = mainRef.value
  if (!btnEl || !mainEl) return
  const gap = Number.parseFloat(getComputedStyle(mainEl).gap) || 0
  mainEl.style.setProperty('--menu-btn-extra', `${btnEl.offsetWidth + gap}px`)
}

onMounted(() => {
  if (fontsLoaded.value) {
    updateBtnSpace()
  }
  else {
    const stop = watch(fontsLoaded, (loaded) => {
      if (!loaded) return
      updateBtnSpace()
      stop()
    })
  }
})

onUnmounted(() => {
  expandAnim?.kill()
})
</script>

<template>
  <div class="app-menu">
    <div class="app-menu__inner">
      <UtilsBaseLink to="/">
        <SvgLogoMinimal class="app-menu__logo" :color="menuTheme" />
      </UtilsBaseLink>

      <!-- Clip wrapper: overflow hidden, animates width from 0 → natural -->
      <div ref="mainClipRef" class="app-menu__main-clip">
        <div ref="mainRef" class="app-menu__main">
          <!-- Absolute: doesn't drive __main width, appears as clip reveals it -->
          <AppMenuCTA ref="menuBtnRef" class="app-menu__btn" />

          <AtomsCTA ref="menuCtaRef" :theme="menuTheme" class="app-menu__cta">
            Contacter un conseiller
          </AtomsCTA>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.app-menu {
  width: 100%;
  z-index: 10;
  position: fixed;
  top: 0;
  padding: desktop-vw(8px) 0px desktop-vw(8px) 0px;
  display: flex;
  flex-direction: row;

  &__inner {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: desktop-vw(8px);
  }

  // Clip wrapper — overflow:hidden reveals the pill from left to right
  &__main-clip {
    overflow: hidden;
    display: inline-flex;
    border-radius: desktop-vw(12px);
    width: 0; // hidden until GSAP expands it
  }

  &__main {
    display: flex;
    align-items: center;
    gap: desktop-vw(8px); // read by JS to compute --menu-btn-extra
    position: relative; // anchor for absolute .app-menu__btn

    background: var(--c-beige-20);
    // padding-left reserves space for the absolute burger + gap
    padding: desktop-vw(8px);
    padding-left: calc(desktop-vw(8px) + var(--menu-btn-extra, 0px));
    border-radius: desktop-vw(12px);
    border: 1px solid var(--c-beige-20);
    backdrop-filter: blur(20px);
  }

  // Burger button: absolute so it doesn't affect __main's flex width
  &__btn {
    position: absolute;
    left: desktop-vw(8px);
    top: 50%;
    transform: translateY(-50%);
  }

  &__logo {
    width: desktop-vw(76px);
    height: 100%;
    aspect-ratio: 1 / 1;
  }

  &__cta {
    display: none;
    opacity: 0;
  }
}
</style>
