<script setup>
const appStore = useAppStore()
const { menuTheme } = toRefs(appStore)
</script>

<template>
  <div class="app-menu">
    <div class="app-menu__inner">
      <SvgLogoMinimal class="app-menu__logo" :color="menuTheme" />

      <div class="app-menu__main">
        <AppMenuCTA />

        <AtomsCTA :theme="menuTheme" class="app-menu__cta">
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
}
</style>
