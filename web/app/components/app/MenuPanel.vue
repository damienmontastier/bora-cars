<script setup>
import gsap from 'gsap'

const appStore = useAppStore()
const { menuOpen, menuTheme } = toRefs(appStore)

const backgroundRef = ref(null)
const navRef = ref(null)

let anim = null

watch(menuOpen, (open) => {
  anim?.kill()

  if (open) {
    anim = gsap.timeline({
      onComplete: () => { anim = null },
    })
      .fromTo(backgroundRef.value, { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: 'power3.inOut', transformOrigin: 'top center' }, 0)
      .fromTo(navRef.value.children, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', stagger: 0.06 }, 0.2)
  }
  else {
    anim = gsap.timeline({
      onComplete: () => { anim = null },
    })
      .to(navRef.value.children, { opacity: 0, y: -8, duration: 0.2, ease: 'power2.in', stagger: 0.04 }, 0)
      .to(backgroundRef.value, { scaleY: 0, duration: 0.4, ease: 'power3.inOut', transformOrigin: 'top center' }, 0.05)
  }
})

onUnmounted(() => {
  anim?.kill()
})
</script>

<template>
  <div class="app-menu-panel" :class="{ 'is-open': menuOpen }">
    <div ref="backgroundRef" class="app-menu-panel__background" />
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
</template>

<style lang="scss">
.app-menu-panel {
  position: absolute;
  top: calc(100% + desktop-vw(8px));
  left: 0;
  width: 100%;
  pointer-events: none;
  border-radius: 12px;
  overflow: hidden;

  &.is-open {
    pointer-events: auto;
  }

  &__background {
    position: absolute;
    inset: 0;
    background: var(--c-beige-100);
    backdrop-filter: blur(12px);
    transform: scaleY(0);
    transform-origin: top center;
  }

  &__nav {
    position: relative; // above background — never scaled
    display: flex;
    flex-direction: column;
    padding: desktop-vw(28px) desktop-vw(26px);
    gap: desktop-vw(16px);
  }
}
</style>
