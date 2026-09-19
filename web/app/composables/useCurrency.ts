export type CurrencyCode = 'EUR' | 'CHF'

const CURRENCY_COOKIE = 'bora-currency'
const ONE_YEAR = 60 * 60 * 24 * 365

export function useCurrency() {
  const { locale } = useI18n()
  const settings = useSettings()

  const selected = useState<CurrencyCode>('currency', () => 'EUR')

  const stored = useCookie<CurrencyCode | null>(CURRENCY_COOKIE, {
    maxAge: ONE_YEAR,
    sameSite: 'lax',
    path: '/',
  })

  onMounted(() => {
    if (stored.value === 'CHF' || stored.value === 'EUR')
      selected.value = stored.value
  })

  const chfRate = computed(() => {
    const rate = settings.value?.tauxChf
    return typeof rate === 'number' && rate > 0 ? rate : null
  })

  const chfAvailable = computed(() => chfRate.value != null)

  const currency = computed<CurrencyCode>(() =>
    selected.value === 'CHF' && chfAvailable.value ? 'CHF' : 'EUR',
  )

  function setCurrency(next: CurrencyCode) {
    selected.value = next
    stored.value = next
  }

  const numberLocale = computed(() => (locale.value === 'fr' ? 'fr-FR' : 'en-GB'))

  function formatPrice(amountEur: number, decimals = 0): string {
    const amount = currency.value === 'CHF' && chfRate.value != null
      ? amountEur * chfRate.value
      : amountEur

    return new Intl.NumberFormat(numberLocale.value, {
      style: 'currency',
      currency: currency.value,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount)
  }

  return { currency, chfAvailable, setCurrency, formatPrice }
}
