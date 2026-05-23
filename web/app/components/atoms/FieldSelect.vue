<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'

interface Option {
  value: string
  label: string
}

interface Props {
  label: string
  options: Option[]
  required?: boolean
  invalid?: boolean
  errorMessage?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  invalid: false,
  errorMessage: '',
  id: undefined,
})

const model = defineModel<string>({ default: '' })

const uid = useId()
const triggerId = computed(() => props.id ?? `${uid}-trigger`)
const labelId = `${uid}-label`
const listboxId = `${uid}-listbox`
const errorId = `${uid}-error`
const showError = computed(() => props.invalid && !!props.errorMessage)

function getOptionId(i: number) {
  return `${uid}-option-${i}`
}

const rootRef = ref<HTMLDivElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)

const isOpen = ref(false)
const activeIndex = ref(-1)

const selectedIndex = computed(() =>
  props.options.findIndex(o => o.value === model.value),
)

const selectedOption = computed(() =>
  props.options.find(o => o.value === model.value) ?? null,
)

const hasValue = computed(() => !!selectedOption.value)
const displayLabel = computed(() => props.required ? `${props.label}*` : props.label)

defineExpose({ focus: () => triggerRef.value?.focus() })

function open(withActive = false) {
  if (isOpen.value)
    return
  isOpen.value = true
  activeIndex.value = withActive
    ? (selectedIndex.value >= 0 ? selectedIndex.value : 0)
    : -1
}

function close() {
  if (!isOpen.value)
    return
  isOpen.value = false
  activeIndex.value = -1
}

function toggle() {
  if (isOpen.value)
    close()
  else open(false)
}

function selectOption(value: string) {
  model.value = value
  close()
  nextTick(() => triggerRef.value?.focus())
}

onClickOutside(rootRef, () => {
  if (isOpen.value)
    close()
})

function onKeydown(e: KeyboardEvent) {
  const last = props.options.length - 1
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      if (!isOpen.value)
        open(true)
      else if (activeIndex.value < 0)
        activeIndex.value = 0
      else
        activeIndex.value = activeIndex.value >= last ? 0 : activeIndex.value + 1
      break
    case 'ArrowUp':
      e.preventDefault()
      if (!isOpen.value)
        open(true)
      else if (activeIndex.value < 0)
        activeIndex.value = last
      else
        activeIndex.value = activeIndex.value <= 0 ? last : activeIndex.value - 1
      break
    case 'Home':
      if (isOpen.value) {
        e.preventDefault()
        activeIndex.value = 0
      }
      break
    case 'End':
      if (isOpen.value) {
        e.preventDefault()
        activeIndex.value = last
      }
      break
    case 'Enter':
    case ' ':
      e.preventDefault()
      if (isOpen.value && activeIndex.value >= 0)
        selectOption(props.options[activeIndex.value]!.value)
      else
        open(true)
      break
    case 'Escape':
      if (isOpen.value) {
        e.preventDefault()
        e.stopPropagation()
        close()
      }
      break
    case 'Tab':
      if (isOpen.value)
        close()
      break
  }
}
</script>

<template>
  <div
    ref="rootRef"
    class="app-atoms-field-select"
    :class="{
      'app-atoms-field-select--open': isOpen,
      'app-atoms-field-select--filled': hasValue,
      'app-atoms-field-select--error': invalid,
    }"
  >
    <span :id="labelId" class="app-atoms-field-select__sr-label">{{ displayLabel }}</span>

    <button
      :id="triggerId"
      ref="triggerRef"
      type="button"
      class="app-atoms-field-select__trigger"
      role="combobox"
      :aria-labelledby="labelId"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :aria-controls="listboxId"
      :aria-required="required || undefined"
      :aria-activedescendant="isOpen && activeIndex >= 0 ? getOptionId(activeIndex) : undefined"
      :aria-invalid="invalid"
      :aria-describedby="showError ? errorId : undefined"
      @click="toggle"
      @keydown="onKeydown"
    >
      <span class="app-atoms-field-select__value P1 regular-text">{{ selectedOption?.label || displayLabel }}</span>
      <span class="app-atoms-field-select__icon" aria-hidden="true">
        <SvgIconArrow :color="invalid ? 'red' : 'black-100'" />
      </span>
    </button>

    <ul
      :id="listboxId"
      class="app-atoms-field-select__listbox"
      :class="{ 'app-atoms-field-select__listbox--open': isOpen }"
      role="listbox"
      :aria-labelledby="labelId"
      tabindex="-1"
      :inert="!isOpen"
    >
      <li
        v-for="(option, i) in options"
        :id="getOptionId(i)"
        :key="option.value"
        :data-index="i"
        :style="{ '--i': i }"
        role="option"
        :aria-selected="option.value === model"
        class="app-atoms-field-select__option P1 regular-text"
        :class="{
          'app-atoms-field-select__option--active': i === activeIndex,
          'app-atoms-field-select__option--selected': option.value === model,
        }"
        @click="selectOption(option.value)"
      >
        {{ option.label }}
      </li>
    </ul>

    <TextsP2
      v-if="showError"
      :id="errorId"
      tag="span"
      color="red"
      class="app-atoms-field-select__error"
    >
      {{ errorMessage }}
    </TextsP2>
  </div>
