<script setup lang="ts">
import type { MenuLocation, SanityLink } from '~/queries/menu'
import gsap from 'gsap'

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
const langOpen = ref(false)
const langUnmasked = ref(false)

let anim = null
let unmaskTimeout: ReturnType<typeof setTimeout> | null = null
const LANG_CLOSE_DURATION = 450 // must match clip-path transition in MenuLangSwitcher

watch(langOpen, (open) => {
  if (unmaskTimeout) {
    clearTimeout(unmaskTimeout)
    unmaskTimeout = null
  }
  if (open) {
    langUnmasked.value = true
  }
  else {
    unmaskTimeout = setTimeout(() => {
      langUnmasked.value = false
      unmaskTimeout = null
    }, LANG_CLOSE_DURATION)
  }
})

onMounted(() => {
  gsap.set(backgroundRef.value, { scale: 0, transformOrigin: 'top center' })
  gsap.set(navRef.value.querySelectorAll('.app-menu-panel__nav-inner'), { y: '110%' })
})

watch(menuOpen, (open) => {
  anim?.kill()

  if (!open)
    langOpen.value = false

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
  if (unmaskTimeout)
    clearTimeout(unmaskTimeout)
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
      <div class="app-menu-panel__nav-mask" :class="{ 'is-unmasked': langUnmasked }">
        <div class="app-menu-panel__nav-inner app-menu-panel__nav__bottom">
          <div class="app-menu-panel__nav__bottom-locations">
            <template v-for="(loc, i) in props.locations" :key="loc.city">
              <AtomsCTASecondary :to="loc.link" :theme="panelTextColor">
                {{ loc.city }}
              </AtomsCTASecondary>
              <div v-if="i < props.locations.length - 1" class="app-menu-panel__nav__bottom-divider" :style="{ background: panelTextColor }" />
            </template>
          </div>
          <AppMenuLangSwitcher v-model:open="langOpen" :theme="panelTextColor" />
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

  @include mobile {
    top: calc(100% + mobile-vw(8px));
  }

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
    overflow: hidden;

    @include mobile {
      padding: mobile-vw(22px) mobile-vw(20px);
      gap: mobile-vw(20px);
    }
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  &__nav-mask {
    overflow: hidden;

    &.is-unmasked {
      overflow: visible;
    }
  }

  &__nav-inner {
    display: block;
    will-change: transform;
    transition: opacity 0.35s var(--ease-out-cubic);
    padding: desktop-vw(10px) 0;

    @include mobile {
      padding: mobile-vw(5px) 0;
    }
  }

  &__nav__bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: desktop-vw(12px);
    padding: 0px;

    @include mobile {
      gap: mobile-vw(12px);
    }
  }

  &__nav__bottom-locations {
    display: flex;
    align-items: center;
    gap: desktop-vw(12px);

    @include mobile {
      gap: mobile-vw(12px);
    }
  }

  &__nav__bottom-divider {
    width: desktop-vw(28px);
    height: 2px;

    @include mobile {
      width: mobile-vw(24px);
    }
  }

  @include hover {
    &__items:has(.app-menu-panel__nav-inner:hover) {
      .app-menu-panel__nav-inner {
        opacity: 0.2;

        &:hover {
          opacity: 1;
        }
      }
    }
  }

  // Underline pseudo-element rendered on every menu link (invisible by default)
  // so swaps animate on both sides instead of vanishing instantly.
  &__nav-inner .CTA-TEXT-XL {
    position: relative;
    display: inline-block;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 0.1em;
      background: currentColor;
      transform: scaleX(0);
      transform-origin: left center;
      transition: transform 0.4s var(--ease-out-cubic);
    }
  }

  // Active link, only when the panel is open
  &.is-open &__nav-inner:has(.router-link-exact-active) .CTA-TEXT-XL::after {
    transform: scaleX(1);
    transition-delay: 0.55s; // wait for stagger reveal on initial open; also sequences after old underline collapses on page swap
  }
}
</style>
