export type CurrencyCode = 'EUR' | 'CHF'

export interface Money {
  eur?: number | null
  chf?: number | null
}

export interface CarPriceFields {
  prixJournalier?: number | null
  prixJournalierChf?: number | null
  prixMensuel?: number | null
  prixMensuelChf?: number | null
}

export function carMainPrice(car: CarPriceFields): { money: Money, monthly: boolean } | null {
  if (car.prixMensuel != null || car.prixMensuelChf != null)
    return { money: { eur: car.prixMensuel, chf: car.prixMensuelChf }, monthly: true }
  if (car.prixJournalier != null || car.prixJournalierChf != null)
    return { money: { eur: car.prixJournalier, chf: car.prixJournalierChf }, monthly: false }
  return null
}

export function useCurrency() {
  const { locale } = useI18n()
  const settings = useSettings()

  const currency = useState<CurrencyCode>('currency', () => 'EUR')

  const chfRate = computed(() => {
    const rate = settings.value?.tauxChf
    return typeof rate === 'number' && rate > 0 ? rate : null
  })

  function setCurrency(next: CurrencyCode) {
    currency.value = next
  }

  function amountIn(money: Money, code: CurrencyCode): number | null {
    const rate = chfRate.value
    if (code === 'EUR')
      return money.eur ?? (money.chf != null && rate ? money.chf / rate : null)
    return money.chf ?? (money.eur != null && rate ? money.eur * rate : null)
  }

  const numberLocale = computed(() => (locale.value === 'fr' ? 'fr-FR' : 'en-GB'))

  function format(amount: number, code: CurrencyCode, decimals: number): string {
    return new Intl.NumberFormat(numberLocale.value, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount)
  }

  function formatMoney(money: Money, code: CurrencyCode = currency.value, decimals = 0): string | null {
    const amount = amountIn(money, code)
    if (amount != null)
      return format(amount, code, decimals)
    const other: CurrencyCode = code === 'EUR' ? 'CHF' : 'EUR'
    const fallback = amountIn(money, other)
    return fallback != null ? format(fallback, other, decimals) : null
  }

  function canShowBoth(money: Money): boolean {
    return amountIn(money, 'EUR') != null && amountIn(money, 'CHF') != null
  }

  return { currency, setCurrency, amountIn, formatMoney, canShowBoth }
}
