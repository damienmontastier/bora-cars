<script setup lang="ts">
import type { ContactSubjectOption } from '~/queries/contact'

interface Props {
  subjectOptions?: ContactSubjectOption[] | null
  submitLabel?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  subjectOptions: () => [],
  submitLabel: null,
})

const emit = defineEmits<{
  submit: [payload: FormPayload]
}>()

interface FormPayload {
  lastName: string
  firstName: string
  email: string
  phone: string
  subject: string
  message: string
}

type FormField = keyof FormPayload

const { t, locale } = useI18n()
const analytics = useAnalytics()

function subjectLabel(value: string) {
  return props.subjectOptions?.find(o => o._key === value)?.label ?? value
}

const form = reactive<FormPayload>({
  lastName: '',
  firstName: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
})

const errors = reactive<Record<FormField, string>>({
  lastName: '',
  firstName: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
})

const submitted = ref(false)
const statusMessage = ref('')

const selectOptions = computed(() =>
  (props.subjectOptions ?? []).map(o => ({ value: o._key, label: o.label })),
)

interface Focusable { focus: () => void }
const fieldOrder = ['lastName', 'email', 'phone', 'subject', 'message'] as const
type FocusableField = typeof fieldOrder[number]

const lastNameRef = ref<Focusable | null>(null)
const emailRef = ref<Focusable | null>(null)
const phoneRef = ref<Focusable | null>(null)
const subjectRef = ref<Focusable | null>(null)
const messageRef = ref<Focusable | null>(null)

const fieldRefs: Record<FocusableField, Ref<Focusable | null>> = {
  lastName: lastNameRef,
  email: emailRef,
  phone: phoneRef,
  subject: subjectRef,
  message: messageRef,
}

function validate(): boolean {
  errors.lastName = form.lastName.trim() ? '' : t('contact.form.errors.required')

  if (!form.email.trim())
    errors.email = t('contact.form.errors.required')
  else if (!isValidEmail(form.email))
    errors.email = t('contact.form.errors.email')
  else
    errors.email = ''

  const digits = form.phone.replace(/\D/g, '')
  if (!form.phone.trim())
    errors.phone = t('contact.form.errors.required')
  else if (digits.length < 8)
    errors.phone = t('contact.form.errors.phone')
  else
    errors.phone = ''

  errors.subject = form.subject ? '' : t('contact.form.errors.select')
  errors.message = form.message.trim() ? '' : t('contact.form.errors.required')

  return fieldOrder.every(f => !errors[f])
}

function focusFirstInvalid() {
  const firstInvalid = fieldOrder.find(f => !!errors[f])
  if (!firstInvalid)
    return
  nextTick(() => {
    fieldRefs[firstInvalid].value?.focus()
  })
}

function onSubmit() {
  submitted.value = true
  if (!validate()) {
    statusMessage.value = t('contact.form.errors.summary')
    analytics.trackContactFormError({
      fields: fieldOrder.filter(f => !!errors[f]),
      summary: statusMessage.value,
    })
    focusFirstInvalid()
    return
  }

  statusMessage.value = ''
  analytics.trackContactFormSubmit({
    subject: subjectLabel(form.subject),
    locale: locale.value,
  })
  // eslint-disable-next-line no-console
  console.log('[contact form] submit', toRaw(form))
  emit('submit', toRaw(form))
}

// Re-validate as the user fixes fields, but only AFTER the first submit attempt
watch(
  () => ({ ...form }),
  () => {
    if (!submitted.value)
      return
    validate()
    if (fieldOrder.every(f => !errors[f]))
      statusMessage.value = ''
  },
  { deep: true },
)
</script>

<template>
  <form class="app-elements-contact-form" novalidate @submit.prevent="onSubmit">
    <div class="app-elements-contact-form__fields">
      <div class="app-elements-contact-form__row">
        <AtomsFieldText
          ref="lastNameRef"
          v-model="form.lastName"
          :label="t('contact.form.lastName')"
          autocomplete="family-name"
          :invalid="!!errors.lastName"
          :error-message="errors.lastName"
          required
        />
        <AtomsFieldText
          v-model="form.firstName"
          :label="t('contact.form.firstName')"
          autocomplete="given-name"
        />
      </div>

      <AtomsFieldText
        ref="emailRef"
        v-model="form.email"
        type="email"
        :label="t('contact.form.email')"
        autocomplete="email"
        :invalid="!!errors.email"
        :error-message="errors.email"
        required
      />

      <AtomsFieldPhone
        ref="phoneRef"
        v-model="form.phone"
        :label="t('contact.form.phone')"
        :invalid="!!errors.phone"
        :error-message="errors.phone"
        required
      />

      <AtomsFieldSelect
        ref="subjectRef"
        v-model="form.subject"
        :label="t('contact.form.subject')"
        :options="selectOptions"
        :invalid="!!errors.subject"
        :error-message="errors.subject"
        required
      />

      <AtomsFieldTextarea
        ref="messageRef"
        v-model="form.message"
        :label="t('contact.form.message')"
        :invalid="!!errors.message"
        :error-message="errors.message"
        required
      />
    </div>

    <div
      class="app-elements-contact-form__status"
      role="alert"
      aria-live="polite"
    >
      {{ statusMessage }}
    </div>

    <button
      type="submit"
      class="app-elements-contact-form__submit"
    >
      <TextsCTA :selectable="false" color="beige-100">
        {{ submitLabel || t('contact.form.submit') }}
      </TextsCTA>
    </button>
  </form>
</template>

<style lang="scss">
.app-elements-contact-form {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: desktop-vw(32px);
  width: 100%;

  @include mobile {
    gap: mobile-vw(24px);
  }

  &__fields {
    display: flex;
    flex-direction: column;
    gap: desktop-vw(12px);
    width: 100%;

    @include mobile {
      gap: mobile-vw(12px);
    }
  }

  &__row {
    display: flex;
    gap: desktop-vw(12px);
    width: 100%;

    @include mobile {
      flex-direction: column;
      gap: mobile-vw(12px);
    }
  }

  &__status {
    width: 100%;
    min-height: desktop-vw(20px);
    color: var(--c-red);
    font-family: var(--font-haas-grot-disp-regular);
    font-size: desktop-vw(14px);
    line-height: desktop-vw(20px);

    &:empty {
      min-height: 0;
    }

    @include mobile {
      min-height: mobile-vw(18px);
      font-size: mobile-vw(12px);
      line-height: mobile-vw(16px);
    }
  }

  &__submit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: desktop-vw(18px) desktop-vw(30px);
    border: 0;
    border-radius: 4px;
    background: var(--c-black-100);
    cursor: pointer;
    transition: opacity 0.35s var(--ease-out-cubic);

    &:focus-visible {
      outline: 2px solid var(--c-black-100);
      outline-offset: 3px;
    }

    @include hover {
      &:hover {
        opacity: 0.8;
      }
    }

    @include mobile {
      width: 100%;
      padding: mobile-vw(14px) mobile-vw(24px);
    }
  }
}
</style>
