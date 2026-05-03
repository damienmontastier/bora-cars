<script setup lang="ts">
import type { MenuData } from '~/queries/menu'
import { onClickOutside, onKeyStroke, useEventBus } from '@vueuse/core'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { useLenis } from 'lenis/vue'

interface Props {
  data: MenuData | null
}

const props = defineProps<Props>()

const appStore = useAppStore()
const { menuTheme, menuOpen, menuAnimating } = toRefs(appStore)

const settings = useSettings()

const ctaTheme = computed(() => menuOpen.value && menuTheme.value === 'white' ? 'black' : menuTheme.value)

const lenis = useLenis()

watch(menuOpen, (open) => {
  if (open)
    lenis.value?.stop()
  else if (!ignoreMenuWatch)
    lenis.value?.start()
})

const { setTargetRect } = useMenuCtaSync()

const logoWrapRef = ref(null) // native div — reliable offsetWidth, no component chain
const mainRef = ref(null)
const mainClipRef = ref(null)
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

const transitionBus = useEventBus('page-transition')
transitionBus.on((event) => {
  if (event === 'covered') resetMenu()
})

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
  const clipEl = mainClipRef.value
  const menuCtaEl = menuCtaRef.value?.$el
  if (!clipEl || !menuCtaEl)
    return

  expandAnim?.kill()
  expandAnim = null
  menuCtaEl.style.display = 'inline-flex'
  menuCtaRef.value?.init()
  gsap.set(clipEl, { width: 'auto' })
}

function expandMain() {
  const clipEl = mainClipRef.value
  const menuCtaEl = menuCtaRef.value?.$el
  if (!clipEl || !menuCtaEl)
    return

  expandAnim?.kill()

  menuCtaEl.style.display = 'inline-flex'
  menuCtaRef.value?.init()

  const fromWidth = clipEl.offsetWidth

  // __inner uses justify-content:center — pill shifts as the clip grows.
  // Temporarily set clip to auto to measure CTA's natural width and final rect.
  // All synchronous — browser batches DOM writes so no flash occurs.
  clipEl.style.width = 'auto'
  const toWidth = clipEl.offsetWidth
  setTargetRect(menuCtaEl.getBoundingClientRect()) // correct final-layout position
  clipEl.style.width = `${fromWidth}px` // restore before GSAP takes over

  expandAnim = gsap.timeline({
    onComplete: () => {
      gsap.set(clipEl, { width: 'auto' })
      expandAnim = null
    },
  })
    .fromTo(clipEl, { width: fromWidth }, { width: toWidth, duration: 0.6, ease: 'power3.inOut' }, 0)
}

function collapseMain() {
  const clipEl = mainClipRef.value
  const menuCtaEl = menuCtaRef.value?.$el
  if (!clipEl || !menuCtaEl)
    return

  // Clip already at 0 (e.g. resetMenu on page change) → nothing to do
  if (clipEl.offsetWidth === 0)
    return

  // If menu is open, snap logo/main back instantly — clip collapses to 0 anyway
  if (menuOpen.value) {
    menuAnim?.kill()
    menuAnim = null
    menuAnimating.value = false
    const logoEl = logoWrapRef.value
    if (logoEl)
      gsap.set(logoEl, { clearProps: 'position,left,top,width,opacity' })
    if (mainRef.value)
      gsap.set(mainRef.value, { clearProps: 'width,x' })
    gsap.set(clipEl, { clearProps: 'x' })
    ignoreMenuWatch = true
    menuOpen.value = false
    nextTick(() => {
      ignoreMenuWatch = false
    })
  }

  expandAnim?.kill()

  const fromWidth = clipEl.offsetWidth

  expandAnim = gsap.timeline({
    onComplete: () => {
      menuCtaEl.style.display = 'none'
      expandAnim = null
    },
  })
    .fromTo(clipEl, { width: fromWidth }, { width: 0, duration: 0.6, ease: 'power3.inOut' }, 0)
}

