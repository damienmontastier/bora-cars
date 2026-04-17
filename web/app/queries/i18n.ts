// "field": coalesce(field[language == $lang][0].value, field[language == "fr"][0].value)
export const i18n = (field: string, alias?: string) =>
  `"${alias ?? field}": coalesce(${field}[language == $lang][0].value, ${field}[language == "fr"][0].value)`

// Pour les portable text (renvoie un array de blocks)
export const i18nBlock = (field: string, alias?: string) =>
  `"${alias ?? field}": coalesce(${field}[language == $lang][0].value, ${field}[language == "fr"][0].value)`
