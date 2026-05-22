<script setup lang="ts">
interface PitchData {
  eyebrow?: string
  heading?: string
  subtext?: string
}

interface Props { data: PitchData | null }

defineProps<Props>()

const settings = useSettings()
</script>

<template>
  <div class="app-elements-pitch">
    <div class="app-elements-pitch__top">
      <TextsH2 v-if="data?.heading" color="orange-100">
        <TextsP2 v-if="data?.eyebrow" tag="span" color="orange-100">
          {{ data.eyebrow }}
        </TextsP2>
        {{ data.heading }}
      </TextsH2>
      <TextsP2 v-else-if="data?.eyebrow" color="orange-100">
        {{ data.eyebrow }}
      </TextsP2>
    </div>

    <div class="app-elements-pitch__bottom">
      <TextsP2 v-if="data?.subtext" color="orange-100">
        {{ data.subtext }}
      </TextsP2>

      <AtomsCTA v-if="settings?.contactLink?.text" theme="orange" :to="settings.contactLink">
        {{ settings.contactLink.text }}
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

  @include mobile {
    padding: mobile-vw(24px) mobile-vw(16px);
    gap: mobile-vw(40px);
  }

  &__top {
    width: 60%;
    align-self: flex-start;

    @include mobile {
      width: 100%;
    }

    .H2 .P2 {
      margin-right: desktop-vw(16px);

      @include mobile {
        margin-right: mobile-vw(16px);
      }
    }
  }

  &__bottom {
    display: flex;
    flex-direction: column;
    align-self: flex-end;
    gap: desktop-vw(24px);
    width: 22.5%;

    @include mobile {
      width: auto;
      gap: mobile-vw(16px);
      align-items: flex-end;
    }

    .app-atom-cta {
      align-self: flex-end;
    }

    .P2 {
      width: 75%;

      @include mobile {
        width: 60%;
        text-align: right;
      }
    }
  }
}
</style>