</template>

<style lang="scss">
.app-atoms-field-select {
  --field-border: var(--c-black-20);
  --field-value-color: var(--c-black-100);
  --field-placeholder-color: var(--c-black-70);

  position: relative;
  width: 100%;
  transition: margin-bottom 0.3s var(--ease-out-cubic);

  &--open,
  &--filled {
    --field-border: var(--c-black-100);
  }

  &--error {
    --field-border: var(--c-red);
    --field-value-color: var(--c-red);
    --field-placeholder-color: var(--c-red);
    margin-bottom: desktop-vw(30px);

    @include mobile {
      margin-bottom: mobile-vw(26px);
    }
  }

  &__sr-label {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  &__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: desktop-vw(12px);
    width: 100%;
    height: desktop-vw(80px);
    padding: desktop-vw(20px) desktop-vw(28px);
    border: 1px solid var(--field-border);
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    text-align: left;
    transition: border-color 0.25s var(--ease-out-cubic);

    &:focus-visible {
      outline: 2px solid var(--c-black-100);
      outline-offset: 2px;
    }

    @include mobile {
      height: mobile-vw(72px);
      padding: mobile-vw(16px) mobile-vw(20px);
    }
  }

  &__value {
    flex: 1 0 0;
    min-width: 0;
    color: var(--field-placeholder-color);
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &--filled &__value {
    color: var(--field-value-color);
  }

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: desktop-vw(24px);
    height: desktop-vw(24px);
    transform: rotate(-90deg);
    transition: transform 0.35s var(--ease-out-cubic);
    flex-shrink: 0;

    .svg-logo {
      width: desktop-vw(18px);
      height: auto;
    }

    @include mobile {
      width: mobile-vw(20px);
      height: mobile-vw(20px);

      .svg-logo {
        width: mobile-vw(14px);
      }
    }
  }

  &--open &__icon {
    transform: rotate(90deg);
  }

  &__listbox {
    position: absolute;
    top: calc(100% + #{desktop-vw(6px)});
    left: 0;
    right: 0;
    z-index: 20;
    background: var(--c-white);
    border-radius: 4px;
    list-style: none;
    margin: 0;
    padding: desktop-vw(8px) 0;
    box-shadow: 0 desktop-vw(8px) desktop-vw(32px) rgba(0, 0, 0, 0.12);
    clip-path: inset(0% 0% 100% 0%);
    transition: clip-path 0.35s cubic-bezier(0.7, 0, 0.84, 0);
    will-change: clip-path;

    &--open {
      clip-path: inset(0% 0% 0% 0%);
      transition: clip-path 0.55s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @include mobile {
      top: calc(100% + #{mobile-vw(6px)});
      padding: mobile-vw(6px) 0;
      box-shadow: 0 mobile-vw(6px) mobile-vw(24px) rgba(0, 0, 0, 0.12);
    }
  }

  &__option {
    position: relative;
    padding: desktop-vw(20px) desktop-vw(28px);
    cursor: pointer;
    color: var(--c-black-100);
    opacity: 0;
    transform: translateY(-8px);
    transition:
      background 0.15s ease,
      opacity 0.2s ease-in,
      transform 0.2s ease-in;

    &:hover,
    &--active {
      background: var(--c-beige-60);
    }

    &--selected {
      background: var(--c-beige-40);
    }

    @include mobile {
      padding: mobile-vw(14px) mobile-vw(20px);
    }
  }

  &__listbox--open &__option {
    opacity: 1;
    transform: translateY(0);
    transition:
      background 0.15s ease 0s,
      opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1) calc(0.05s + var(--i, 0) * 0.035s),
      transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) calc(0.05s + var(--i, 0) * 0.035s);
  }

  &__error {
    position: absolute;
    top: calc(100% + #{desktop-vw(8px)});
    left: desktop-vw(4px);

    @include mobile {
      top: calc(100% + #{mobile-vw(6px)});
      left: mobile-vw(4px);
    }
  }
}
</style>
