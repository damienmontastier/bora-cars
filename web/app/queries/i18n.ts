// "field": coalesce(field[language == $lang][0].value, field[language == "fr"][0].value)
export const i18n = (field: string, alias?: string) =>
  `"${alias ?? field}": coalesce(${field}[language == $lang][0].value, ${field}[language == "fr"][0].value)`

// Pour les portable text (renvoie un array de blocks)
export const i18nBlock = (field: string, alias?: string) =>
  `"${alias ?? field}": coalesce(${field}[language == $lang][0].value, ${field}[language == "fr"][0].value)`

// Slug d'un lien interne (`internalLink->`), résolu PAR LOCALE.
// Seules les pages légales (`legalPage`) ont un slug EN dédié (`slugEn`, override
// optionnel) ; tous les autres types gardent leur slug unique non traduit
// (marque-modèle pour les voitures, etc.). En contexte EN on prend l'override
// (fallback FR si vide) ; partout ailleurs le slug FR/canonique.
// Suppose `$lang` dans le scope de la query — toujours vrai : ces projections de
// liens vivent dans des queries qui passent déjà `$lang` (cf. `i18n()`).
export const internalLinkSlug = `"slug": select(
    _type == "legalPage" && $lang == "en" => coalesce(slugEn.current, slug.current),
    slug.current
  )`
