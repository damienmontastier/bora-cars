<script setup lang="ts">
interface Props {
  eyebrow?: string
  heading?: string
}

defineProps<Props>()
</script>

<template>
  <section class="app-elements-title">
    <div class="app-elements-title__inner">
      <TextsH2 v-if="heading" tag="p" :selectable="false" class="app-elements-title__heading">
        <TextsP2 v-if="eyebrow" tag="span" :selectable="false" class="app-elements-title__eyebrow">
          {{ eyebrow }}
        </TextsP2>
        {{ heading }}
      </TextsH2>
      <TextsP2 v-else-if="eyebrow" :selectable="false" class="app-elements-title__eyebrow">
        {{ eyebrow }}
      </TextsP2>
    </div>
  </section>
</template>

<style lang="scss">
.app-elements-title {
  width: 100%;
  padding: desktop-vw(40px) desktop-vw(24px);
  background: var(--c-beige-100);

  @include mobile {
    padding: mobile-vw(24px) mobile-vw(16px);
  }

  &__inner {
    width: 65%;

    @include mobile {
      width: 100%;
    }
  }

  &__heading {
    > .app-text {
      display: block;
      width: 100%;
    }

    .app-elements-title__eyebrow {
      margin-right: desktop-vw(16px);

      @include mobile {
        display: block;
        margin-right: 0;
        margin-bottom: mobile-vw(8px);
      }
    }
  }
}
</style>
