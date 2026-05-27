// Typed analytics helpers — push dataLayer events through @nuxt/scripts' GTM proxy.
// Each helper is a safe no-op when GTM is not registered (e.g. local dev where
// `$development: { scripts.registry.googleTagManager: 'mock' }` swaps in a mock).
//
// Naming: events use snake_case (GA4 convention). Params are snake_case for the same reason.
// All events are gated by GTM's consent state — they queue in dataLayer regardless and fire only
// once the relevant consent signal is granted (handled via consent.update from useCookies).

export interface VehicleEventParams {
  car_id: string
  car_slug?: string
  car_brand?: string
  car_model?: string
  car_price_per_day?: number
  car_category?: string
}

export interface RentalConfig {
  duration?: string
  when?: string
}

export type ContactSource =
  | 'menu'
  | 'home'
  | 'car_detail'
  | 'car_pricing'
  | 'professionnel'
  | 'proprietaire'
  | 'contact'
  | 'footer'
  | 'other'

export function useAnalytics() {
  function track(event: string, params?: Record<string, any>) {
    if (!import.meta.client)
      return
    let gtm: ReturnType<typeof useScriptGoogleTagManager> | undefined
    try {
      gtm = useScriptGoogleTagManager()
    }
    catch {
      return
    }
    if (!gtm?.proxy)
      return
    gtm.proxy.dataLayer.push({ event, ...(params ?? {}) })
  }

  return {
    track,

    trackVehicleView(params: VehicleEventParams) {
      track('vehicle_view', params)
    },

    trackContactCtaClick(source: ContactSource, extra?: Record<string, any>) {
      track('contact_cta_click', { source, ...(extra ?? {}) })
    },

    trackWhatsappClick(params: VehicleEventParams & RentalConfig & { price_text?: string, url?: string }) {
      track('whatsapp_click', params)
    },

    trackContactFormSubmit(params: { subject?: string, locale?: string }) {
      track('contact_form_submit', params)
    },

    trackContactFormSuccess(params: { subject?: string, locale?: string }) {
      track('contact_form_success', params)
    },

    trackContactFormError(params: { fields?: string[], summary?: string, kind?: 'validation' | 'server' }) {
      track('contact_form_error', { kind: 'validation', ...params })
    },

    trackRentalConfigChange(params: VehicleEventParams & RentalConfig & { field: 'duration' | 'when' }) {
      track('rental_config_change', params)
    },

    trackCatalogueFilter(params: { filter_type: string, filter_value: string | number | boolean }) {
      track('catalogue_filter', params)
    },

    trackLanguageSwitch(params: { from: string, to: string }) {
      track('language_switch', params)
    },

    trackCarGalleryBrowse(params: VehicleEventParams & { image_index: number, total: number }) {
      track('car_gallery_browse', params)
    },

    trackCatalogueCarClick(params: VehicleEventParams & { position?: number }) {
      track('catalogue_car_click', { source: 'catalogue', ...params })
    },

    trackFaqToggle(params: { question_index: number, question_text?: string, expanded_state: boolean, source?: string }) {
      track('faq_toggle', params)
    },

    trackBackToTop(params: { page?: string, scroll_depth_percent?: number }) {
      track('back_to_top_click', params)
    },
  }
}
