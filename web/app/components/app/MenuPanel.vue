<script setup lang="ts">
import gsap from 'gsap'
import type { SanityLink, MenuLocation } from '~/queries/menu'

interface Props {
  links: SanityLink[]
  locations: MenuLocation[]
}

const props = defineProps<Props>()

const appStore = useAppStore()
const { menuOpen, menuTheme } = toRefs(appStore)

const panelTextColor = computed(() => menuTheme.value === 'white' ? 'black' : menuTheme.value)

const backgroundRef = ref(null)
const navRef = ref(null)
const itemsRef = ref(null)

let anim = null

onMounted(() => {
  gsap.set(backgroundRef.value, { scale: 0, transformOrigin: 'top center' })
  gsap.set(navRef.value.querySelectorAll('.app-menu-panel__nav-inner'), { y: '110%' })
})

watch(menuOpen, (open) => {
  anim?.kill()

  const items = navRef.value.querySelectorAll('.app-menu-panel__nav-inner')

  if (open) {
    anim = gsap.timeline({
      onComplete: () => { anim = null },
    })
      .fromTo(backgroundRef.value, { scale: 0 }, { scale: 1, duration: 0.5, ease: 'power3.inOut', transformOrigin: 'top center' }, 0)
      .fromTo(items, { y: '110%' }, { y: '0%', duration: 0.35, ease: 'power3.out', stagger: 0.06 }, 0.4)
  }
  else {
    anim = gsap.timeline({
      onComplete: () => { anim = null },
    })
      .to(items, { y: '110%', duration: 0.3, ease: 'power3.in', stagger: { each: 0.04, from: 'end' } }, 0)
      .to(backgroundRef.value, { scale: 0, duration: 0.4, ease: 'power3.inOut', transformOrigin: 'top center' }, 0.4)
  }
})

onUnmounted(() => {
  anim?.kill()
})
</script>

<template>
  <div class="app-menu-panel" :class="{ 'is-open': menuOpen }">
    <div ref="backgroundRef" class="app-menu-panel__background" />
    <div ref="navRef" class="app-menu-panel__nav">
      <div ref="itemsRef" class="app-menu-panel__items">
        <div v-for="link in props.links" :key="link._key" class="app-menu-panel__nav-mask">
          <div class="app-menu-panel__nav-inner">
            <UtilsBaseLink :to="link">
              <TextsCTAXL :color="panelTextColor">
                {{ link.text }}
              </TextsCTAXL>
            </UtilsBaseLink>
          </div>
        </div>
      </div>
      <div v-if="props.locations.length" class="app-menu-panel__nav-mask">
        <div class="app-menu-panel__nav-inner app-menu-panel__nav__bottom">
          <template v-for="(loc, i) in props.locations" :key="loc.city">
            <AtomsCTASecondary :theme="panelTextColor">
              {{ loc.city }}
            </AtomsCTASecondary>
            <div v-if="i < props.locations.length - 1" class="app-menu-panel__nav__bottom-divider" :style="{ background: panelTextColor }" />
          </template>
        </div>
      </div>
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

  &__background {
    position: absolute;
    inset: 0;
    background: var(--c-beige-100);
    backdrop-filter: blur(12px);
    border-radius: 12px;
    transform-origin: top center;
    will-change: transform;
  }

  &__nav {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: desktop-vw(28px) desktop-vw(26px);
    gap: desktop-vw(32px);
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  &__nav-mask {
    overflow: hidden;
  }

  &__nav-inner {
    display: block;
    will-change: transform;
    transition: opacity 0.35s var(--ease-out-cubic);
    padding: desktop-vw(10px) 0;
  }

  &__nav__bottom {
    display: flex;
    align-items: center;
    gap: desktop-vw(12px);
  }

  &__nav__bottom-divider {
    width: desktop-vw(28px);
    height: 2px;
  }

  &__items:has(.app-menu-panel__nav-inner:hover) {
    .app-menu-panel__nav-inner {
      opacity: 0.2;

      &:hover {
        opacity: 1;
      }
    }
  }
}
</style>
