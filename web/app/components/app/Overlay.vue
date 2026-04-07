<script lang="ts" setup>
const appStore = useAppStore()
const { menuOpen } = toRefs(appStore)
</script>

<template>
  <div class="app-overlay" :class="{ 'is-active': menuOpen }">
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
    background-color: var(--c-black-20);
    opacity: 0;
    transition: opacity 0.3s var(--ease-out-cubic);
    pointer-events: auto;
  }

  &.is-active {
    .app-overlay__background {
      opacity: 1;
    }
  }
}
</style>
