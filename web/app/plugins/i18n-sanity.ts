import type { GlossaireI18nData } from '~/queries/glossaire'
import { buildLocaleMessages, GLOSSAIRE_I18N_QUERY } from '~/queries/glossaire'

/**
 * Charge le micro-copy de l'interface depuis Sanity (singleton `glossaire`) et
 * l'injecte dans vue-i18n — comme tout le reste du contenu du site, via une query.
 *
 * Du coup `i18n/locales/{fr,en}.json` ne gardent qu'un fallback minimal
 * (`nuxtSiteConfig`, lu au build par nuxt-site-config) ; tout le reste vient d'ici.
 *
 * Universel (serveur + client) : au SSR/prerender les messages sont posés avant
 * le rendu (et sérialisés dans le payload → pas de re-fetch à l'hydratation).
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  const { data } = await useSanityQuery<GlossaireI18nData | null>(GLOSSAIRE_I18N_QUERY)
  const doc = data.value
  if (!doc)
    return

  const i18n = nuxtApp.$i18n as any
  if (!i18n?.mergeLocaleMessage)
    return

  // Merge (et non remplace) : préserve le fallback des fichiers JSON locaux.
  const apply = () => {
    for (const locale of ['fr', 'en'] as const)
      i18n.mergeLocaleMessage(locale, buildLocaleMessages(doc, locale))
  }

  apply()
  // Le chargement paresseux d'i18n recharge le fichier (fallback) à chaque
  // changement de langue → on ré-applique Sanity par-dessus.
  nuxtApp.hook('i18n:localeSwitched', apply)
})
