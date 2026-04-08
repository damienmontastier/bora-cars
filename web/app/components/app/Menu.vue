<script setup>
import { onClickOutside, onKeyStroke, useEventBus, useResizeObserver } from '@vueuse/core'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { useLenis } from 'lenis/vue'

const appStore = useAppStore()
const { menuTheme, menuOpen, menuAnimating } = toRefs(appStore)

const ctaTheme = computed(() => menuOpen.value && menuTheme.value === 'white' ? 'black' : menuTheme.value)

const lenis = useLenis()

watch(menuOpen, (open) => {
  if (open)
    lenis.value?.stop()
  else lenis.value?.start()
})

const { setTargetRect } = useMenuCtaSync()

const logoWrapRef = ref(null) // native div — reliable offsetWidth, no component chain
const mainRef = ref(null)
const mainClipRef = ref(null)
const menuBtnRef = ref(null)
const menuCtaRef = ref(null)
const clipWrapRef = ref(null)

onClickOutside(clipWrapRef, () => {
  if (menuOpen.value && !menuAnimating.value)
    menuOpen.value = false
})

onKeyStroke('Escape', () => {
  if (menuOpen.value && !menuAnimating.value)
    menuOpen.value = false
}, { dedupe: true })

let expandAnim = null
let menuAnim = null
let savedClipWidth = 0
let savedLogoWidth = 0
let ignoreMenuWatch = false

const heroCTABus = useEventBus('hero-cta')
const offHeroCTABus = heroCTABus.on((event) => {
  if (event === 'enter')
    expandMain()
  if (event === 'enter:snap')
    snapMain()
  if (event === 'leave')
    collapseMain()
})

function snapMain() {
  const mainEl = mainRef.value
  const clipEl = mainClipRef.value
  const menuCtaEl = menuCtaRef.value?.$el
  if (!mainEl || !clipEl || !menuCtaEl)
    return

  expandAnim?.kill()
  expandAnim = null
  menuCtaEl.style.display = 'inline-flex'
  menuCtaRef.value?.init()
  gsap.set(clipEl, { width: 'auto' })
  gsap.set(mainEl, { x: 0 })
}

function expandMain() {
  const mainEl = mainRef.value
  const clipEl = mainClipRef.value
  const menuCtaEl = menuCtaRef.value?.$el
  if (!mainEl || !clipEl || !menuCtaEl)
    return

  expandAnim?.kill()

  // Show CTA so mainEl takes its full natural width
  menuCtaEl.style.display = 'inline-flex'
  menuCtaRef.value?.init()

  const fromWidth = clipEl.offsetWidth // current (0 or mid-collapse)
  const toWidth = mainEl.offsetWidth // natural expanded width

  // __inner uses justify-content:center — the flex layout shifts as the clip grows.
  // Reading getBoundingClientRect() with clip at width=0 gives a wrong X position.
  // Solution: temporarily set clip to its final width, measure the real rect, then restore.
  // All synchronous — browser batches DOM writes so no flash occurs.
  clipEl.style.width = `${toWidth}px`
  setTargetRect(menuCtaEl.getBoundingClientRect()) // correct final-layout position
  clipEl.style.width = `${fromWidth}px` // restore before GSAP takes over

  expandAnim = gsap.timeline({
    onComplete: () => {
      gsap.set(clipEl, { width: 'auto' })
      expandAnim = null
    },
  })
    .fromTo(clipEl, { width: fromWidth }, { width: toWidth, duration: 0.6, ease: 'power3.inOut' }, 0)
    .fromTo(mainEl, { x: 50 }, { x: 0, duration: 0.6, ease: 'power3.inOut' }, 0)
}

