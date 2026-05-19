<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import gsap from 'gsap'

interface Option {
  value: string
  label: string
}

const props = withDefaults(defineProps<{
  modelValue: string
  options: Option[]
  label?: string
  placeholder?: string
}>(), {
  label: undefined,
  placeholder: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const uid = useId()
const triggerId = `${uid}-trigger`
const listboxId = `${uid}-listbox`
function getOptionId(i: number) {
  return `${uid}-option-${i}`
}

const rootRef = ref<HTMLDivElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const listboxRef = ref<HTMLUListElement | null>(null)

const isOpen = ref(false)
const activeIndex = ref(-1)

const selectedIndex = computed(() =>
  props.options.findIndex(o => o.value === props.modelValue),
)

const displayValue = computed(() => {
  const found = props.options.find(o => o.value === props.modelValue)
  return found?.label ?? props.placeholder ?? ''
})

let ctx: gsap.Context | undefined
let anim: gsap.core.Timeline | null = null

const HIDDEN_CLIP = 'inset(0% 0% 100% 0%)'
const VISIBLE_CLIP = 'inset(0% 0% 0% 0%)'

onMounted(() => {
  ctx = gsap.context(() => {
    gsap.set(listboxRef.value, { clipPath: HIDDEN_CLIP })
    gsap.set('.atoms-select__option', { y: -8, opacity: 0 })
  }, rootRef.value!)
})

onUnmounted(() => {
  anim?.kill()
  ctx?.revert()
})

function open() {
  if (isOpen.value)
    return
  isOpen.value = true
  activeIndex.value = selectedIndex.value >= 0 ? selectedIndex.value : 0
  ctx?.add(() => {
    anim?.kill()
    anim = gsap.timeline()
      .to(listboxRef.value, {
        clipPath: VISIBLE_CLIP,
        duration: 0.6,
        ease: 'expo.out',
      }, 0)
      .fromTo(
        '.atoms-select__option',
        { y: -8, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'expo.out', stagger: 0.035 },
        0.05,
      )
  })
}

function close() {
  if (!isOpen.value)
    return
  isOpen.value = false
  ctx?.add(() => {
    anim?.kill()
    anim = gsap.timeline()
      .to('.atoms-select__option', {
        y: -8,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        stagger: { each: 0.02, from: 'end' },
      }, 0)
      .to(listboxRef.value, {
        clipPath: HIDDEN_CLIP,
        duration: 0.35,
        ease: 'expo.in',
      }, 0.05)
  })
}

function toggle() {
  if (isOpen.value)
    close()
  else open()
}

function selectOption(value: string) {
  emit('update:modelValue', value)
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
        open()
      else
        activeIndex.value = activeIndex.value >= last ? 0 : activeIndex.value + 1
      break
    case 'ArrowUp':
      e.preventDefault()
      if (!isOpen.value)
        open()
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
        open()
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
  <div ref="rootRef" class="atoms-select">
    <button
      :id="triggerId"
      ref="triggerRef"
      type="button"
      class="atoms-select__trigger"
      :class="{ 'atoms-select__trigger--open': isOpen }"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :aria-controls="listboxId"
      :aria-activedescendant="isOpen && activeIndex >= 0 ? getOptionId(activeIndex) : undefined"
      @click="toggle"
      @keydown="onKeydown"
    >
      <div class="atoms-select__trigger-content">
        <TextsLabel v-if="label" class="atoms-select__label">
          {{ label }}
        </TextsLabel>
        <TextsP1>{{ displayValue }}</TextsP1>
      </div>
      <span class="atoms-select__icon" :class="{ 'atoms-select__icon--open': isOpen }" aria-hidden="true">
        <svg width="18" height="11" viewBox="0 0 18 11" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="m1 1 8 8 8-8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </button>

    <ul
      :id="listboxId"
      ref="listboxRef"
      class="atoms-select__listbox"
      role="listbox"
      :aria-labelledby="triggerId"
      tabindex="-1"
      :inert="!isOpen"
    >
      <li
        v-for="(option, i) in options"
        :id="getOptionId(i)"
        :key="option.value"
        :data-index="i"
        role="option"
        :aria-selected="option.value === modelValue"
        class="atoms-select__option"
        :class="{
          'atoms-select__option--active': i === activeIndex,
          'atoms-select__option--selected': option.value === modelValue,
        }"
        @click="selectOption(option.value)"
        @mousemove="activeIndex = i"
      >
        <TextsP1>{{ option.label }}</TextsP1>
      </li>
    </ul>
  </div>
</template>

<style lang="scss">
.atoms-select {
  position: relative;
  width: 100%;

  &__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background: var(--c-beige-100);
    border: none;
    border-radius: 4px;
    padding: desktop-vw(20px) desktop-vw(28px);
    cursor: pointer;
    color: var(--c-black-100);
    text-align: left;
    transition:
      background 0.2s ease,
      box-shadow 0.2s ease;

    @include hover {
      &:hover {
        background: var(--c-beige-60);
      }
    }

    &:focus-visible {
      outline: 2px solid var(--c-orange, var(--c-black-100));
      outline-offset: 2px;
    }

    @include mobile {
      padding: mobile-vw(14px) mobile-vw(20px);
    }
  }

  &__trigger-content {
    flex: 1 0 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: desktop-vw(2px);
  }

  &__label {
    color: var(--c-black-70);
  }

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: desktop-vw(24px);
    height: desktop-vw(24px);
    color: var(--c-black-100);
    transition: transform 0.35s var(--ease-out-cubic);

    svg {
      width: desktop-vw(18px);
      height: auto;
    }

    &--open {
      transform: rotate(180deg);
    }

    @include mobile {
      width: mobile-vw(20px);
      height: mobile-vw(20px);

      svg {
        width: mobile-vw(14px);
      }
    }
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
    will-change: clip-path;

    @include mobile {
      top: calc(100% + #{mobile-vw(6px)});
      padding: mobile-vw(6px) 0;
      box-shadow: 0 mobile-vw(6px) mobile-vw(24px) rgba(0, 0, 0, 0.12);
    }
  }

  &__option {
    padding: desktop-vw(12px) desktop-vw(28px);
    cursor: pointer;
    color: var(--c-black-100);
    transition: background 0.15s ease;

    &--active {
      background: var(--c-beige-60);
    }

    &--selected {
      background: var(--c-beige-100);
    }

    @include mobile {
      padding: mobile-vw(10px) mobile-vw(20px);
    }
  }
}
</style>
