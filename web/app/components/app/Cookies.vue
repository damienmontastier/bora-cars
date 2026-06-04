<script setup lang="ts">
import type { CookieCategoryKey } from '~/composables/useCookies'
import { onKeyStroke } from '@vueuse/core'
import { useLenis } from 'lenis/vue'
import { COOKIE_CATEGORY_KEYS } from '~/composables/useCookies'

const {
  isOpen,
  view,
  pending,
  showBanner,
  openSettings,
  acceptAll,
  refuseAll,
  saveSelection,
  init,
} = useCookies()

const { t } = useI18n()

const lenis = useLenis()

const expanded = ref<Record<CookieCategoryKey, boolean>>({
  necessary: false,
  analytics: false,
  marketing: false,
  functional: false,
})

function toggleExpanded(key: CookieCategoryKey) {
  expanded.value[key] = !expanded.value[key]
}

function onPendingUpdate(key: CookieCategoryKey, value: boolean) {
  if (key === 'necessary')
    return
  pending.value = { ...pending.value, [key]: value }
}

// Lock scroll whenever the cookies layer is visible (banner or settings),
// mirroring the preloader: the user must make a choice before scrolling.
watch(
  isOpen,
  (open) => {
    if (open)
      lenis.value?.stop()
    else
      lenis.value?.start()
  },
)

onKeyStroke('Escape', () => {
  if (isOpen.value && view.value === 'settings')
    showBanner()
}, { dedupe: true })

// Wait for the preloader to finish before showing the cookies banner.
// Otherwise the banner pops up "behind" the preloader and the user only sees it
// once everything else has settled — feels abrupt. Gating on preloaderDone makes
// the banner animate in cleanly after the site is fully revealed.
const appStore = useAppStore()
onMounted(() => {
  if (appStore.preloaderDone) {
    init()
    return
  }
  const stop = watch(() => appStore.preloaderDone, (done) => {
    if (done) {
      init()
      stop()
    }
  })
})

