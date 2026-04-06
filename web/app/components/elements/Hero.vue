<template>
  <div class="app-elements-hero">
    <div class="app-elements-hero__background-wrapper">
      <ElementsMedia class="app-elements-hero__background" />
    </div>

    <div class="app-elements-hero__content">
      <div class="app-elements-hero__top">
        <SvgLogo class="app-elements-hero__logo" />
      </div>

      <div class="app-elements-hero__middle">
        <TextsH1 color="beige-100">
          Une conciergerie sur mesure.
        </TextsH1>
        <div class="app-elements-hero__middle-content">
          <TextsP2 color="beige-100">
            Des véhicules d’exception pour des moments uniques.
          </TextsP2>

          <AtomsCTA class="app-elements-hero__cta">
            Découvrir la collection
          </AtomsCTA>
        </div>
      </div>

      <div class="app-elements-hero__bottom">
        <TextsH3 color="beige-100">
          Nous accompagnons des instants clés personnels ou professionnels, avec un niveau d’exigence où chaque détail compte.
        </TextsH3>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.app-elements-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  position: relative;

  &__background-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  &__content {
    position: relative;
    z-index: 1;
  }

  &__top {
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: desktop-vw(16px);

    .svg-logo {
      width: 100%;
      height: auto;
      aspect-ratio: 1408 / 213;
    }
  }

  &__middle {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    gap: desktop-vw(72px);
    padding: desktop-vw(24px);

    &-content {
      margin-left: auto;
      display: flex;
      flex-direction: column;
      gap: desktop-vw(24px);
    }

    .H1 {
      width: 80%;
    }
  }

  &__bottom {
    margin-top: desktop-vw(170px);
    margin-bottom: desktop-vw(105px);
    padding: desktop-vw(24px) desktop-vw(120px) desktop-vw(24px) desktop-vw(24px);
    display: flex;
    justify-content: flex-end;

    .H3 {
      width: 57.5%;
    }
  }

  &__background.app-elements-media {
    position: sticky;
    top: 0;
    width: 100%;
    height: 100vh;
  }
}
</style>
