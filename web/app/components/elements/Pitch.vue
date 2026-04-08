<script setup lang="ts">
interface PitchLink {
  type: 'external' | 'email' | 'phone' | 'internal'
  text?: string
  url?: string
  email?: string
  phone?: string
}

interface PitchData {
  eyebrow?: string
  heading?: string
  subtext?: string
  cta?: PitchLink
}

interface Props { data: PitchData | null }

defineProps<Props>()
</script>

<template>
  <div class="app-elements-pitch">
    <div class="app-elements-pitch__top">
      <TextsP2 v-if="data?.eyebrow" color="orange-100">
        {{ data.eyebrow }}
      </TextsP2>
      <TextsH2 v-if="data?.heading" color="orange-100">
        {{ data.heading }}
      </TextsH2>
    </div>

    <div class="app-elements-pitch__bottom">
      <TextsP2 v-if="data?.subtext" color="orange-100">
        {{ data.subtext }}
      </TextsP2>

      <AtomsCTA v-if="data?.cta?.text" theme="orange" :to="data.cta">
        {{ data.cta.text }}
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
