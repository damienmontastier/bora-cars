export function useSanityLang() {
  const route = useRoute()
  const { defaultLocale, localeCodes } = useI18n()

  return computed(() => {
    const code = String(route.name ?? '').split('___').at(-1)
    return (code && localeCodes.value.includes(code) ? code : defaultLocale) as 'fr' | 'en'
  })
}
