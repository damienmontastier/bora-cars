<script setup lang="ts">
import { onClickOutside, onKeyStroke } from '@vueuse/core'

interface Props {
  theme?: 'white' | 'black' | 'orange'
  variant?: boolean
  footerTheme?: 'white' | 'black' | 'orange'
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'orange',
  variant: false,
  footerTheme: 'orange',
})

const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const router = useRouter()

const appStore = useAppStore()
const { menuOpen } = toRefs(appStore)

const rootRef = ref<HTMLDivElement | null>(null)
const isOpen = defineModel<boolean>('open', { default: false })

const themeTextColor = computed(() => ({
  white: 'beige-100',
  black: 'black-100',
  orange: 'orange-100',
}[props.theme]))

// In footer variant, the dropdown background contrasts with the footer bg.
// Open-state text color must contrast with that background.
const dropdownBg = computed(() => ({
  white: 'orange',
  black: 'beige-100',
  orange: 'black-100',
}[props.footerTheme]))

const openTextColor = computed(() => ({
  white: 'beige-100',
  black: 'black-100',
  orange: 'beige-100',
}[props.footerTheme]))

const triggerTextColor = computed(() =>
  isOpen.value ? (props.variant ? openTextColor.value : 'beige-100') : themeTextColor.value,
)

const itemTextColor = computed(() => props.variant ? openTextColor.value : 'beige-100')

const langBgStyle = computed(() =>
  props.variant ? { '--lang-bg': `var(--c-${dropdownBg.value})` } : undefined,
)

const otherLocales = computed(() =>
  locales.value.filter(l => l.code !== locale.value),
)

function toggle() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

const analytics = useAnalytics()

function selectLocale(code: string, e: MouseEvent) {
  // let the browser handle modifier-key clicks (open in new tab, etc.)
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0)
    return

  e.preventDefault()
  if (code === locale.value) {
    close()
    return
  }

  analytics.trackLanguageSwitch({ from: locale.value, to: code })

  const path = switchLocalePath(code)
  close()
  menuOpen.value = false
  // Navigate in parallel with menu close — translation stability is handled
  // in app.vue (menuParams.lang only flushes when menu is fully closed).
  router.push(path)
}

onClickOutside(rootRef, close)

onKeyStroke('Escape', () => {
  if (isOpen.value)
    close()
}, { dedupe: true })
</script>

<template>
  <div ref="rootRef" class="app-menu-lang" :class="[{ 'is-open': isOpen, '--variant-footer': variant }, `--theme-${theme}`]" :style="langBgStyle">
    <ul
      class="app-menu-lang__list"
      :inert="!isOpen"
    >
      <li
        v-for="(loc, i) in otherLocales"
        :key="loc.code"
        class="app-menu-lang__item"
        :style="{ '--i': i }"
      >
        <a
          :href="switchLocalePath(loc.code)"
          class="app-menu-lang__link"
          @click="selectLocale(loc.code, $event)"
        >
          <TextsCTA :color="itemTextColor">
            {{ loc.code.toUpperCase() }}
          </TextsCTA>
        </a>
      </li>
    </ul>

    <button
      type="button"
      class="app-menu-lang__trigger"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <TextsCTA :color="triggerTextColor">
        {{ locale.toUpperCase() }}
      </TextsCTA>
      <span class="app-menu-lang__icon" :class="{ 'is-open': isOpen }" aria-hidden="true">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1l4 4 4-4" :stroke="`var(--c-${triggerTextColor})`" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </button>
  </div>
</template>

<style lang="scss">
.app-menu-lang {
  position: relative;
  display: inline-flex;

  &__trigger {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: desktop-vw(6px);
    padding: desktop-vw(8px) desktop-vw(14px);
    border-radius: desktop-vw(8px);
    background: transparent;
    border: none;
    cursor: pointer;
    transition:
      background 0.35s var(--ease-out-cubic),
      border-radius 0.35s var(--ease-out-cubic);

    @include mobile {
      gap: mobile-vw(6px);
      padding: mobile-vw(6px) mobile-vw(12px);
      border-radius: mobile-vw(6px);
    }
  }

  &.is-open &__trigger {
    background: var(--c-orange);
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.35s var(--ease-out-cubic);

    svg {
      width: desktop-vw(10px);
      height: auto;

      @include mobile {
        width: mobile-vw(10px);
      }
    }

    &.is-open {
      transform: rotate(180deg);
    }
  }

  &__list {
    position: absolute;
    bottom: 100%;
    right: 0;
    min-width: 100%;
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    background: var(--c-orange);
    clip-path: inset(100% 0 0 0 round #{desktop-vw(8px)} #{desktop-vw(8px)} 0 0);
    transition: clip-path 0.45s var(--ease-out-cubic);
    will-change: clip-path;

    @include mobile {
      clip-path: inset(100% 0 0 0 round #{mobile-vw(6px)} #{mobile-vw(6px)} 0 0);
    }
  }

  &.is-open &__list {
    clip-path: inset(0 0 0 0 round #{desktop-vw(8px)} #{desktop-vw(8px)} 0 0);

    @include mobile {
      clip-path: inset(0 0 0 0 round #{mobile-vw(6px)} #{mobile-vw(6px)} 0 0);
    }
  }

  &__item {
    opacity: 0;
    transform: translateY(6px);
    transition:
      opacity 0.25s var(--ease-out-cubic),
      transform 0.3s var(--ease-out-cubic);
  }

  &.is-open &__item {
    opacity: 1;
    transform: translateY(0);
    transition:
      opacity 0.4s var(--ease-out-cubic) calc(0.05s + var(--i, 0) * 0.04s),
      transform 0.4s var(--ease-out-cubic) calc(0.05s + var(--i, 0) * 0.04s);
  }

  &__link {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: desktop-vw(8px) desktop-vw(14px);
    transition: opacity 0.25s var(--ease-out-cubic);

    @include mobile {
      padding: mobile-vw(6px) mobile-vw(12px);
    }

    @include hover {
      &:hover {
        opacity: 0.7;
      }
    }
  }

  // Variant footer: opens downward, --lang-bg is set inline based on footerTheme
  &.--variant-footer {
    --lang-bg: var(--c-black-100);

    &.is-open .app-menu-lang__trigger {
      background: var(--lang-bg);
      border-top-left-radius: desktop-vw(8px);
      border-top-right-radius: desktop-vw(8px);
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;

      @include mobile {
        border-top-left-radius: mobile-vw(6px);
        border-top-right-radius: mobile-vw(6px);
      }
    }

    .app-menu-lang__list {
      bottom: auto;
      top: 100%;
      background: var(--lang-bg);
      clip-path: inset(0 0 100% 0 round 0 0 #{desktop-vw(8px)} #{desktop-vw(8px)});

      @include mobile {
        clip-path: inset(0 0 100% 0 round 0 0 #{mobile-vw(6px)} #{mobile-vw(6px)});
      }
    }

    &.is-open .app-menu-lang__list {
      clip-path: inset(0 0 0 0 round 0 0 #{desktop-vw(8px)} #{desktop-vw(8px)});

      @include mobile {
        clip-path: inset(0 0 0 0 round 0 0 #{mobile-vw(6px)} #{mobile-vw(6px)});
      }
    }
  }
}
</style>
