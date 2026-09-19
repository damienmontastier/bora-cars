<script setup lang="ts">
// Parcours « Demande générale » de la page Contact : le formulaire historique, inchangé
// (Prénom, Nom*, Adresse mail*, Téléphone*, Objet*, Message*, newsletter).
// L'envoi, le statut et le honeypot vivent dans useContactForm (conteneur ElementsContactForm).
import type { ContactSubjectOption } from '~/queries/contact'
import { CONTACT_MAX_LENGTH } from '~/config/CONTACT_PRO_CONFIG'

interface Props {
  subjectOptions?: ContactSubjectOption[] | null
  submitLabel?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  subjectOptions: () => [],
  submitLabel: null,
})

interface FormPayload {
  lastName: string
  firstName: string
  email: string
  phone: string
  subject: string
  message: string
  newsletter: boolean
}

type FormField = keyof FormPayload

const { t } = useI18n()
const contact = useContactForm()

const status = computed(() => contact.status.general)
const submitting = computed(() => contact.isSubmitting('general'))

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
  newsletter: false,
})

const errors = reactive<Record<Exclude<FormField, 'newsletter'>, string>>({
  lastName: '',
  firstName: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
})

const submitted = ref(false)

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

function resetForm() {
  form.lastName = ''
  form.firstName = ''
  form.email = ''
  form.phone = ''
  form.subject = ''
  form.message = ''
  form.newsletter = false
  submitted.value = false
}

async function submit() {
  if (submitting.value)
    return

  submitted.value = true
  if (!validate()) {
    contact.fail('general', fieldOrder.filter(f => !!errors[f]), t('contact.form.errors.summary'))
    focusFirstInvalid()
    return
  }

  const resolvedSubject = subjectLabel(form.subject)
  const ok = await contact.send('general', {
    lastName: form.lastName,
    firstName: form.firstName,
    email: form.email,
    phone: form.phone,
    subjectKey: form.subject,
    subject: resolvedSubject,
    message: form.message,
    newsletter: form.newsletter,
  }, {
    subject: resolvedSubject,
    submittingMessage: t('contact.form.status.submitting'),
    successMessage: t('contact.form.status.success'),
    errorMessage: t('contact.form.status.error'),
  })

  if (ok)
    resetForm()
}

// Re-validate as the user fixes fields, but only AFTER the first submit attempt
watch(
  () => ({ ...form }),
  () => {
    if (!submitted.value)
      return
    if (validate())
      contact.clearValidation('general')
  },
  { deep: true },
)

defineExpose({ submit })
</script>

<template>
  <div class="app-elements-contact-form-general">
    <div class="app-elements-contact-form-general__fields" data-contact-cascade>
      <div class="app-elements-contact-form-general__row">
        <AtomsFieldText
          v-model="form.firstName"
          :label="t('contact.form.firstName')"
          :maxlength="CONTACT_MAX_LENGTH.name"
          autocomplete="given-name"
        />
        <AtomsFieldText
          ref="lastNameRef"
          v-model="form.lastName"
          :label="t('contact.form.lastName')"
          :maxlength="CONTACT_MAX_LENGTH.name"
          autocomplete="family-name"
          :invalid="!!errors.lastName"
          :error-message="errors.lastName"
          required
        />
      </div>

      <AtomsFieldText
        ref="emailRef"
        v-model="form.email"
        type="email"
        :label="t('contact.form.email')"
        :maxlength="CONTACT_MAX_LENGTH.email"
        autocomplete="email"
        :invalid="!!errors.email"
        :error-message="errors.email"
        required
      />

      <AtomsFieldPhone
        ref="phoneRef"
        v-model="form.phone"
        :label="t('contact.form.phone')"
        :maxlength="CONTACT_MAX_LENGTH.phone"
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
        :maxlength="CONTACT_MAX_LENGTH.message"
        :invalid="!!errors.message"
        :error-message="errors.message"
        required
      />

      <AtomsFieldCheckbox
        v-model="form.newsletter"
        :label="t('contact.form.newsletter')"
      />
    </div>

    <div
      class="app-elements-contact-form-general__status"
      :data-state="status.state"
      role="alert"
      aria-live="polite"
    >
      {{ status.message }}
    </div>

    <button
      type="submit"
      class="app-elements-contact-form-general__submit"
      :disabled="submitting"
    >
      <TextsCTA :selectable="false" color="beige-100">
        {{ submitting ? t('contact.form.status.submitting') : (submitLabel || t('contact.form.submit')) }}
      </TextsCTA>
    </button>

    <p class="app-elements-contact-form-general__consent">
      {{ t('contact.form.consent.before') }}
      <UtilsBaseLink :to="{ name: 'legal-slug', params: { slug: t('legal.privacySlug') } }">
        {{ t('contact.form.consent.linkLabel') }}
      </UtilsBaseLink>{{ t('contact.form.consent.after') }}
    </p>
  </div>
</template>

<style lang="scss">
.app-elements-contact-form-general {
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

    &[data-state='submitting'],
    &[data-state='success'] {
      color: var(--c-black);
    }

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
      width: 100%;
      padding: mobile-vw(14px) mobile-vw(24px);
    }
  }

  &__consent {
    width: 100%;
    margin-top: desktop-vw(4px);
    color: var(--c-black-60);
    font-family: var(--font-haas-grot-disp-regular);
    font-size: desktop-vw(12px);
    line-height: 1.5;
    text-align: right;

    a {
      color: inherit;
      text-decoration: underline;
      text-underline-offset: 2px;
      transition: opacity 0.2s var(--ease-out-cubic);

      @include hover {
        &:hover {
          opacity: 0.7;
        }
      }
    }

    @include mobile {
      margin-top: mobile-vw(4px);
      font-size: mobile-vw(11px);
      text-align: left;
    }
  }
}
</style>
