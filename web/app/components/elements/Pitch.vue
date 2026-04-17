<script setup lang="ts">
interface PitchData {
  eyebrow?: string
  heading?: string
  subtext?: string
}

interface Props { data: PitchData | null }

defineProps<Props>()

const settings = useSettings()
const headingRef = useTemplateRef<{ $el: HTMLElement }>('headingRef')

useSplitTextAnimation(() => headingRef.value?.$el, {
  style: 'fade',
  to: { duration: 0.6, stagger: 0.025 },
  scrollTrigger: { start: 'top 85%', scrub: true, toggleActions: 'play resume reset resume' },
})
</script>

<template>
  <div class="app-elements-pitch">
    <div class="app-elements-pitch__top">
      <TextsP2 v-if="data?.eyebrow" color="orange-100">
        {{ data.eyebrow }}
      </TextsP2>
      <TextsH2 v-if="data?.heading" ref="headingRef" color="orange-100">
        {{ data.heading }}
      </TextsH2>
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
.char {
  will-change: transform;
}

.app-elements-pitch {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  position: relative;
  padding: desktop-vw(40px) desktop-vw(24px);
  gap: desktop-vw(40px);

  &__top {
    width: 60%;
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
      width: 75%;
    }
  }
}
</style>
