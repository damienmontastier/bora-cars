<script setup lang="ts">
// Custom switch matching the Figma design.
// API mirrors Nuxt UI's USwitch (v-model, disabled) so it can be swapped in later.
interface Props {
  modelValue: boolean
  disabled?: boolean
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function onToggle() {
  if (props.disabled)
    return
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <button
    type="button"
    class="app-atoms-switch"
    :class="{ 'is-active': modelValue, 'is-disabled': disabled }"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="ariaLabel"
    :disabled="disabled"
    @click="onToggle"
  >
    <span class="app-atoms-switch__track">
      <span class="app-atoms-switch__thumb" />
    </span>
  </button>
</template>

<style lang="scss">
.app-atoms-switch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;

  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &__track {
    position: relative;
    display: inline-flex;
    align-items: center;
    width: desktop-vw(72px);
    height: desktop-vw(38px);
    padding: desktop-vw(4px);
    background: var(--c-black-40);
    border-radius: desktop-vw(24px);
    transition: background 0.3s var(--ease-out-cubic);

    @include mobile {
      width: mobile-vw(56px);
      height: mobile-vw(30px);
      padding: mobile-vw(3px);
      border-radius: mobile-vw(20px);
    }
  }

  &__thumb {
    width: desktop-vw(30px);
    height: desktop-vw(30px);
    border-radius: 50%;
    background: var(--c-black-20);
    transform: translateX(0);
    transition:
      transform 0.3s var(--ease-out-cubic),
      background 0.3s var(--ease-out-cubic);

    @include mobile {
      width: mobile-vw(24px);
      height: mobile-vw(24px);
    }
  }

  &.is-active {
    .app-atoms-switch__track {
      background: var(--c-orange);
    }

    .app-atoms-switch__thumb {
      background: var(--c-beige);
      transform: translateX(desktop-vw(34px));

      @include mobile {
        transform: translateX(mobile-vw(26px));
      }
    }
  }
}
</style>
