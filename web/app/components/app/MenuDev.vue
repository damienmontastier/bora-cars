<script setup>
const props = defineProps({

})

// const { to, color } =  toRefs(props)

onMounted(() => {

})
</script>

<template>
  <div class="app-menu-dev">
    <TextsP1 color="beige-100" class="app-menu-dev__heading">
      NUXT4 — BORA CARS
    </TextsP1>

    <ul class="app-menu-dev__links">
      <AppMenuLink to="/">
        Home
      </AppMenuLink>
    </ul>
  </div>
</template>

<style lang="scss">
.app-menu-dev {
  z-index: 10;
  position: fixed;
  top: 0;
  padding: desktop-vw(35px) var(--layout-margin) desktop-vw(35px) var(--layout-margin);
  display: flex;
  flex-direction: column;

  @include mobile {
    padding: mobile-vw(20px) mobile-vw(35px) mobile-vw(20px) mobile-vw(35px);
  }

  &__heading {
    font-size: desktop-vw(32px);
    line-height: desktop-vw(32px);
  }

  &__links {
    flex-direction: column;
    display: flex;
    gap: 10px;
    margin-top: 15px;
    margin-left: 15px;
  }
}
</style>
