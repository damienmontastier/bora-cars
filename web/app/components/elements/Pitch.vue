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
        Un conseiller <br> vous répond sous 24h
      </TextsP2>

      <AtomsCTA theme="orange">
        Contacter un conseiller
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
    width: 90%;
    align-self: flex-start;

    .P2,
    .H2 {
      display: inline;
    }

    .P2 {
      margin-right: desktop-vw(16px);
    }
  }

  &__bottom {
    display: flex;
    flex-direction: column;
    align-self: flex-end;
    gap: desktop-vw(24px);
    width: 22.5%;

    .app-atom-cta {
      align-self: flex-end;
    }

    .P2 {
      width: 65%;
    }
  }
}
</style>
