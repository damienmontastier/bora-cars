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
      <TextsP2 v-if="eyebrow" :selectable="false" class="app-elements-title__eyebrow">
        {{ eyebrow }}
      </TextsP2>
      <TextsH2 v-if="heading" tag="p" :selectable="false" class="app-elements-title__heading">
        {{ heading }}
      </TextsH2>
    </div>
  </section>
</template>

<style lang="scss">
.app-elements-title {
  width: 100%;
  padding: desktop-vw(40px) desktop-vw(24px);
  background: var(--c-beige-100);

  &__inner {
    width: 65%;
  }

  &__eyebrow {
    display: inline;
    margin-right: desktop-vw(16px);
  }

  &__heading {
    display: inline;
  }
}
</style>
