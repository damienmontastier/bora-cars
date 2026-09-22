<script setup lang="ts">
import type { ProFormData } from '~/config/CONTACT_PRO_CONFIG'
import { useLenis } from 'lenis/vue'
import { proStepLetter } from '~/config/CONTACT_PRO_CONFIG'

const props = defineProps<{
  form?: ProFormData | null
}>()

const step = defineModel<number>('step', { default: 0 })

const { t } = useI18n()
const contact = useContactForm()
const pro = provideContactProForm(toRef(props, 'form'))
const lenis = useLenis()

const rootRef = ref<HTMLElement | null>(null)

const labels = computed(() => pro.labels.value)
const total = computed(() => pro.steps.value.length)
const current = computed(() => pro.steps.value[Math.min(step.value, total.value - 1)])
const isLast = computed(() => step.value >= total.value - 1)
const submitting = computed(() => contact.isSubmitting('pro'))
const status = computed(() => contact.status.pro)

const steps = computed(() => pro.steps.value.map((s, i) => ({
  letter: proStepLetter(i),
  label: s.tab ?? '',
})))

const meta = computed(() => {
  const counter = (labels.value?.stepCounter ?? '')
    .replaceAll('{current}', String(step.value + 1))
    .replaceAll('{total}', String(total.value))
  return [counter, steps.value[step.value]?.label].filter(Boolean).join(' · ')
})

const nextLabel = computed(() => {
  if (submitting.value)
    return t('contact.form.status.submitting')
  if (isLast.value)
    return labels.value?.submit ?? ''
  return (step.value === 0 ? labels.value?.start : labels.value?.next) ?? ''
})

watch(total, (count) => {
  if (count && step.value > count - 1)
    step.value = count - 1
})

function scrollToForm() {
  const target = rootRef.value?.closest<HTMLElement>('.app-elements-contact-form') ?? rootRef.value
  if (!target)
    return
  const margin = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0
  if (target.getBoundingClientRect().top >= margin)
    return
  if (lenis.value)
    lenis.value.scrollTo(target, { offset: -margin })
  else
    target.scrollIntoView({ behavior: 'smooth' })
}

function focusField(el: HTMLElement | null | undefined) {
  if (!el)
    return
  const rect = el.getBoundingClientRect()
  if (rect.top < window.innerHeight * 0.15 || rect.bottom > window.innerHeight * 0.85) {
    if (lenis.value)
      lenis.value.scrollTo(el, { offset: -window.innerHeight / 3 })
    else
      el.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }
  el.focus({ preventScroll: true })
}

function stepElement() {
  return rootRef.value?.querySelector<HTMLElement>('.app-elements-contact-form-pro__step') ?? null
}

function firstInvalidField() {
  return stepElement()?.querySelector<HTMLElement>('[aria-invalid="true"]')
}

let focusInvalidOnEnter = false

function focusFirstField() {
  if (focusInvalidOnEnter) {
    focusInvalidOnEnter = false
    focusField(firstInvalidField())
    return
  }
  const first = stepElement()?.querySelector<HTMLElement>(
    'input:not([type="hidden"]):not(:disabled), textarea, button[role="combobox"]:not(:disabled)',
  )
  first?.focus({ preventScroll: true })
}

function goTo(index: number, keepErrors = false) {
  if (index === step.value || index < 0 || index >= total.value)
    return
  if (!keepErrors)
    contact.clearValidation('pro')
  step.value = index
  scrollToForm()
}

function back() {
  goTo(step.value - 1)
}

async function submit() {
  if (submitting.value || !total.value)
    return

  if (!isLast.value) {
    goTo(step.value + 1)
    return
  }

  const firstInvalidStep = pro.steps.value.findIndex(s => !pro.isStepValid(s._key))
  if (firstInvalidStep >= 0) {
    const invalid = pro.validateStep(pro.steps.value[firstInvalidStep]!._key)
    contact.fail('pro', invalid.map(f => f.label || f._type), t('contact.form.errors.summary'))
    if (firstInvalidStep === step.value) {
      await nextTick()
      focusField(firstInvalidField())
    }
    else {
      focusInvalidOnEnter = true
      goTo(firstInvalidStep, true)
    }
    return
  }

  contact.clearValidation('pro')
  await contact.send('pro', pro.toPayload(), {
    errorMessage: labels.value?.sendError ?? '',
  })
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' || event.isComposing)
    return
  const target = event.target as HTMLElement
  if (target.closest('textarea, button, a, [role="combobox"], [role="listbox"]'))
    return
  event.preventDefault()
  submit()
}

watch(() => current.value && pro.isStepValid(current.value._key), (valid) => {
  if (valid)
    contact.clearValidation('pro')
})

defineExpose({ submit })
</script>

