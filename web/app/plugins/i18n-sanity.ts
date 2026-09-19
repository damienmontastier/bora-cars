import type { GlossaireI18nData } from '~/queries/glossaire'
import { buildLocaleMessages, GLOSSAIRE_I18N_QUERY } from '~/queries/glossaire'

export default defineNuxtPlugin(async (nuxtApp) => {
  const { data } = await useSanityQuery<GlossaireI18nData | null>(GLOSSAIRE_I18N_QUERY)
  const doc = data.value
  if (!doc)
    return

  const i18n = nuxtApp.$i18n as any
  if (!i18n?.mergeLocaleMessage)
    return

  const apply = () => {
    for (const locale of ['fr', 'en'] as const)
      i18n.mergeLocaleMessage(locale, buildLocaleMessages(doc, locale))
  }

  apply()
  nuxtApp.hook('i18n:localeSwitched', apply)
})