onUnmounted(() => {
  lenis.value?.start()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="app-cookies-root">
      <div
        v-if="isOpen"
        class="app-cookies"
        :class="[`app-cookies--${view}`]"
        role="dialog"
        aria-modal="true"
        :aria-label="t('cookies.title')"
      >
        <!-- Dedicated overlay (above menu z-index, below banner/modal) -->
        <div class="app-cookies__overlay" />

        <Transition name="app-cookies-view" mode="out-in">
          <div v-if="view === 'banner'" key="banner" class="app-cookies__banner">
        <div class="app-cookies__banner-text">
          <TextsP3 tag="h2" color="beige-100" weight="bold">
            {{ t('cookies.title') }}
          </TextsP3>
          <TextsP1 tag="p" color="beige-100" weight="regular">
            {{ t('cookies.description') }}
          </TextsP1>
        </div>

        <div class="app-cookies__banner-actions">
          <button
            type="button"
            class="app-cookies__settings-link"
            @click="openSettings"
          >
            <TextsP1 tag="span" color="beige-100">
              {{ t('cookies.changeSettings') }}
            </TextsP1>
          </button>

          <div class="app-cookies__banner-buttons">
            <button
              type="button"
              class="app-cookies__btn app-cookies__btn--outline"
              @click="refuseAll"
            >
              <TextsCTA color="beige-100">
                {{ t('cookies.refuseAll') }}
              </TextsCTA>
            </button>
            <button
              type="button"
              class="app-cookies__btn app-cookies__btn--solid"
              @click="acceptAll"
            >
              <TextsCTA color="black-100">
                {{ t('cookies.acceptAll') }}
              </TextsCTA>
            </button>
          </div>
        </div>
      </div>

          <div v-else key="settings" class="app-cookies__modal-wrap">
        <div class="app-cookies__modal">
          <div class="app-cookies__modal-scroll">
            <div class="app-cookies__intro">
              <TextsP3 tag="h2" color="black-100" weight="bold">
                {{ t('cookies.modal.title') }}
              </TextsP3>
              <TextsP1
                tag="p"
                color="black-100"
                weight="regular"
                class="app-cookies__intro-text"
              >
                {{ t('cookies.modal.description') }}
              </TextsP1>
            </div>

            <div class="app-cookies__manage">
              <TextsP3 tag="h3" color="black-100" weight="bold">
                {{ t('cookies.modal.managePreferences') }}
              </TextsP3>

              <ul class="app-cookies__list">
                <li
                  v-for="key in COOKIE_CATEGORY_KEYS"
                  :key="key"
                  class="app-cookies__row"
                  :class="{ 'is-open': expanded[key] }"
                >
                  <div class="app-cookies__row-head">
                    <TextsP1 tag="span" color="black-100" class="app-cookies__row-title">
                      {{ t(`cookies.modal.categories.${key}.title`) }}
                    </TextsP1>

                    <div class="app-cookies__row-control">
                      <TextsP1
                        v-if="key === 'necessary'"
                        tag="span"
                        color="black-40"
                      >
                        {{ t('cookies.modal.alwaysActive') }}
                      </TextsP1>
                      <AtomsSwitch
                        v-else
                        :model-value="pending[key]"
                        :aria-label="t(`cookies.modal.categories.${key}.title`)"
                        @update:model-value="onPendingUpdate(key, $event)"
                      />
                    </div>

                    <button
                      type="button"
                      class="app-cookies__row-toggle"
                      :aria-expanded="expanded[key]"
                      :aria-label="t('cookies.modal.toggleDetails')"
                      @click="toggleExpanded(key)"
                    >
                      <SvgIconChevron color="black-100" />
                    </button>
                  </div>

                  <div class="app-cookies__row-details">
                    <div class="app-cookies__row-details-inner">
                      <div class="app-cookies__row-details-content">
                        <TextsP1
                          tag="p"
                          color="black-100"
                          weight="regular"
                        >
                          {{ t(`cookies.modal.categories.${key}.description`) }}
                        </TextsP1>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <button
            type="button"
            class="app-cookies__btn app-cookies__btn--confirm"
            @click="saveSelection"
          >
            <TextsCTA color="beige-100">
              {{ t('cookies.modal.confirm') }}
            </TextsCTA>
          </button>
        </div>
      </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss">
.app-cookies-root-enter-active,
.app-cookies-root-leave-active {
  transition: opacity 0.4s var(--ease-out-cubic);
}
.app-cookies-root-enter-from,
.app-cookies-root-leave-to {
  opacity: 0;
}

.app-cookies-view-enter-active,
.app-cookies-view-leave-active {
  transition:
    opacity 0.3s var(--ease-out-cubic),
    transform 0.35s var(--ease-out-cubic);
}
.app-cookies-view-enter-from {
  opacity: 0;
  transform: scale(0.96);
}
.app-cookies-view-leave-to {
  opacity: 0;
  transform: scale(1.02);
}

.app-cookies {
  position: fixed;
  inset: 0;
  z-index: 50;
  pointer-events: none;

  > * {
    pointer-events: auto;
  }

  // ---------------- Overlay (above the menu, below the banner/modal) ----------------
  &__overlay {
    position: absolute;
    inset: 0;
    background-color: var(--c-black-60);
    backdrop-filter: blur(3.5px);
    z-index: 1;

    @include mobile {
      background-color: var(--c-black-80);
      backdrop-filter: blur(5px);
    }
  }

  &__banner {
    position: absolute;
    z-index: 2;
    left: desktop-vw(16px);
    bottom: desktop-vw(16px);
    width: desktop-vw(865px);
    max-width: calc(100vw - desktop-vw(32px));
    display: flex;
    flex-direction: column;
    gap: desktop-vw(32px);
    padding: desktop-vw(32px);
    background: var(--c-orange);
    border-radius: 4px;

    @include mobile {
      left: mobile-vw(8px);
      right: mobile-vw(8px);
      bottom: mobile-vw(8px);
      width: auto;
      max-width: none;
      padding: mobile-vw(20px);
      gap: mobile-vw(20px);
    }
  }

  &__banner-text {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(12px);

    @include mobile {
      gap: mobile-vw(10px);
    }
  }

  &__banner-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: desktop-vw(16px);
    width: 100%;

    @include mobile {
      flex-direction: column;
      align-items: stretch;
      gap: mobile-vw(16px);
    }
  }

  &__banner-buttons {
    display: flex;
    gap: desktop-vw(12px);

    @include mobile {
      gap: mobile-vw(8px);
      flex-direction: column;
    }
  }

  &__settings-link {
    background: transparent;
    border: 0;
    padding: 0;
    cursor: pointer;
    color: var(--c-beige-100); // currentColor used by text-decoration
    text-decoration: underline;
    text-underline-offset: desktop-vw(4px);
    transition: opacity 0.3s var(--ease-out-cubic);

    @include hover {
      &:hover {
        opacity: 0.7;
      }
    }
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: desktop-vw(18px) desktop-vw(30px);
    border-radius: 4px;
    background: transparent;
    border: 0;
    cursor: pointer;
    transition: opacity 0.3s var(--ease-out-cubic);

    @include mobile {
      padding: mobile-vw(14px) mobile-vw(24px);
    }

    @include hover {
      &:hover {
        opacity: 0.85;
      }
    }

    &--outline {
      border: 2px solid var(--c-beige-100);
    }

    &--solid {
      background: var(--c-beige-100);
    }

    &--confirm {
      width: 100%;
      background: var(--c-black);
    }
  }

  &__modal-wrap {
    position: absolute;
    z-index: 2;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: desktop-vw(80px) desktop-vw(368px);

    @include mobile {
      padding: mobile-vw(20px);
    }
  }

  &__modal {
    width: 100%;
    max-width: desktop-vw(704px);
    max-height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--c-beige-100);
    border-radius: 4px;
    overflow: hidden;

    @include mobile {
      max-width: none;
    }
  }

  &__modal-scroll {
    flex: 1 1 auto;
    overflow-y: auto;
    padding: desktop-vw(32px) desktop-vw(32px) 0;
    display: flex;
    flex-direction: column;
    gap: desktop-vw(32px);

    @include mobile {
      padding: mobile-vw(20px) mobile-vw(20px) 0;
      gap: mobile-vw(20px);
    }

    @include disabled-scrollbar();
  }

  &__intro {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(24px);

    @include mobile {
      gap: mobile-vw(16px);
    }
  }

  &__intro-text {
    white-space: pre-line;
  }

  &__manage {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(24px);

    @include mobile {
      gap: mobile-vw(16px);
    }
  }

  &__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  &__row {
    border-top: 1px solid var(--c-black-20);

    &:last-child {
      border-bottom: 1px solid var(--c-black-20);
    }
  }

  &__row-head {
    display: flex;
    align-items: center;
    gap: desktop-vw(8px);
    padding: desktop-vw(15px) 0;

    @include mobile {
      gap: mobile-vw(8px);
      padding: mobile-vw(12px) 0;
    }
  }

  &__row-title {
    flex: 1 1 0;
    min-width: 0;
  }

  &__row-control {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: desktop-vw(38px);

    @include mobile {
      min-height: mobile-vw(30px);
    }
  }

  &__row-toggle {
    background: transparent;
    border: 0;
    padding: 0;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: desktop-vw(30px);
    height: desktop-vw(30px);
    transition: transform 0.35s var(--ease-out-cubic);

    @include mobile {
      width: mobile-vw(24px);
      height: mobile-vw(24px);
    }

    .svg-icon-chevron {
      width: desktop-vw(22px);

      @include mobile {
        width: mobile-vw(18px);
      }
    }
  }

  &__row.is-open &__row-toggle {
    transform: rotate(180deg);
  }

  &__row-details {
    display: grid;
    grid-template-rows: 0fr;
    overflow: hidden;
    transition: grid-template-rows 0.4s var(--ease-out-cubic);
  }

  &__row-details-inner {
    min-height: 0;
    overflow: hidden;
  }

  &__row-details-content {
    padding-bottom: desktop-vw(15px);

    @include mobile {
      padding-bottom: mobile-vw(12px);
    }
  }

  &__row.is-open &__row-details {
    grid-template-rows: 1fr;
  }

  &__btn--confirm {
    margin: desktop-vw(32px);
    width: calc(100% - desktop-vw(64px));

    @include mobile {
      margin: mobile-vw(20px);
      width: calc(100% - mobile-vw(40px));
    }
  }
}
</style>
