<script setup lang="ts">
import type { PropType } from 'vue'
import type { TextAnimationStyle } from '~/composables/useSplitTextAnimation'

const props = defineProps({
  tag: {
    type: String,
    default: 'h2',
  },
  color: {
    type: String,
    default: 'black-100',
  },
  selectable: {
    type: Boolean,
    default: true,
  },
  animated: {
    type: Boolean,
    default: true,
  },
  animation: {
    type: String as PropType<TextAnimationStyle>,
    default: 'slide-y',
  },
  trigger: {
    type: Object as PropType<HTMLElement | null>,
    default: null,
  },
})

const mainRef = ref<HTMLElement | null>(null)
const id = useId()

const classes = computed(() => ({
  'no-selectable': !props.selectable,
}))

useSplitTextAnimation(() => (props.animated ? mainRef.value : undefined), {
  style: props.animation,
  label: 'H2',
  scrollTrigger: {
    id: `h2-${id}`,
    get trigger() { return toValue(props.trigger) ?? undefined },
  },
})

defineExpose({
  root: mainRef,
})
</script>

<template>
  <component
    :is="tag"
    ref="mainRef"
    class="H2"
    :class="classes"
    :style="{ color: `var(--c-${color})` }"
  >
    <span class="app-text" :class="{ 'app-text--will-animate': animated }" aria-hidden="true">
      <slot />
    </span>
    <span class="sr-only">
      <slot />
    </span>
  </component>
</template>

<style lang="scss">
.H2 {
  &.no-selectable {
    user-select: none;
  }

  .app-text--will-animate {
    opacity: 0;
  }

  @include mobile {
    .app-text--will-animate {
      opacity: 1;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .H2 .app-text--will-animate {
    opacity: 1;
  }
}
</style>
