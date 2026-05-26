<script lang="ts" setup>
const appStore = useAppStore()
const { menuOpen } = toRefs(appStore)
const { isOpen: cookiesOpen } = useCookies()

const isActive = computed(
  () => menuOpen.value || cookiesOpen.value,
)
</script>

<template>
  <div class="app-overlay" :class="{ 'is-active': isActive }">
    <div class="app-overlay__background" />
  </div>
</template>

<style lang="scss">
.app-overlay {
  position: fixed;
  inset: 0;
  z-index: 9;
  pointer-events: none;
  width: 100%;
  height: 100%;

  &__background {
    width: 100%;
    height: 100%;
    background-color: var(--c-black-60);
    opacity: 0;
    transition: opacity 0.3s var(--ease-out-cubic);
    pointer-events: none;
    backdrop-filter: blur(3.5px);

    @include mobile {
      background-color: var(--c-black-80);
      backdrop-filter: blur(5px);
    }
  }

  &.is-active {
    .app-overlay__background {
      opacity: 1;
      pointer-events: auto;
    }
  }
}
</style>
