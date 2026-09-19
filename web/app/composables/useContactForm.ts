import type { ContactProfile } from '~/config/CONTACT_PRO_CONFIG'
import { createInjectionState } from '@vueuse/core'

export type ContactSubmitState = 'idle' | 'submitting' | 'success' | 'error'

interface ContactStatus {
  state: ContactSubmitState
  message: string
  validation: boolean
}

interface ContactFormOptions {
  onSuccess?: (profile: ContactProfile, body: Record<string, unknown>) => void
}

interface SendOptions {
  subject?: string
  errorMessage: string
  submittingMessage?: string
  successMessage?: string
}

const [provideState, injectState] = createInjectionState((options: ContactFormOptions = {}) => {
  const { locale } = useI18n()
  const analytics = useAnalytics()
  const utm = useUtm()
  const pageUrl = useRequestURL().href

  const website = ref('')

  const status = reactive<Record<ContactProfile, ContactStatus>>({
    general: { state: 'idle', message: '', validation: false },
    pro: { state: 'idle', message: '', validation: false },
  })

  function isSubmitting(profile: ContactProfile) {
    return status[profile].state === 'submitting'
  }

  function fail(profile: ContactProfile, fields: string[], summary: string) {
    Object.assign(status[profile], { state: 'error', message: summary, validation: true })
    analytics.trackContactFormError({ kind: 'validation', fields, summary, profile })
  }

  function clearValidation(profile: ContactProfile) {
    if (status[profile].validation)
      Object.assign(status[profile], { state: 'idle', message: '', validation: false })
  }

  async function send(profile: ContactProfile, body: Record<string, unknown>, opts: SendOptions): Promise<boolean> {
    if (isSubmitting(profile))
      return false

    Object.assign(status[profile], { state: 'submitting', message: opts.submittingMessage ?? '', validation: false })
    analytics.trackContactFormSubmit({ subject: opts.subject, locale: locale.value, profile })

    try {
      await $fetch('/api/contact', {
        method: 'POST',
        body: {
          ...body,
          profile,
          website: website.value,
          locale: locale.value,
          pageUrl,
          utm: utm.read(),
        },
      })
      Object.assign(status[profile], { state: 'success', message: opts.successMessage ?? '' })
      analytics.trackContactFormSuccess({ subject: opts.subject, locale: locale.value, profile })
      options.onSuccess?.(profile, body)
      return true
    }
    catch (err) {
      Object.assign(status[profile], { state: 'error', message: opts.errorMessage })
      analytics.trackContactFormError({
        kind: 'server',
        summary: err instanceof Error ? err.message : String(err),
        profile,
      })
      return false
    }
  }

  return { website, status, isSubmitting, fail, clearValidation, send }
})

export function provideContactForm(options?: ContactFormOptions) {
  return provideState(options)
}

export function useContactForm() {
  const state = injectState()
  if (!state)
    throw new Error('useContactForm() doit être appelé sous ElementsContactForm (provideContactForm)')
  return state
}