function collapseMain() {
  const clipEl = mainClipRef.value
  const menuCtaEl = menuCtaRef.value?.$el
  const mainEl = mainRef.value
  if (!clipEl || !menuCtaEl)
    return

  // If menu is open, snap logo/main back instantly — clip collapses to 0 anyway
  if (menuOpen.value) {
    menuAnim?.kill()
    menuAnim = null
    menuAnimating.value = false
    const logoEl = logoWrapRef.value
    if (logoEl)
      gsap.set(logoEl, { clearProps: 'position,left,top,width,opacity' })
    if (mainEl)
      gsap.set(mainEl, { clearProps: 'width' })
    gsap.set(clipEl, { clearProps: 'x' })
    ignoreMenuWatch = true
    menuOpen.value = false
    nextTick(() => {
      ignoreMenuWatch = false
    })
  }

  expandAnim?.kill()

  const fromWidth = clipEl.offsetWidth

  // Do NOT hide CTA before animating — the clip must contract with full content
  // visible so it mirrors the expand (full pill shrinks left, not just the burger pill).
  // CTA is hidden in onComplete once the clip is fully collapsed.
  expandAnim = gsap.timeline({
    onComplete: () => {
      menuCtaEl.style.display = 'none'
      if (mainEl)
        gsap.set(mainEl, { clearProps: 'x' })
      expandAnim = null
    },
  })
    .fromTo(clipEl, { width: fromWidth }, { width: 0, duration: 0.6, ease: 'power3.inOut' }, 0)
    .to(mainEl, { x: 50, duration: 0.6, ease: 'power3.inOut' }, 0)
}

// Measure burger width after fonts load and set as CSS var on __main,
// so padding-left can accommodate the absolutely-positioned burger.
function updateBtnSpace() {
  const btnEl = menuBtnRef.value?.$el
  const mainEl = mainRef.value
  if (!btnEl || !mainEl)
    return
  const gap = Number.parseFloat(getComputedStyle(mainEl).gap) || 0
  mainEl.style.setProperty('--menu-btn-extra', `${btnEl.offsetWidth + gap}px`)
}

// Re-measure whenever the burger resizes (font load, viewport change)
useResizeObserver(menuBtnRef, updateBtnSpace)

function openMenu() {
  const clipEl = mainClipRef.value
  const logoEl = logoWrapRef.value
  const mainEl = mainRef.value
  const innerEl = logoEl?.parentElement
  if (!clipEl || !logoEl || !mainEl || !innerEl)
    return

  menuAnim?.kill()
  menuAnimating.value = true

  savedClipWidth = clipEl.offsetWidth
  savedLogoWidth = logoEl.offsetWidth
  const gap = Number.parseFloat(getComputedStyle(innerEl).gap) || 0

  // 1. Capture clip state BEFORE changing layout —
  //    Flip will animate from this position (right-of-center with logo beside it)
  //    to the new centered position → natural leftward "catching up" movement
  const state = Flip.getState(clipEl)

  // 2. Freeze logo at its current visual position, remove from flex flow
  const logoRect = logoEl.getBoundingClientRect()
  const innerRect = innerEl.getBoundingClientRect()
  gsap.set(logoEl, {
    position: 'absolute',
    left: logoRect.left - innerRect.left,
    top: logoRect.top - innerRect.top,
    width: savedLogoWidth,
  })

  // 3. Set clip's final size — now the only flex item, it recenters (moves left)
  gsap.set(clipEl, { width: savedClipWidth + savedLogoWidth + gap })
  gsap.set(mainEl, { width: '100%' })

  // 4. Flip moves clip from old right-of-center position → new centered position
  //    Logo fades out near the end once clip has passed over it
  menuAnim = gsap.timeline({
    onComplete: () => {
      menuAnim = null
      menuAnimating.value = false
    },
  })
    .add(Flip.from(state, { duration: 0.5, ease: 'power3.inOut', simple: true }), 0)
    .to(logoEl, { opacity: 0, duration: 0.2, ease: 'power2.in' }, 0.1)
}