<template>
  <div ref="rootRef" class="app-elements-contact-form-pro" @keydown="onKeydown">
    <template v-if="current">
      <div class="app-elements-contact-form-pro__head" data-contact-cascade>
        <AtomsStepTabs
          :steps="steps"
          :current="step"
          :aria-label="labels?.stepsLabel ?? undefined"
          :meta="meta"
          @select="goTo"
        />
        <div class="app-elements-contact-form-pro__intro" aria-live="polite">
          <TextsP1 tag="h2" class="app-elements-contact-form-pro__title">
            {{ current.title }}
          </TextsP1>
          <TextsP1 v-if="current.subtitle" weight="regular" color="black-70">
            {{ current.subtitle }}
          </TextsP1>
        </div>
      </div>

      <Transition name="app-contact-pro-step" mode="out-in" @after-enter="focusFirstField">
        <ElementsContactFormProStep
          :key="current._key"
          :fields="current.fields"
          class="app-elements-contact-form-pro__step"
          data-contact-cascade
        />
      </Transition>

      <AtomsHelpNote
        v-if="status.state === 'error' && status.message"
        tone="error"
        role="alert"
      >
        {{ status.message }}
      </AtomsHelpNote>

      <div class="app-elements-contact-form-pro__nav">
        <button
          v-if="step > 0"
          type="button"
          class="app-elements-contact-form-pro__button app-elements-contact-form-pro__button--back"
          :disabled="submitting"
          @click="back"
        >
          <TextsCTA :selectable="false" color="black-100">
            {{ labels?.back }}
          </TextsCTA>
        </button>
        <button
          type="submit"
          class="app-elements-contact-form-pro__button"
          :disabled="submitting"
          :aria-busy="submitting || undefined"
        >
          <TextsCTA :selectable="false" color="beige-100">
            {{ nextLabel }}
          </TextsCTA>
        </button>
      </div>

      <p v-if="labels?.note" class="app-elements-contact-form-pro__note">
        {{ labels.note }}
      </p>
    </template>
  </div>
</template>

<style lang="scss">
.app-elements-contact-form-pro {
  display: flex;
  flex-direction: column;
  gap: desktop-vw(32px);
  width: 100%;

  @include mobile {
    gap: mobile-vw(24px);
  }

  &__head {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(16px);

    @include mobile {
      gap: mobile-vw(12px);
    }
  }

  &__intro {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(4px);

    @include mobile {
      gap: mobile-vw(2px);
    }
  }

  &__fields {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(12px);
    width: 100%;

    @include mobile {
      gap: mobile-vw(8px);
    }
  }

  &__row {
    display: flex;
    gap: desktop-vw(12px);
    width: 100%;

    > * {
      flex: 1 0 0;
      min-width: 0;
    }

    @include mobile {
      flex-direction: column;
      gap: mobile-vw(8px);
    }
  }

  &__group {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(4px);

    @include mobile {
      gap: mobile-vw(4px);
    }
  }

  &__conditional {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(12px);
    margin-bottom: desktop-vw(12px);
    padding-left: desktop-vw(24px);
    border-left: 2px solid var(--c-orange-100);

    @include mobile {
      gap: mobile-vw(8px);
      margin-bottom: mobile-vw(8px);
      padding-left: mobile-vw(16px);
    }
  }

  &__option {
    padding: desktop-vw(8px) 0;

    @include mobile {
      padding: mobile-vw(6px) 0;
    }
  }

  &__consent {
    margin-top: desktop-vw(8px);

    @include mobile {
      margin-top: mobile-vw(8px);
    }
  }

  &__nav {
    display: flex;
    justify-content: flex-end;
    gap: desktop-vw(12px);

    @include mobile {
      gap: mobile-vw(8px);
    }
  }

  &__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: desktop-vw(18px) desktop-vw(30px);
    border: 0;
    border-radius: 4px;
    background: var(--c-black-100);
    cursor: pointer;
    transition: opacity 0.35s var(--ease-out-cubic);

    &--back {
      background: var(--c-black-10);
    }

    &:focus-visible {
      outline: 2px solid var(--c-black-100);
      outline-offset: 3px;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    @include hover {
      &:hover:not(:disabled) {
        opacity: 0.8;
      }
    }

    @include mobile {
      flex: 1 0 0;
      padding: mobile-vw(12px) mobile-vw(20px);
    }
  }

  &__note {
    color: var(--c-black-70);
    font-family: var(--font-haas-grot-disp-regular);
    font-size: desktop-vw(12px);
    line-height: desktop-vw(16px);
    text-align: right;

    @include mobile {
      font-size: mobile-vw(12px);
      line-height: mobile-vw(16px);
      text-align: left;
    }
  }
}

.app-contact-pro-step-enter-active,
.app-contact-pro-step-leave-active {
  transition:
    opacity 0.25s var(--ease-out-cubic),
    transform 0.25s var(--ease-out-cubic);
}

.app-contact-pro-step-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.app-contact-pro-step-leave-to {
  opacity: 0;
}

@include reduced-motion {
  .app-contact-pro-step-enter-active,
  .app-contact-pro-step-leave-active {
    transition: none;
  }
}
</style>
