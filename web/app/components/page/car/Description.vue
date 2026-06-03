<script setup lang="ts">
import { TextsP3 } from '#components'
import { h } from 'vue'

const props = defineProps<{ description: any[] }>()

const { t } = useI18n()
const expanded = ref(false)

const firstBlock = computed(() => props.description.slice(0, 1))
const restBlocks = computed(() => props.description.slice(1))
const hasMore = computed(() => restBlocks.value.length > 0)

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
    <div class="car-description__lead">
      <SanityContent :value="firstBlock" :components="descriptionComponents" />
    </div>

    <div
      v-if="hasMore"
      class="car-description__more"
      :class="{ 'car-description__more--open': expanded }"
      :aria-hidden="!expanded"
    >
      <div class="car-description__more-inner">
        <SanityContent :value="restBlocks" :components="descriptionComponents" />
      </div>
    </div>

    <button
      v-if="hasMore"
      type="button"
      class="car-description__toggle"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      <TextsP1>{{ expanded ? t('car.description.readLess') : t('car.description.readMore') }}</TextsP1>
    </button>
  </div>
</template>

<style lang="scss">
$desc-stagger: 0.06s;

.car-description {
  --desc-ease: var(--ease-out-quint);
  --desc-y-duration: 750ms;
  --desc-opacity-duration: 450ms;
  --desc-clip-duration: 550ms;

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  &__lead > p + p,
  &__more-inner > p + p {
    margin-top: desktop-vw(16px);

    @include mobile {
      margin-top: mobile-vw(12px);
    }
  }

  &__more {
    width: 100%;
    display: grid;
    grid-template-rows: 0fr;
    margin-top: 0;
    transition:
      grid-template-rows var(--desc-y-duration) var(--desc-ease),
      margin-top var(--desc-y-duration) var(--desc-ease);

    &--open {
      grid-template-rows: 1fr;
      margin-top: desktop-vw(24px);

      @include mobile {
        margin-top: mobile-vw(16px);
      }
    }
  }

  &__more-inner {
    min-height: 0;
    overflow: hidden;

    > p {
      opacity: 0;
      transform: translateY(desktop-vw(60px));
      clip-path: inset(0 0 100% 0);
      transition:
        opacity var(--desc-opacity-duration) var(--desc-ease),
        transform var(--desc-y-duration) var(--desc-ease),
        clip-path var(--desc-clip-duration) var(--desc-ease);

      @include mobile {
        transform: translateY(mobile-vw(40px));
      }
    }
  }

  &__more--open &__more-inner > p {
    opacity: 1;
    transform: translateY(0);
    clip-path: inset(0 0 0% 0);
  }

  // Stagger uniquement à l'ouverture : opacity démarre après le y
  @for $i from 1 through 10 {
    $delay: ($i - 1) * $desc-stagger;
    &__more--open &__more-inner > p:nth-child(#{$i}) {
      transition-delay:
        #{$delay + 0.15s},
        #{$delay},
        #{$delay + 0.08s};
    }
  }

  &__toggle {
    background: var(--c-black-10);
    border: none;
    cursor: pointer;
    padding: desktop-vw(18px) desktop-vw(30px);
    border-radius: 4px;
    transition: background 0.2s ease;
    margin-top: desktop-vw(24px);

    @include hover {
      &:hover {
        background: var(--c-black-20);
      }
    }

    @include mobile {
      padding: mobile-vw(14px) mobile-vw(24px);
      margin-top: mobile-vw(16px);
    }
  }
}
</style>