function openMenu() {
  const logoEl = logoWrapRef.value
  const mainEl = mainRef.value
  const innerEl = logoEl?.parentElement
  if (!logoEl || !mainEl || !innerEl)
    return

  menuAnim?.kill()
  menuAnimating.value = true

  savedClipWidth = mainEl.offsetWidth // actual pill width — used by closeMenu to restore
  savedLogoWidth = logoEl.offsetWidth
  const gap = Number.parseFloat(getComputedStyle(innerEl).gap) || 0

  // Measure full pill width (burger + CTA) for panel sizing, without showing the CTA.
  // Temporarily show the clip to get the natural full width, then restore invisibly.
  const clipEl = mainClipRef.value
  const menuCtaEl = menuCtaRef.value?.$el
  let openWidth = savedClipWidth
  if (clipEl && menuCtaEl && clipEl.offsetWidth === 0) {
    menuCtaEl.style.display = 'inline-flex'
    clipEl.style.width = 'auto'
    openWidth = mainEl.offsetWidth
    clipEl.style.width = '0'
    menuCtaEl.style.display = 'none'
  }

  // 1. Capture pill state BEFORE changing layout —
  //    Flip will animate from this position (right-of-center with logo beside it)
  //    to the new centered position → natural leftward "catching up" movement
  const state = Flip.getState(mainEl)

  // 2. Freeze logo at its current visual position, remove from flex flow
  const logoRect = logoEl.getBoundingClientRect()
  const innerRect = innerEl.getBoundingClientRect()
  gsap.set(logoEl, {
    position: 'absolute',
    left: logoRect.left - innerRect.left,
    top: logoRect.top - innerRect.top,
    width: savedLogoWidth,
  })

  // 3. Set pill's final size using full width (burger + CTA) so the panel always
  //    has the correct width — savedClipWidth (actual) is used by closeMenu to restore
  gsap.set(mainEl, { width: openWidth + savedLogoWidth + gap })

  // 4. Flip moves pill from old right-of-center position → new centered position
  //    Logo fades out near the end once pill has passed over it
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
  const logoEl = logoWrapRef.value
  const mainEl = mainRef.value
  const innerEl = logoEl?.parentElement
  if (!logoEl || !mainEl || !innerEl)
    return

  menuAnim?.kill()
  menuAnimating.value = true

  const gap = Number.parseFloat(getComputedStyle(innerEl).gap) || 0
  // Pill is centered alone → with logo in flex flow it sits (logoWidth + gap) / 2 to the right
  // Animate that offset so the pill lands exactly at its natural flex position
  const xOffset = (savedLogoWidth + gap) / 2

  menuAnim = gsap.timeline({
    delay: 0.3,
    onComplete: () => {
      // Restore logo to flex flow — pill is already at the correct position (no jump)
      gsap.set(logoEl, { clearProps: 'position,left,top,width' })
      gsap.set(mainEl, { clearProps: 'x,width' })
      menuAnim = null
      menuAnimating.value = false
    },
  })
    // Pill shrinks and drifts right toward its natural position beside the logo
    .to(mainEl, { width: savedClipWidth, x: xOffset, duration: 0.5, ease: 'power3.inOut' }, 0)
    // Logo fades in once pill has moved away enough to reveal it
    .to(logoEl, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.25)
}

watch(menuOpen, (open) => {
  if (ignoreMenuWatch)
    return
  if (open)
    openMenu()
  else closeMenu()
})

function resetMenu() {
  expandAnim?.kill()
  expandAnim = null
  menuAnim?.kill()
  menuAnim = null
  menuAnimating.value = false

  const logoEl = logoWrapRef.value
  const mainEl = mainRef.value
  const clipEl = mainClipRef.value
  const menuCtaEl = menuCtaRef.value?.$el

  // 1. Hide CTA and collapse the CTA clip first —
  //    logo returns to flex flow only after, without a visible jump
  if (menuCtaEl)
    menuCtaEl.style.display = 'none'
  if (clipEl)
    gsap.set(clipEl, { width: 0, clearProps: 'x' })
  if (mainEl)
    gsap.set(mainEl, { clearProps: 'x,width' })
  if (logoEl)
    gsap.set(logoEl, { clearProps: 'position,left,top,width,opacity' })

  lenis.value?.start()
  ignoreMenuWatch = true
  menuOpen.value = false
  nextTick(() => { ignoreMenuWatch = false })
}

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
        <div ref="mainRef" class="app-menu__main" :class="{ 'is-open': menuOpen }">
          <AppMenuCTA class="app-menu__btn" :menu-label="props.data?.menuLabel" :close-label="props.data?.closeLabel" />

          <div ref="mainClipRef" class="app-menu__main-clip">
            <AtomsCTA ref="menuCtaRef" :to="settings?.contactLink" :theme="ctaTheme" class="app-menu__cta">
              {{ settings?.contactLink?.text }}
            </AtomsCTA>
          </div>
        </div>

        <AppMenuPanel :links="props.data?.links ?? []" :locations="props.data?.locations ?? []" />
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

  &__main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--c-black-50);
    padding: desktop-vw(8px);
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

  &__main-clip {
    overflow: hidden;
    display: inline-flex;
    flex-shrink: 0; // prevent flex from overriding GSAP-controlled width
    width: 0; // hidden until GSAP expands it
  }

  &__btn {
    flex-shrink: 0;
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
    margin-left: desktop-vw(8px); // gap is inside the clip — invisible when clip width: 0
  }
}
</style>
