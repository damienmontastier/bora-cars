<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'

interface Option {
  value: string
  label: string
}

const props = withDefaults(defineProps<{
  modelValue: string
  options: Option[]
  label?: string
  placeholder?: string
  // `stacked` (défaut) : libellé empilé sur fond beige (formulaires, ex. Pricing).
  // `inline` : pilule bordée qui « hug » son contenu (barre de filtres catalogue).
  variant?: 'stacked' | 'inline'
  // Ancrage du menu sur MOBILE en variante inline : `left` (déborde vers la
  // droite, défaut — pour le 1ᵉʳ select) / `right` (déborde vers la gauche — pour
  // le dernier select de la barre). Sans effet sur desktop (toujours à droite).
  align?: 'left' | 'right'
}>(), {
  label: undefined,
  placeholder: undefined,
  variant: 'stacked',
  align: 'left',
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

const isOpen = ref(false)
const activeIndex = ref(-1)

const selectedIndex = computed(() =>
  props.options.findIndex(o => o.value === props.modelValue),
)

const displayValue = computed(() => {
  // Valeur vide (filtre non sélectionné) → on affiche le placeholder = nom du champ.
  if (props.modelValue === '' && props.placeholder)
    return props.placeholder
  const found = props.options.find(o => o.value === props.modelValue)
  return found?.label ?? props.placeholder ?? ''
})

// État « actif » (uniquement en variante inline) : un filtre est sélectionné.
const isActive = computed(() => props.variant === 'inline' && props.modelValue !== '')

function open() {
  if (isOpen.value)
    return
  isOpen.value = true
  activeIndex.value = selectedIndex.value >= 0 ? selectedIndex.value : 0
}

function close() {
  if (!isOpen.value)
    return
  isOpen.value = false
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
  <div ref="rootRef" class="atoms-select" :class="[`atoms-select--${variant}`, { 'atoms-select--align-right': align === 'right' }]">
    <button
      :id="triggerId"
      ref="triggerRef"
      type="button"
      class="atoms-select__trigger"
      :class="{ 'atoms-select__trigger--open': isOpen, 'atoms-select__trigger--active': isActive }"
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
      class="atoms-select__listbox"
      :class="{ 'atoms-select__listbox--open': isOpen }"
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
        :style="{ '--i': i }"
        role="option"
        :aria-selected="option.value === modelValue"
        class="atoms-select__option"
        :class="{
          'atoms-select__option--active': i === activeIndex,
          'atoms-select__option--selected': option.value === modelValue,
        }"
        @click="selectOption(option.value)"
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
    padding: desktop-vw(22px) desktop-vw(28px);
    cursor: pointer;
    color: var(--c-black-100);
    opacity: 0;
    transform: translateY(-8px);
    transition:
      background 0.15s ease,
      opacity 0.2s ease-in,
      transform 0.2s ease-in;

    &--selected::before {
      content: '';
      position: absolute;
      left: desktop-vw(12px);
      top: 50%;
      width: desktop-vw(6px);
      height: desktop-vw(6px);
      border-radius: 50%;
      background: var(--c-orange, var(--c-black-100));
      transform: translateY(-50%);

      @include mobile {
        left: mobile-vw(8px);
        width: mobile-vw(5px);
        height: mobile-vw(5px);
      }
    }

    &:hover,
    &--active {
      background: var(--c-beige-60);
    }

    @include mobile {
      padding: mobile-vw(10px) mobile-vw(20px);
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

  // Variante « pilule » bordée pour la barre de filtres (Figma catalogue).
  &--inline {
    width: auto;

    .atoms-select__trigger {
      justify-content: center;
      gap: desktop-vw(12px);
      height: desktop-vw(60px);
      padding: desktop-vw(18px) desktop-vw(30px);
      background: transparent;
      border: 1px solid var(--c-black-5);

      @include hover {
        &:hover {
          background: var(--c-black-5);
        }
      }

      @include mobile {
        height: mobile-vw(52px);
        padding: mobile-vw(14px) mobile-vw(24px);
        gap: mobile-vw(10px);
      }
    }

    // Filtre sélectionné : bordure pleine pour le distinguer.
    .atoms-select__trigger--active {
      border-color: var(--c-black-100);
    }

    .atoms-select__trigger-content {
      flex: 0 0 auto;
      white-space: nowrap;
    }

    // Desktop : le groupe de filtres est aligné à droite → on ancre le menu sur
    // le bord DROIT de la pilule (déborde vers la gauche, jamais hors écran).
    .atoms-select__listbox {
      left: auto;
      right: 0;
      min-width: 100%;
      width: max-content;
      max-width: desktop-vw(360px);

      @include mobile {
        // Mobile : le groupe part de la GAUCHE → ancrage à gauche par défaut
        // (déborde vers la droite) pour que le 1ᵉʳ select reste dans le viewport.
        left: 0;
        right: auto;
        max-width: mobile-vw(280px);
      }
    }

    // Dernier select de la barre : ancré à droite aussi sur mobile, sinon il
    // déborderait à droite du viewport.
    &.atoms-select--align-right .atoms-select__listbox {
      @include mobile {
        left: auto;
        right: 0;
      }
    }
  }
}
</style>
