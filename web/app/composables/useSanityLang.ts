export const useSanityLang = () => {
  const { locale } = useI18n()
  return computed(() => locale.value as 'fr' | 'en')
}
