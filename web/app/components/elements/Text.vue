<script setup lang="ts">
import { getPortableTextComponents } from '~/utils/portableText'

interface Props {
  eyebrow?: string
  body?: any[]
}

const props = defineProps<Props>()

const settings = useSettings()
const portableTextComponents = computed(() => getPortableTextComponents({
  color: 'black-100',
  eyebrow: props.eyebrow,
  eyebrowClass: 'app-elements-text__eyebrow',
}))
</script>

<template>
  <section class="app-elements-text">
    <div class="app-elements-text__content">
      <div class="app-elements-text__top">
        <template v-if="body?.length">
          <SanityContent :value="body" :components="portableTextComponents" />
        </template>
        <TextsP2 v-else-if="eyebrow" :selectable="false" class="app-elements-text__eyebrow">
          {{ eyebrow }}
        </TextsP2>
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

  @include mobile {
    padding: mobile-vw(25px) mobile-vw(8px);
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: desktop-vw(32px);
    width: 100%;

    @include mobile {
      gap: mobile-vw(40px);
    }
  }

  &__top {
    width: 70%;

    @include mobile {
      width: 100%;
    }

    > * + * {
      margin-top: desktop-vw(32px);

      @include mobile {
        margin-top: mobile-vw(24px);
      }
    }
  }

  &__eyebrow {
    margin-right: desktop-vw(16px);

    @include mobile {
      display: block;
      margin-right: 0;
      margin-bottom: mobile-vw(8px);
    }
  }
}
</style>
