<script setup lang="ts">
defineProps<{ equipements: string[] }>()
</script>

<template>
  <div class="car-options">
    <TextsP3 weight="bold" tag="h2" class="car-options__title">
      Options
    </TextsP3>
    <ul class="car-options__list">
      <li v-for="eq in equipements" :key="eq" class="car-options__item">
        <TextsP1>{{ eq }}</TextsP1>
      </li>
    </ul>
  </div>
</template>

<style lang="scss">
.car-options {
  display: flex;
  flex-direction: column;
  gap: desktop-vw(24px);

  @include mobile {
    gap: mobile-vw(16px);
  }

  &__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: desktop-vw(8px);

    @include mobile {
      gap: mobile-vw(6px);
    }
  }

  &__item {
    background: var(--c-black-10);
    padding: desktop-vw(16px) desktop-vw(24px);
    border-radius: desktop-vw(40px);
    color: var(--c-black-100);

    @include mobile {
      padding: mobile-vw(12px) mobile-vw(18px);
      border-radius: mobile-vw(40px);
    }
  }
}
</style>
