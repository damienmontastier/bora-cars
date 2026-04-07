<script setup>
import { useEventBus } from '@vueuse/core'
import { Flip } from 'gsap/Flip'

const appStore = useAppStore()
const { menuTheme } = toRefs(appStore)

const { setTargetRect } = useMenuCtaSync()

const mainRef = ref(null)
const menuBtnRef = ref(null)
const menuCtaRef = ref(null)

let flipAnim = null

const heroCTABus = useEventBus('hero-cta')

heroCTABus.on((event) => {
  if (event === 'enter') expandMain()
  if (event === 'leave') collapseMain()
})

function expandMain() {
  const mainEl = mainRef.value
  const menuCtaEl = menuCtaRef.value?.$el
  if (!mainEl || !menuCtaEl) return

  flipAnim?.kill()

  // Only track mainEl + AppMenuCTA — exclude menuCta so Flip doesn't apply
  // transforms to it (would corrupt getBoundingClientRect() in Hero.vue)
  const menuBtnEl = menuBtnRef.value?.$el
  const state = Flip.getState([mainEl, menuBtnEl].filter(Boolean))

  // Montrer le CTA — __main va s'agrandir
  menuCtaEl.style.display = 'inline-flex'

  // Init lazily (first time visible so offsetWidth is correct)
  menuCtaRef.value?.init()

  // Save rect BEFORE Flip.from() applies transforms to mainEl.
  // Flip.from() is synchronous — it immediately sets transforms on mainEl,
  // which would corrupt getBoundingClientRect() on its children in Hero.vue.
  setTargetRect(menuCtaEl.getBoundingClientRect())

  // Flip anime le container depuis l'état compact vers l'état étendu
  // nested:true empêche AppMenuCTA de se déformer pendant l'expansion
  flipAnim = Flip.from(state, {
    duration: 0.6,
    ease: 'power3.inOut',
    nested: true,
    onComplete: () => { flipAnim = null },
  })
}

function collapseMain() {
  const mainEl = mainRef.value
  const menuCtaEl = menuCtaRef.value?.$el
  if (!mainEl || !menuCtaEl) return

  flipAnim?.kill()

  const menuBtnEl = menuBtnRef.value?.$el
  const state = Flip.getState([mainEl, menuBtnEl].filter(Boolean))

  // Cacher le CTA — __main va se contracter
  menuCtaEl.style.display = 'none'

  flipAnim = Flip.from(state, {
    duration: 0.6,
    ease: 'power3.inOut',
    nested: true,
    onComplete: () => { flipAnim = null },
  })
}

onUnmounted(() => {
  flipAnim?.kill()
})
</script>

<template>
  <div class="app-menu">
    <div class="app-menu__inner">
      <SvgLogoMinimal class="app-menu__logo" :color="menuTheme" />

      <div ref="mainRef" class="app-menu__main">
        <AppMenuCTA ref="menuBtnRef" />

        <AtomsCTA ref="menuCtaRef" :theme="menuTheme" class="app-menu__cta">
          Contacter un conseiller
        </AtomsCTA>
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

  &__main {
    display: flex;
    align-items: center;
    gap: desktop-vw(8px);

    background: var(--c-beige-20);
    padding: desktop-vw(8px);
    border-radius: desktop-vw(12px);
    border: 1px solid var(--c-beige-20);
    backdrop-filter: blur(20px);
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
