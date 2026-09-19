import type { ContactProfile } from '~/config/CONTACT_PRO_CONFIG'
import { createInjectionState } from '@vueuse/core'

// Logique partagée par les deux parcours de la page Contact (Demande générale /
// Leasing professionnel). `ElementsContactForm` (le conteneur) la crée avec
// `provideContactForm()` ; chaque parcours la récupère avec `useContactForm()`.
//
// Le conteneur garde : le honeypot, l'état d'envoi et le message de statut (un par
// parcours, pour qu'un onglet ne montre pas l'erreur de l'autre). Les parcours
// gardent leurs champs et leur validation.

export type ContactSubmitState = 'idle' | 'submitting' | 'success' | 'error'

interface ContactStatus {
  state: ContactSubmitState
  message: string
  // `true` quand le message vient de la validation (il disparaît dès que tout est corrigé)
  validation: boolean
}

interface ContactFormOptions {
  onSuccess?: (profile: ContactProfile, body: Record<string, unknown>) => void
}

interface SendOptions {
  // Objet (Demande générale) transmis aux événements analytics
  subject?: string
  // Message affiché en cas d'échec de l'envoi
  errorMessage: string
  // Message affiché pendant l'envoi / après succès (vide = aucun message)
  submittingMessage?: string
  successMessage?: string
}

const [provideState, injectState] = createInjectionState((options: ContactFormOptions = {}) => {
  const { locale } = useI18n()
  const analytics = useAnalytics()
  const utm = useUtm()
  // Figée au setup : au prérendu c'est l'URL de la page, au runtime celle du visiteur.
  const pageUrl = useRequestURL().href

  // Honeypot — champ caché, doit rester vide. Les bots le remplissent, pas les humains.
  const website = ref('')

  const status = reactive<Record<ContactProfile, ContactStatus>>({
    general: { state: 'idle', message: '', validation: false },
    pro: { state: 'idle', message: '', validation: false },
  })

  function isSubmitting(profile: ContactProfile) {
    return status[profile].state === 'submitting'
  }

  // Validation refusée : message récapitulatif + événement analytics
  function fail(profile: ContactProfile, fields: string[], summary: string) {
    Object.assign(status[profile], { state: 'error', message: summary, validation: true })
    analytics.trackContactFormError({ kind: 'validation', fields, summary, profile })
  }

  // Tous les champs sont corrigés : on retire le récapitulatif de validation
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
