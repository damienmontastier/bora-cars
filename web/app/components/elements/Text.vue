<script setup lang="ts">
import { getPortableTextComponents } from '~/utils/portableText'

interface Props {
  eyebrow?: string
  body?: any[]
}

defineProps<Props>()

const settings = useSettings()
const portableTextComponents = getPortableTextComponents()
</script>

<template>
  <section class="app-elements-text">
    <div class="app-elements-text__content">
      <div class="app-elements-text__top">
        <TextsP2 v-if="eyebrow" :selectable="false" class="app-elements-text__eyebrow">
          {{ eyebrow }}
        </TextsP2>
        <div v-if="body?.length" class="app-elements-text__body">
          <SanityContent :value="body" :components="portableTextComponents" />
        </div>
      </div>

      <AtomsCTA
        v-if="settings?.contactLink?.text"
        theme="black"
        class="app-elements-text__cta"
        :to="settings.contactLink"
      >
        {{ settings.contactLink.text }}
      </AtomsCTA>
    </div>
  </section>
</template>

<style lang="scss">
.app-elements-text {
  width: 100%;
  padding: desktop-vw(80px) desktop-vw(24px) desktop-vw(80px) desktop-vw(584px);
  background: var(--c-beige-100);

  &__content {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: desktop-vw(32px);
    width: 100%;
  }

  &__top {
    width: 70%;
  }

  &__eyebrow {
    display: inline;
    margin-right: desktop-vw(16px);
  }

  &__body {
    display: inline;

    // Inline the first block to flow with the eyebrow
    > *:first-child {
      display: inline;
    }

    // Spacing between subsequent blocks
    > * + * {
      display: block;
      margin-top: desktop-vw(32px);
    }
  }
}
</style>
