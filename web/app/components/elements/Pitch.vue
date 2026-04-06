<template>
  <div class="app-elements-pitch">
    <div class="app-elements-pitch__top">
      <TextsP2 color="orange-100">
        (Clé en main)
      </TextsP2>
      <TextsH2 color="orange-100">
        Trouvez le véhicule qu'il vous faut, on s'occupe du reste.
      </TextsH2>
    </div>

    <div class="app-elements-pitch__bottom">
      <TextsP2 color="orange-100">
        Des véhicules d’exception pour des moments uniques.
      </TextsP2>

      <AtomsCTA>
        Découvrir la collection
      </AtomsCTA>
    </div>
  </div>
</template>

<style lang="scss">
.app-elements-pitch {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  position: relative;
  padding: desktop-vw(40px) desktop-vw(24px);
  gap: desktop-vw(40px);

  &__top {
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  &__bottom {
    display: flex;
    flex-direction: column;
    align-self: flex-end;
    gap: desktop-vw(24px);

    .app-atom-cta {
      align-self: flex-end;
    }
  }
}
</style>
