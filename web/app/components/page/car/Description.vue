<script setup lang="ts">
import { TextsP3 } from '#components'
import { h } from 'vue'

defineProps<{ description: any[] }>()

const expanded = ref(false)

const descriptionComponents = {
  block: {
    normal: (_: any, { slots }: any) => h(TextsP3, { tag: 'p', color: 'black-100' }, slots.default),
  },
  marks: {
    strong: (_: any, { slots }: any) => h('strong', {}, slots.default?.()),
    em: (_: any, { slots }: any) => h('em', {}, slots.default?.()),
  },
}
</script>

<template>
  <div class="car-description">
    <div
      class="car-description__body"
      :class="{ 'car-description__body--expanded': expanded }"
    >
      <SanityContent :value="description" :components="descriptionComponents" />
    </div>
    <button
      type="button"
      class="car-description__toggle"
      @click="expanded = !expanded"
    >
      <TextsP1>{{ expanded ? 'Lire moins' : 'Lire la suite' }}</TextsP1>
    </button>
  </div>
</template>

<style lang="scss">
.car-description {
  display: flex;
  flex-direction: column;
  gap: desktop-vw(24px);
  align-items: flex-start;

  @include mobile {
    gap: mobile-vw(16px);
  }

  &__body {
    > * + * {
      margin-top: desktop-vw(16px);

      @include mobile {
        margin-top: mobile-vw(12px);
      }
    }

    &:not(&--expanded) > * + * {
      display: none;
    }
  }

  &__toggle {
    background: var(--c-black-10);
    border: none;
    cursor: pointer;
    padding: desktop-vw(18px) desktop-vw(30px);
    border-radius: 4px;
    transition: background 0.2s ease;

    @include hover {
      &:hover {
        background: var(--c-black-20);
      }
    }

    @include mobile {
      padding: mobile-vw(14px) mobile-vw(24px);
    }
  }
}
</style>
