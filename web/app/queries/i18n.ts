export const i18n = (field: string, alias?: string) =>
  `"${alias ?? field}": coalesce(${field}[language == $lang][0].value, ${field}[language == "fr"][0].value)`

export const i18nBlock = (field: string, alias?: string) =>
  `"${alias ?? field}": coalesce(${field}[language == $lang][0].value, ${field}[language == "fr"][0].value)`

export const internalLinkSlug = `"slug": select(
    _type == "legalPage" && $lang == "en" => coalesce(slugEn.current, slug.current),
    slug.current
  )`
