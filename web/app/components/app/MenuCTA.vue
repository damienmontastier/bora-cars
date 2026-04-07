<script setup>
const appStore = useAppStore()
const { menuTheme, menuOpen } = toRefs(appStore)

function onClick() {
  menuOpen.value = !menuOpen.value
}

const themeColors = computed(() => ({
  white: { icon: 'beige-100', text: 'beige-100' },
  orange: { icon: 'orange-100', text: 'orange-100' },
  black: { icon: 'black-100', text: 'black-100' },
}[menuTheme.value]))
</script>

<template>
  <UtilsBaseLink class="app-menu-cta" :class="`app-menu-cta--${menuTheme}`" @click="onClick">
    <div class="app-menu-cta__inner">
      <SvgIconBurger class="app-menu-cta__icon" :color="themeColors.icon" :open="menuOpen" />

      <div class="app-menu-cta__label">
        <TextsCTA class="app-menu-cta__label-sizer" tag="div" aria-hidden="true">
          Close
        </TextsCTA>
        <Transition name="label">
          <TextsCTA v-if="!menuOpen" key="menu" tag="div" :color="themeColors.text">
            Menu
          </TextsCTA>
          <TextsCTA v-else key="close" tag="div" :color="themeColors.text">
            Close
          </TextsCTA>
        </Transition>
      </div>
    </div>
  </UtilsBaseLink>
</template>

<style lang="scss">
.app-menu-cta {
  padding: desktop-vw(16px);
  display: flex;
  flex-direction: row;
  border-radius: 4px;
  border: 1px solid var(--c-orange-20);
  transition: border-color 0.25s var(--ease-out-cubic);

  &--white {
    border-color: var(--c-beige-20);
  }

  &--orange {
    border-color: var(--c-orange-20);
  }

  &--black {
    border-color: var(--c-black-20);
  }

  &:hover {
    &.app-menu-cta--white {
      border-color: var(--c-beige-100);
    }

    &.app-menu-cta--orange {
      border-color: var(--c-orange-100);
    }

    &.app-menu-cta--black {
      border-color: var(--c-black-100);
    }
  }

  &__inner {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: desktop-vw(8px);
  }

  &__icon {
    width: desktop-vw(40px);
    height: 100%;
    aspect-ratio: 40 / 28;
  }

  &__label {
    overflow: hidden;
    position: relative;
    white-space: nowrap;

    &-sizer {
      visibility: hidden;
      pointer-events: none;
      user-select: none;
      height: 0;
      overflow: hidden;
    }
  }
}

.label-enter-active,
.label-leave-active {
  transition:
    transform 0.3s var(--ease-out-cubic),
    opacity 0.3s var(--ease-out-cubic);
}

.label-leave-active {
  position: absolute;
  top: 0;
  left: 0;
}

.label-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.label-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
