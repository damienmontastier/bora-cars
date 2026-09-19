<script setup lang="ts">
import { useLenis } from 'lenis/vue'
import { PRO_STEPS } from '~/config/CONTACT_PRO_CONFIG'

const step = defineModel<number>('step', { default: 0 })

const { t } = useI18n()
const contact = useContactForm()
const pro = provideContactProForm()
const lenis = useLenis()

const rootRef = ref<HTMLElement | null>(null)

const current = computed(() => PRO_STEPS[step.value]!)
const isLast = computed(() => step.value === PRO_STEPS.length - 1)
const submitting = computed(() => contact.isSubmitting('pro'))
const status = computed(() => contact.status.pro)

const steps = computed(() => PRO_STEPS.map(s => ({
  letter: s.letter,
  label: t(`contact.pro.steps.${s.id}.tab`),
})))

const meta = computed(() => `${t('contact.pro.stepCounter', { current: step.value + 1, total: PRO_STEPS.length })} · ${steps.value[step.value]!.label}`)

const nextLabel = computed(() => {
  if (submitting.value)
    return t('contact.form.status.submitting')
  if (isLast.value)
    return t('contact.pro.actions.submit')
  return step.value === 0 ? t('contact.pro.actions.start') : t('contact.pro.actions.next')
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
  if (index === step.value || index < 0 || index >= PRO_STEPS.length)
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
  if (submitting.value)
    return

  if (!isLast.value) {
    goTo(step.value + 1)
    return
  }

  const firstInvalidStep = PRO_STEPS.findIndex(s => !pro.isStepValid(s.id))
  if (firstInvalidStep >= 0) {
    const invalid = pro.validateStep(PRO_STEPS[firstInvalidStep]!.id)
    contact.fail('pro', invalid, t('contact.form.errors.summary'))
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
  await contact.send('pro', { ...pro.toPayload() }, {
    errorMessage: t('contact.pro.status.error'),
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

watch(() => pro.isStepValid(current.value.id), (valid) => {
  if (valid)
    contact.clearValidation('pro')
})

defineExpose({ submit })
</script>

<template>
  <div ref="rootRef" class="app-elements-contact-form-pro" @keydown="onKeydown">
    <div class="app-elements-contact-form-pro__head" data-contact-cascade>
      <AtomsStepTabs
        :steps="steps"
        :current="step"
        :aria-label="t('contact.pro.steps.label')"
        :meta="meta"
        @select="goTo"
      />
      <div class="app-elements-contact-form-pro__intro" aria-live="polite">
        <TextsP1 tag="h2" class="app-elements-contact-form-pro__title">
          {{ t(`contact.pro.steps.${current.id}.title`) }}
        </TextsP1>
        <TextsP1 weight="regular" color="black-70">
          {{ t(`contact.pro.steps.${current.id}.subtitle`) }}
        </TextsP1>
      </div>
    </div>

    <Transition name="app-contact-pro-step" mode="out-in" @after-enter="focusFirstField">
      <ElementsContactFormProStepYou v-if="current.id === 'a'" :key="current.id" class="app-elements-contact-form-pro__step" data-contact-cascade />
      <ElementsContactFormProStepCompany v-else-if="current.id === 'b'" :key="current.id" class="app-elements-contact-form-pro__step" data-contact-cascade />
      <ElementsContactFormProStepSituation v-else-if="current.id === 'c'" :key="current.id" class="app-elements-contact-form-pro__step" data-contact-cascade />
      <ElementsContactFormProStepProject v-else-if="current.id === 'd'" :key="current.id" class="app-elements-contact-form-pro__step" data-contact-cascade />
      <ElementsContactFormProStepDocuments v-else :key="current.id" class="app-elements-contact-form-pro__step" data-contact-cascade />
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
          {{ t('contact.pro.actions.back') }}
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

    <p class="app-elements-contact-form-pro__note">
      {{ t('contact.pro.note') }}
    </p>
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