function closeMenu() {
  const clipEl = mainClipRef.value
  const logoEl = logoWrapRef.value
  const mainEl = mainRef.value
  const innerEl = logoEl?.parentElement
  if (!clipEl || !logoEl || !mainEl || !innerEl)
    return

  menuAnim?.kill()
  menuAnimating.value = true

  const gap = Number.parseFloat(getComputedStyle(innerEl).gap) || 0
  // Clip is centered alone → with logo in flex flow it sits (logoWidth + gap) / 2 to the right
  // Animate that offset so the clip lands exactly at its natural flex position
  const xOffset = (savedLogoWidth + gap) / 2

  menuAnim = gsap.timeline({
    delay: 0.3,
    onComplete: () => {
      // Restore logo to flex flow — clip is already at the correct position (no jump)
      gsap.set(logoEl, { clearProps: 'position,left,top,width' })
      gsap.set(clipEl, { clearProps: 'x', width: 'auto' })
      gsap.set(mainEl, { clearProps: 'width' })
      menuAnim = null
      menuAnimating.value = false
    },
  })
    // Clip shrinks and drifts right toward its natural position beside the logo
    .to(clipEl, { width: savedClipWidth, x: xOffset, duration: 0.5, ease: 'power3.inOut' }, 0)
    // Logo fades in once clip has moved away enough to reveal it
    .to(logoEl, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.25)
}

watch(menuOpen, (open) => {
  if (ignoreMenuWatch)
    return
  if (open)
    openMenu()
  else closeMenu()
})

onUnmounted(() => {
  offHeroCTABus()
  expandAnim?.kill()
  menuAnim?.kill()
  lenis.value?.start() // ensure scroll is re-enabled if unmounted while menu was open
})
</script>

<template>
  <div class="app-menu">
    <div class="app-menu__inner">
      <div ref="logoWrapRef" class="app-menu__logo-wrap">
        <UtilsBaseLink to="/">
          <SvgLogoMinimal class="app-menu__logo" :color="menuTheme" />
        </UtilsBaseLink>
      </div>

      <div ref="clipWrapRef" class="app-menu__clip-wrap">
        <div ref="mainClipRef" class="app-menu__main-clip">
          <div ref="mainRef" class="app-menu__main" :class="{ 'is-open': menuOpen }">
            <AppMenuCTA ref="menuBtnRef" class="app-menu__btn" />

            <AtomsCTA ref="menuCtaRef" :theme="ctaTheme" class="app-menu__cta">
              Contacter un conseiller
            </AtomsCTA>
          </div>
        </div>

        <AppMenuPanel />
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
    position: relative;
  }

  &__clip-wrap {
    position: relative;
    display: inline-flex;
  }

  &__main-clip {
    overflow: hidden;
    display: inline-flex;
    width: 0; // hidden until GSAP expands it
  }

  &__main {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: desktop-vw(8px); // read by JS to compute --menu-btn-extra
    position: relative; // anchor for absolute .app-menu__btn

    background: var(--c-beige-20);
    // padding-left reserves space for the absolute burger + gap
    padding: desktop-vw(8px);
    padding-left: calc(desktop-vw(8px) + var(--menu-btn-extra, 0px));
    border-radius: desktop-vw(12px);
    border: 1px solid var(--c-beige-20);
    backdrop-filter: blur(20px);
    transition:
      background 0.4s var(--ease-out-cubic),
      border-color 0.4s var(--ease-out-cubic);

    &.is-open {
      background: var(--c-beige-100);
      border-color: var(--c-beige-100);
    }
  }

  // Burger button: absolute so it doesn't affect __main's flex width
  &__btn {
    position: absolute;
    left: desktop-vw(8px);
    top: 50%;
    transform: translateY(-50%);
  }

  &__logo-wrap {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  &__logo {
    width: desktop-vw(76px);
    height: auto;
    aspect-ratio: 1 / 1;
  }

  &__cta {
    display: none;
    opacity: 0;
  }
}
</style>
