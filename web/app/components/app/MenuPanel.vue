<script setup>
import gsap from 'gsap'

const appStore = useAppStore()
const { menuOpen, menuTheme } = toRefs(appStore)

const containerRef = ref(null)
const navRef = ref(null)

let anim = null

const CLIP_CLOSED_OPEN = 'inset(0% 50% 100% 50% round 12px)'
const CLIP_CLOSED_CLOSE = 'inset(0% 0% 100% 0% round 12px)'
const CLIP_OPEN = 'inset(0% 0% 0% 0% round 12px)'

onMounted(() => {
  gsap.set(containerRef.value, { clipPath: CLIP_CLOSED_OPEN })
  gsap.set(navRef.value.children, { opacity: 0 })
})

watch(menuOpen, (open) => {
  anim?.kill()

  if (open) {
    anim = gsap.timeline({
      onComplete: () => { anim = null },
    })
      .fromTo(containerRef.value, { clipPath: CLIP_CLOSED_OPEN }, { clipPath: CLIP_OPEN, duration: 0.5, ease: 'power3.inOut' }, 0)
      .fromTo(navRef.value.children, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out', stagger: 0.06 }, 0.2)
  }
  else {
    anim = gsap.timeline({
      onComplete: () => { anim = null },
    })
      .to(navRef.value.children, { opacity: 0, duration: 0.2, ease: 'power2.in', stagger: 0.04 }, 0)
      .to(containerRef.value, { clipPath: CLIP_CLOSED_CLOSE, duration: 0.4, ease: 'power3.inOut' }, 0.05)
  }
})

onUnmounted(() => {
  anim?.kill()
})
</script>

<template>
  <div class="app-menu-panel" :class="{ 'is-open': menuOpen }">
    <div ref="containerRef" class="app-menu-panel__container">
      <div class="app-menu-panel__background" />
      <nav ref="navRef" class="app-menu-panel__nav">
        <UtilsBaseLink>
          <TextsCTAXL :color="menuTheme">
            Catalogue
          </TextsCTAXL>
        </UtilsBaseLink>
        <UtilsBaseLink>
          <TextsCTAXL :color="menuTheme">
            Services
          </TextsCTAXL>
        </UtilsBaseLink>
        <UtilsBaseLink>
          <TextsCTAXL :color="menuTheme">
            Reprise
          </TextsCTAXL>
        </UtilsBaseLink>
      </nav>
    </div>
  </div>
</template>

<style lang="scss">
.app-menu-panel {
  position: absolute;
  top: calc(100% + desktop-vw(8px));
  left: 0;
  width: 100%;
  pointer-events: none;

  &.is-open {
    pointer-events: auto;
  }

  &__container {
    border-radius: 12px;
  }

  &__background {
    position: absolute;
    inset: 0;
    background: var(--c-beige-100);
    backdrop-filter: blur(12px);
  }

  &__nav {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: desktop-vw(28px) desktop-vw(26px);
    gap: desktop-vw(16px);
  }
}
</style>
