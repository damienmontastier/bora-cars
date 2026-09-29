export type CurrencyCode = 'EUR' | 'CHF'

const ECB_RATE_URL = 'https://api.frankfurter.dev/v1/latest?base=EUR&symbols=CHF'

export async function fetchEcbChfRate(): Promise<{ rate: number, date: string }> {
  const res = await fetch(ECB_RATE_URL, { cache: 'no-store' })
  if (!res.ok)
    throw new Error(`HTTP ${res.status}`)
  const json = (await res.json()) as { date?: string, rates?: { CHF?: number } }
  const rate = json.rates?.CHF
  if (typeof rate !== 'number' || rate <= 0 || !json.date)
    throw new Error('Réponse inattendue')
  return { rate: Math.round(rate * 10000) / 10000, date: json.date }
}

export function formatAmount(amount: number, currency: CurrencyCode): string {
  return `${amount.toLocaleString('fr-FR')} ${currency === 'EUR' ? '€' : 'CHF'}`
}

export interface CarPriceFields {
  prixJournalier?: number | null
  prixJournalierChf?: number | null
  prixMensuel?: number | null
  prixMensuelChf?: number | null
}

export const LOCATION_CURRENCY = `coalesce(location->currency, select(location->country == "CH" => "CHF", "EUR"))`

export function carMainPrice(car: CarPriceFields, prefer: CurrencyCode = 'EUR'): { amount: number, currency: CurrencyCode, monthly: boolean } | null {
  const pick = (eur?: number | null, chf?: number | null) => {
    const ordered = prefer === 'CHF'
      ? [{ amount: chf, currency: 'CHF' as const }, { amount: eur, currency: 'EUR' as const }]
      : [{ amount: eur, currency: 'EUR' as const }, { amount: chf, currency: 'CHF' as const }]
    const found = ordered.find(o => o.amount != null)
    return found ? { amount: found.amount!, currency: found.currency } : null
  }
  const monthly = pick(car.prixMensuel, car.prixMensuelChf)
  if (monthly)
    return { ...monthly, monthly: true }
  const daily = pick(car.prixJournalier, car.prixJournalierChf)
  return daily ? { ...daily, monthly: false } : null
}

export const hasMonthlyPrice = (car: CarPriceFields) => car.prixMensuel != null || car.prixMensuelChf != null
export const hasDailyPrice = (car: CarPriceFields) => car.prixJournalier != null || car.prixJournalierChf != null
